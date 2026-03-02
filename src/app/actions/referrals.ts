/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { prisma } from '@/lib/prisma';
import { requireAdminUser } from '@/lib/admin';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';
import { PLAN_REFERRAL_REWARDS } from '@/lib/constants/referral-rewards';
import { currentUser, clerkClient } from '@clerk/nextjs/server';

// ────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────

export interface ReferralRow {
    id: string;
    code: string;
    referrerName: string;
    referrerEmail: string;
    description: string | null;
    rewardType: string;
    rewardValue: string | null;
    isActive: boolean;
    clicks: number;
    signups: number;
    conversions: number;
    maxUses: number | null;
    expiresAt: string | null;
    createdAt: string;
    totalEarned: number;
    totalPaid: number;
    payoutDay: number;
    accessToken: string | null;
}

export interface ReferralsResponse {
    referrals: ReferralRow[];
    total: number;
    page: number;
    pageSize: number;
}

export interface ReferralInput {
    code: string;
    referrerName: string;
    referrerEmail: string;
    description?: string;
    rewardType: string;
    rewardValue?: string;
    maxUses?: number | null;
    expiresAt?: string | null;
}

// ────────────────────────────────────────────────────────
// LIST REFERRALS (ADMIN)
// ────────────────────────────────────────────────────────

export async function getAdminReferrals(
    page: number = 1,
    pageSize: number = 25,
    search: string = '',
    statusFilter: string = ''
): Promise<ReferralsResponse> {
    await requireAdminUser();

    const where: any = {};

    if (search) {
        where.OR = [
            { code: { contains: search, mode: 'insensitive' } },
            { referrerName: { contains: search, mode: 'insensitive' } },
            { referrerEmail: { contains: search, mode: 'insensitive' } },
        ];
    }

    if (statusFilter === 'active') {
        where.isActive = true;
    } else if (statusFilter === 'inactive') {
        where.isActive = false;
    }

    const [total, referrals] = await Promise.all([
        prisma.referral.count({ where }),
        prisma.referral.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
    ]);

    return {
        referrals: referrals.map((r: any) => ({
            id: r.id,
            code: r.code,
            referrerName: r.referrerName,
            referrerEmail: r.referrerEmail,
            description: r.description,
            rewardType: r.rewardType,
            rewardValue: r.rewardValue,
            isActive: r.isActive,
            clicks: r.clicks,
            signups: r.signups,
            conversions: r.conversions,
            maxUses: r.maxUses,
            expiresAt: r.expiresAt ? r.expiresAt.toISOString() : null,
            createdAt: r.createdAt.toISOString(),
            totalEarned: Number(r.totalEarned),
            totalPaid: Number(r.totalPaid),
            payoutDay: r.payoutDay,
            accessToken: r.accessToken,
        })),
        total,
        page,
        pageSize,
    };
}

// ────────────────────────────────────────────────────────
// CREATE REFERRAL (ADMIN)
// ────────────────────────────────────────────────────────

export async function createReferral(input: ReferralInput): Promise<{ success: boolean; error?: string }> {
    await requireAdminUser();

    const existing = await prisma.referral.findUnique({ where: { code: input.code.toUpperCase() } });
    if (existing) {
        return { success: false, error: 'A referral with this code already exists.' };
    }

    // Generate a unique access token for referrer portal
    const accessToken = crypto.randomBytes(32).toString('hex');

    await prisma.referral.create({
        data: {
            code: input.code.toUpperCase().trim(),
            referrerName: input.referrerName.trim(),
            referrerEmail: input.referrerEmail.trim().toLowerCase(),
            description: input.description?.trim() || null,
            rewardType: input.rewardType,
            rewardValue: input.rewardValue?.trim() || null,
            maxUses: input.maxUses || null,
            expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
            accessToken,
        },
    });

    revalidatePath('/admin/referrals');
    return { success: true };
}

// ────────────────────────────────────────────────────────
// UPDATE REFERRAL (ADMIN)
// ────────────────────────────────────────────────────────

export async function updateReferral(
    id: string,
    input: Partial<ReferralInput>
): Promise<{ success: boolean; error?: string }> {
    await requireAdminUser();

    const data: any = {};
    if (input.code !== undefined) data.code = input.code.toUpperCase().trim();
    if (input.referrerName !== undefined) data.referrerName = input.referrerName.trim();
    if (input.referrerEmail !== undefined) data.referrerEmail = input.referrerEmail.trim().toLowerCase();
    if (input.description !== undefined) data.description = input.description?.trim() || null;
    if (input.rewardType !== undefined) data.rewardType = input.rewardType;
    if (input.rewardValue !== undefined) data.rewardValue = input.rewardValue?.trim() || null;
    if (input.maxUses !== undefined) data.maxUses = input.maxUses || null;
    if (input.expiresAt !== undefined) data.expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;

    await prisma.referral.update({ where: { id }, data });

    revalidatePath('/admin/referrals');
    return { success: true };
}

// ────────────────────────────────────────────────────────
// TOGGLE STATUS (ADMIN)
// ────────────────────────────────────────────────────────

export async function toggleReferralStatus(id: string): Promise<{ success: boolean; isActive: boolean }> {
    await requireAdminUser();

    const referral = await prisma.referral.findUnique({ where: { id } });
    if (!referral) throw new Error('Referral not found');

    const updated = await prisma.referral.update({
        where: { id },
        data: { isActive: !referral.isActive },
    });

    revalidatePath('/admin/referrals');
    return { success: true, isActive: updated.isActive };
}

// ────────────────────────────────────────────────────────
// DELETE REFERRAL (ADMIN)
// ────────────────────────────────────────────────────────

export async function deleteReferral(id: string): Promise<{ success: boolean }> {
    await requireAdminUser();

    await prisma.referral.delete({ where: { id } });

    revalidatePath('/admin/referrals');
    return { success: true };
}

// ────────────────────────────────────────────────────────
// GET REFERRAL STATS SUMMARY (ADMIN)
// ────────────────────────────────────────────────────────

export interface ReferralStats {
    totalReferrals: number;
    activeReferrals: number;
    totalClicks: number;
    totalSignups: number;
    totalConversions: number;
}

export async function getReferralStats(): Promise<ReferralStats> {
    await requireAdminUser();

    const [totalReferrals, activeReferrals, aggregate] = await Promise.all([
        prisma.referral.count(),
        prisma.referral.count({ where: { isActive: true } }),
        prisma.referral.aggregate({
            _sum: { clicks: true, signups: true, conversions: true },
        }),
    ]);

    return {
        totalReferrals,
        activeReferrals,
        totalClicks: aggregate._sum.clicks || 0,
        totalSignups: aggregate._sum.signups || 0,
        totalConversions: aggregate._sum.conversions || 0,
    };
}

// ────────────────────────────────────────────────────────
// PUBLIC: GET REFERRAL BY CODE (for referral landing page)
// ────────────────────────────────────────────────────────

export async function getPublicReferral(code: string): Promise<{
    code: string;
    referrerName: string;
    rewardType: string;
    rewardValue: string | null;
    description: string | null;
} | null> {
    const referral = await prisma.referral.findUnique({
        where: { code: code.toUpperCase() },
    });

    if (!referral || !referral.isActive) return null;
    if (referral.expiresAt && new Date(referral.expiresAt) < new Date()) return null;
    if (referral.maxUses && referral.signups >= referral.maxUses) return null;

    return {
        code: referral.code,
        referrerName: referral.referrerName,
        rewardType: referral.rewardType,
        rewardValue: referral.rewardValue,
        description: referral.description,
    };
}

// ────────────────────────────────────────────────────────
// PUBLIC: TRACK CLICK
// ────────────────────────────────────────────────────────

export async function trackReferralClick(code: string): Promise<void> {
    try {
        await prisma.referral.update({
            where: { code: code.toUpperCase() },
            data: { clicks: { increment: 1 } },
        });
    } catch {
        // silently fail
    }
}

// ────────────────────────────────────────────────────────
// REFERRER PORTAL: Get referrer data by access token
// ────────────────────────────────────────────────────────

export interface ReferrerPortalData {
    id: string;
    code: string;
    referrerName: string;
    referrerEmail: string;
    rewardType: string;
    rewardValue: string | null;
    clicks: number;
    signups: number;
    conversions: number;
    totalEarned: number;
    totalPaid: number;
    pendingBalance: number;
    payoutDay: number;
    nextPayoutDate: string;
    isActive: boolean;
    paymentMethods: {
        id: string;
        type: string;
        label: string | null;
        upiId: string | null;
        paypalEmail: string | null;
        isDefault: boolean;
    }[];
    payouts: {
        id: string;
        amount: number;
        status: string;
        method: string | null;
        reference: string | null;
        note: string | null;
        receiptUrl: string | null;
        scheduledAt: string;
        paidAt: string | null;
    }[];
}

export async function getReferrerPortalData(token: string): Promise<ReferrerPortalData | null> {
    if (!token) return null;

    const referral = await prisma.referral.findUnique({
        where: { accessToken: token },
        include: {
            paymentMethods: { orderBy: { createdAt: 'desc' } },
            payouts: { orderBy: { scheduledAt: 'desc' }, take: 20 },
        },
    });

    if (!referral) return null;

    const totalEarned = Number(referral.totalEarned);
    const totalPaid = Number(referral.totalPaid);

    // Calculate next payout date
    const now = new Date();
    let nextPayout = new Date(now.getFullYear(), now.getMonth(), referral.payoutDay);
    if (nextPayout <= now) {
        nextPayout = new Date(now.getFullYear(), now.getMonth() + 1, referral.payoutDay);
    }

    return {
        id: referral.id,
        code: referral.code,
        referrerName: referral.referrerName,
        referrerEmail: referral.referrerEmail,
        rewardType: referral.rewardType,
        rewardValue: referral.rewardValue,
        clicks: referral.clicks,
        signups: referral.signups,
        conversions: referral.conversions,
        totalEarned,
        totalPaid,
        pendingBalance: totalEarned - totalPaid,
        payoutDay: referral.payoutDay,
        nextPayoutDate: nextPayout.toISOString(),
        isActive: referral.isActive,
        paymentMethods: referral.paymentMethods.map((pm: any) => ({
            id: pm.id,
            type: pm.type,
            label: pm.label,
            upiId: pm.upiId,
            paypalEmail: pm.paypalEmail,
            isDefault: pm.isDefault,
        })),
        payouts: referral.payouts.map((p: any) => ({
            id: p.id,
            amount: Number(p.amount),
            status: p.status,
            method: p.method,
            reference: p.reference,
            note: p.note,
            receiptUrl: p.receiptUrl,
            scheduledAt: p.scheduledAt.toISOString(),
            paidAt: p.paidAt ? p.paidAt.toISOString() : null,
        })),
    };
}

// ────────────────────────────────────────────────────────
// REFERRER PORTAL: Add Payment Method
// ────────────────────────────────────────────────────────

export async function addReferralPaymentMethod(
    token: string,
    input: { type: 'upi' | 'paypal'; label?: string; upiId?: string; paypalEmail?: string }
): Promise<{ success: boolean; error?: string }> {
    const referral = await prisma.referral.findUnique({ where: { accessToken: token } });
    if (!referral) return { success: false, error: 'Invalid token' };

    if (input.type === 'upi' && !input.upiId) {
        return { success: false, error: 'UPI ID is required' };
    }
    if (input.type === 'paypal' && !input.paypalEmail) {
        return { success: false, error: 'PayPal email is required' };
    }

    // Check if first payment method => make it default
    const existingCount = await prisma.referralPaymentMethod.count({
        where: { referralId: referral.id },
    });

    await prisma.referralPaymentMethod.create({
        data: {
            referralId: referral.id,
            type: input.type,
            label: input.label?.trim() || (input.type === 'upi' ? 'UPI' : 'PayPal'),
            upiId: input.upiId?.trim() || null,
            paypalEmail: input.paypalEmail?.trim().toLowerCase() || null,
            isDefault: existingCount === 0,
        },
    });

    return { success: true };
}

// ────────────────────────────────────────────────────────
// REFERRER PORTAL: Remove Payment Method
// ────────────────────────────────────────────────────────

export async function removeReferralPaymentMethod(
    token: string,
    methodId: string
): Promise<{ success: boolean; error?: string }> {
    const referral = await prisma.referral.findUnique({ where: { accessToken: token } });
    if (!referral) return { success: false, error: 'Invalid token' };

    const method = await prisma.referralPaymentMethod.findFirst({
        where: { id: methodId, referralId: referral.id },
    });
    if (!method) return { success: false, error: 'Payment method not found' };

    await prisma.referralPaymentMethod.delete({ where: { id: methodId } });

    // If it was the default, make the next one default
    if (method.isDefault) {
        const next = await prisma.referralPaymentMethod.findFirst({
            where: { referralId: referral.id },
        });
        if (next) {
            await prisma.referralPaymentMethod.update({
                where: { id: next.id },
                data: { isDefault: true },
            });
        }
    }

    return { success: true };
}

// ────────────────────────────────────────────────────────
// REFERRER PORTAL: Set Default Payment Method
// ────────────────────────────────────────────────────────

export async function setDefaultReferralPaymentMethod(
    token: string,
    methodId: string
): Promise<{ success: boolean; error?: string }> {
    const referral = await prisma.referral.findUnique({ where: { accessToken: token } });
    if (!referral) return { success: false, error: 'Invalid token' };

    // Unset all defaults
    await prisma.referralPaymentMethod.updateMany({
        where: { referralId: referral.id },
        data: { isDefault: false },
    });

    // Set new default
    await prisma.referralPaymentMethod.update({
        where: { id: methodId },
        data: { isDefault: true },
    });

    return { success: true };
}

// ────────────────────────────────────────────────────────
// REFERRAL APPLICATION: Submit (User-facing)
// ────────────────────────────────────────────────────────

export interface ReferralApplicationInput {
    reason?: string;
    preferredReward: string;
    socialLinks?: string;
}

export async function submitReferralApplication(
    userId: string,
    userName: string,
    userEmail: string,
    input: ReferralApplicationInput
): Promise<{ success: boolean; error?: string }> {
    if (!userId || !userEmail) {
        return { success: false, error: 'You must be logged in to apply.' };
    }

    // Check if already applied
    const existing = await prisma.referralApplication.findUnique({
        where: { userId },
    });

    if (existing) {
        if (existing.status === 'approved') {
            return { success: false, error: 'You are already an approved referrer!' };
        }
        if (existing.status === 'pending') {
            return { success: false, error: 'You already have a pending application.' };
        }
        // If rejected, allow reapplication by updating
        await prisma.referralApplication.update({
            where: { userId },
            data: {
                reason: input.reason?.trim() || null,
                preferredReward: input.preferredReward,
                socialLinks: input.socialLinks?.trim() || null,
                status: 'pending',
                adminNote: null,
                userName: userName.trim(),
                userEmail: userEmail.trim().toLowerCase(),
            },
        });
        return { success: true };
    }

    await prisma.referralApplication.create({
        data: {
            userId,
            userName: userName.trim(),
            userEmail: userEmail.trim().toLowerCase(),
            reason: input.reason?.trim() || null,
            preferredReward: input.preferredReward,
            socialLinks: input.socialLinks?.trim() || null,
        },
    });

    return { success: true };
}

// ────────────────────────────────────────────────────────
// REFERRAL APPLICATION: Get user's own application status
// ────────────────────────────────────────────────────────

export interface UserApplicationStatus {
    status: 'none' | 'pending' | 'approved' | 'rejected';
    adminNote?: string | null;
    referralCode?: string | null;
    portalToken?: string | null;
    createdAt?: string;
}

export async function getUserApplicationStatus(userId: string): Promise<UserApplicationStatus> {
    if (!userId) return { status: 'none' };

    const app = await prisma.referralApplication.findUnique({
        where: { userId },
    });

    if (!app) return { status: 'none' };

    let referralCode: string | null = null;
    let portalToken: string | null = null;

    if (app.status === 'approved' && app.referralId) {
        const referral = await prisma.referral.findUnique({
            where: { id: app.referralId },
            select: { code: true, accessToken: true },
        });
        referralCode = referral?.code || null;
        portalToken = referral?.accessToken || null;
    }

    return {
        status: app.status as any,
        adminNote: app.adminNote,
        referralCode,
        portalToken,
        createdAt: app.createdAt.toISOString(),
    };
}

// ────────────────────────────────────────────────────────
// ADMIN: List Referral Applications
// ────────────────────────────────────────────────────────

export interface ReferralApplicationRow {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    reason: string | null;
    preferredReward: string;
    socialLinks: string | null;
    status: string;
    adminNote: string | null;
    referralId: string | null;
    createdAt: string;
}

export async function getAdminReferralApplications(
    statusFilter: string = '',
    search: string = ''
): Promise<{ applications: ReferralApplicationRow[]; total: number }> {
    await requireAdminUser();

    const where: any = {};
    if (statusFilter) where.status = statusFilter;
    if (search) {
        where.OR = [
            { userName: { contains: search, mode: 'insensitive' } },
            { userEmail: { contains: search, mode: 'insensitive' } },
        ];
    }

    const [total, applications] = await Promise.all([
        prisma.referralApplication.count({ where }),
        prisma.referralApplication.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        }),
    ]);

    return {
        total,
        applications: applications.map((a: any) => ({
            id: a.id,
            userId: a.userId,
            userName: a.userName,
            userEmail: a.userEmail,
            reason: a.reason,
            preferredReward: a.preferredReward,
            socialLinks: a.socialLinks,
            status: a.status,
            adminNote: a.adminNote,
            referralId: a.referralId,
            createdAt: a.createdAt.toISOString(),
        })),
    };
}

// ────────────────────────────────────────────────────────
// ADMIN: Approve Referral Application
// ────────────────────────────────────────────────────────

export async function approveReferralApplication(
    applicationId: string,
    adminNote?: string,
    customCode?: string
): Promise<{ success: boolean; error?: string }> {
    await requireAdminUser();

    const app = await prisma.referralApplication.findUnique({
        where: { id: applicationId },
    });
    if (!app) return { success: false, error: 'Application not found.' };
    if (app.status === 'approved') return { success: false, error: 'Already approved.' };

    // Generate referral code from user name or custom
    const baseCode = customCode
        ? customCode.toUpperCase().trim().replace(/[^A-Z0-9_-]/g, '')
        : app.userName.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 8) + Math.random().toString(36).substring(2, 6).toUpperCase();

    // Check for existing code
    const existingRef = await prisma.referral.findUnique({ where: { code: baseCode } });
    if (existingRef) {
        return { success: false, error: `Referral code "${baseCode}" already exists. Provide a custom code.` };
    }

    const accessToken = crypto.randomBytes(32).toString('hex');

    // Determine reward based on preferred reward type
    const rewardValue = PLAN_REFERRAL_REWARDS['PRO'][app.preferredReward as keyof typeof PLAN_REFERRAL_REWARDS['PRO']] || '10%';

    // Create the referral
    const referral = await prisma.referral.create({
        data: {
            code: baseCode,
            referrerName: app.userName,
            referrerEmail: app.userEmail,
            rewardType: app.preferredReward,
            rewardValue,
            accessToken,
        },
    });

    // Update application
    await prisma.referralApplication.update({
        where: { id: applicationId },
        data: {
            status: 'approved',
            adminNote: adminNote?.trim() || 'Your referral application has been approved!',
            referralId: referral.id,
        },
    });

    revalidatePath('/admin/referrals');
    return { success: true };
}

// ────────────────────────────────────────────────────────
// ADMIN: Reject Referral Application
// ────────────────────────────────────────────────────────

export async function rejectReferralApplication(
    applicationId: string,
    adminNote?: string
): Promise<{ success: boolean; error?: string }> {
    await requireAdminUser();

    await prisma.referralApplication.update({
        where: { id: applicationId },
        data: {
            status: 'rejected',
            adminNote: adminNote?.trim() || 'Your application was not approved at this time.',
        },
    });

    revalidatePath('/admin/referrals');
    return { success: true };
}

// ────────────────────────────────────────────────────────
// ADMIN: Get Referrers for Payout Info
// ────────────────────────────────────────────────────────
export interface PayoutReferrerRow {
    id: string;
    code: string;
    referrerName: string;
    referrerEmail: string;
    totalEarned: number;
    totalPaid: number;
    pendingBalance: number;
    paymentMethods: any[];
    payouts: any[];
}

export async function getAdminPayouts(): Promise<PayoutReferrerRow[]> {
    await requireAdminUser();

    const referrals = await prisma.referral.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            paymentMethods: true,
            payouts: { orderBy: { createdAt: 'desc' } }
        }
    });

    return referrals.map((r: any) => ({
        id: r.id,
        code: r.code,
        referrerName: r.referrerName,
        referrerEmail: r.referrerEmail,
        totalEarned: Number(r.totalEarned),
        totalPaid: Number(r.totalPaid),
        pendingBalance: Number(r.totalEarned) - Number(r.totalPaid),
        paymentMethods: r.paymentMethods,
        payouts: r.payouts.map((p: any) => ({
            ...p,
            amount: Number(p.amount)
        }))
    }));
}

// ────────────────────────────────────────────────────────
// ADMIN: Record Referral Payout
// ────────────────────────────────────────────────────────
export async function recordReferralPayout(
    referralId: string,
    amount: number,
    method: string,
    reference: string,
    note: string,
    receiptUrl: string | null
): Promise<{ success: boolean; error?: string }> {
    await requireAdminUser();

    try {
        await prisma.$transaction(async (tx: any) => {
            await tx.referralPayout.create({
                data: {
                    referralId,
                    amount,
                    status: 'completed',
                    method,
                    reference: reference || null,
                    note: note || null,
                    receiptUrl: receiptUrl || null,
                    scheduledAt: new Date(),
                    paidAt: new Date(),
                }
            });

            await tx.referral.update({
                where: { id: referralId },
                data: { totalPaid: { increment: amount } }
            });
        });

        revalidatePath('/admin/referrals');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || 'Failed to record payout' };
    }
}

// ────────────────────────────────────────────────────────
// PUBLIC/USER: Sync Referral Code to Clerk Metadata
// ────────────────────────────────────────────────────────

export async function syncReferralToClerk(code: string): Promise<{ success: boolean; error?: string }> {
    const user = await currentUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    // If user already has a referral code in Clerk, skip
    if (user.unsafeMetadata?.referralCode) {
        return { success: true };
    }

    try {
        const referral = await prisma.referral.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (!referral || !referral.isActive) {
            return { success: false, error: 'Invalid or inactive referral code' };
        }

        // 1. Update Clerk Metadata
        const clerk = await clerkClient();
        await clerk.users.updateUserMetadata(user.id, {
            unsafeMetadata: { referralCode: code.toUpperCase() }
        });

        // 2. Increment signup count
        await prisma.referral.update({
            where: { id: referral.id },
            data: { signups: { increment: 1 } }
        });

        // 3. Update Seller if already created without the code
        await prisma.seller.updateMany({
            where: { clerkUserId: user.id },
            data: { referredByCode: code.toUpperCase() }
        });

        return { success: true };
    } catch (err) {
        console.error('Failed syncing referral to clerk:', err);
        return { success: false, error: 'Internal error' };
    }
}
