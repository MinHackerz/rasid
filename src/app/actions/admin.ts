'use server';

import { prisma } from '@/lib/prisma';
import { requireAdminUser, getAdminUser } from '@/lib/admin';
import { revalidatePath } from 'next/cache';
import nodemailer from 'nodemailer';

export async function checkIsAdmin(): Promise<boolean> {
    const admin = await getAdminUser();
    return !!admin;
}

// ────────────────────────────────────────────────────────
// SITE CONFIG
// ────────────────────────────────────────────────────────

export interface SiteConfigDTO {
    offerEnabled: boolean;
    offerText: string | null;
    offerHref: string | null;
    offerBadge: string | null;
    offerStyle: string | null;
    offerBgColor: string | null;
    offerBorder: boolean;
    offerAnimation: string | null;
    // Theme / occasion fields
    themeEnabled: boolean;
    themeName: string | null;
    themeGreeting: string | null;
    themeEmojis: string | null;
    themeColors: string | null;
    themeIntensity: string;
    themeStartDate: string | null;
    themeEndDate: string | null;
    // Admin SMTP config (only sent to admin pages, never public)
    smtpHost?: string | null;
    smtpPort?: string | null;
    smtpUser?: string | null;
    smtpPass?: string | null;
    fromEmail?: string | null;
}

function mapToDTO(config: any | null, includeSmtp = false): SiteConfigDTO {
    if (!config) {
        return {
            offerEnabled: false,
            offerText: null,
            offerHref: null,
            offerBadge: null,
            offerStyle: 'modern',
            offerBgColor: null,
            offerBorder: true,
            offerAnimation: 'slide',
            themeEnabled: false,
            themeName: null,
            themeGreeting: null,
            themeEmojis: null,
            themeColors: null,
            themeIntensity: 'medium',
            themeStartDate: null,
            themeEndDate: null,
        };
    }

    const dto: SiteConfigDTO = {
        offerEnabled: config.offerEnabled ?? false,
        offerText: config.offerText ?? null,
        offerHref: config.offerHref ?? null,
        offerBadge: config.offerBadge ?? null,
        offerStyle: config.offerStyle ?? 'modern',
        offerBgColor: config.offerBgColor ?? null,
        offerBorder: config.offerBorder ?? true,
        offerAnimation: config.offerAnimation ?? 'slide',
        themeEnabled: config.themeEnabled ?? false,
        themeName: config.themeName ?? null,
        themeGreeting: config.themeGreeting ?? null,
        themeEmojis: config.themeEmojis ?? null,
        themeColors: config.themeColors ?? null,
        themeIntensity: config.themeIntensity ?? 'medium',
        themeStartDate: config.themeStartDate ? config.themeStartDate.toISOString() : null,
        themeEndDate: config.themeEndDate ? config.themeEndDate.toISOString() : null,
    };

    if (includeSmtp) {
        dto.smtpHost = config.smtpHost ?? null;
        dto.smtpPort = config.smtpPort ?? '587';
        dto.smtpUser = config.smtpUser ?? null;
        dto.smtpPass = config.smtpPass ?? null;
        dto.fromEmail = config.fromEmail ?? null;
    }

    return dto;
}

export async function getPublicSiteConfig(): Promise<SiteConfigDTO> {
    const config = await (prisma as any).siteConfig.findFirst();
    return mapToDTO(config);
}

export async function getAdminSiteConfig(): Promise<SiteConfigDTO> {
    await requireAdminUser();
    const config = await (prisma as any).siteConfig.findFirst();
    return mapToDTO(config, true); // include SMTP for admin
}

export async function updateSiteConfig(input: SiteConfigDTO): Promise<SiteConfigDTO> {
    await requireAdminUser();

    const existing = await (prisma as any).siteConfig.findFirst();

    const data: any = {
        offerEnabled: !!input.offerEnabled,
        offerText: input.offerText?.trim() || null,
        offerHref: input.offerHref?.trim() || null,
        offerBadge: input.offerBadge?.trim() || null,
        offerStyle: input.offerStyle?.trim() || 'modern',
        offerBgColor: input.offerBgColor?.trim() || null,
        offerBorder: input.offerBorder ?? true,
        offerAnimation: input.offerAnimation?.trim() || 'slide',
        themeEnabled: !!input.themeEnabled,
        themeName: input.themeName?.trim() || null,
        themeGreeting: input.themeGreeting?.trim() || null,
        themeEmojis: input.themeEmojis?.trim() || null,
        themeColors: input.themeColors?.trim() || null,
        themeIntensity: input.themeIntensity || 'medium',
        themeStartDate: input.themeStartDate ? new Date(input.themeStartDate) : null,
        themeEndDate: input.themeEndDate ? new Date(input.themeEndDate) : null,
        // SMTP config
        smtpHost: input.smtpHost?.trim() || null,
        smtpPort: input.smtpPort?.trim() || '587',
        smtpUser: input.smtpUser?.trim() || null,
        smtpPass: input.smtpPass?.trim() || null,
        fromEmail: input.fromEmail?.trim() || null,
    };

    const updated = existing
        ? await (prisma as any).siteConfig.update({
            where: { id: existing.id },
            data,
        })
        : await (prisma as any).siteConfig.create({
            data,
        });

    // Revalidate homepage so changes appear immediately
    revalidatePath('/');

    return mapToDTO(updated, true);
}


// ────────────────────────────────────────────────────────
// ADMIN DASHBOARD DATA
// ────────────────────────────────────────────────────────

export interface AdminOverviewData {
    totalSellers: number;
    totalInvoices: number;
    totalBuyers: number;
    totalTeamMembers: number;
    totalApiKeys: number;
    totalInventoryItems: number;
    totalRevenue: number;
    planDistribution: { plan: string; count: number }[];
    recentSellers: {
        id: string;
        businessName: string;
        email: string;
        plan: string;
        isActive: boolean;
        createdAt: string;
        invoiceCount: number;
    }[];
    recentInvoices: {
        id: string;
        invoiceNumber: string;
        totalAmount: number;
        currency: string;
        paymentStatus: string;
        createdAt: string;
        sellerName: string;
        buyerName: string | null;
    }[];
    invoiceStatusDistribution: { status: string; count: number }[];
    monthlyGrowth: {
        month: string;
        sellers: number;
        invoices: number;
    }[];
    activeSellers: number;
    inactiveSellers: number;
}

export async function getAdminOverviewData(): Promise<AdminOverviewData> {
    await requireAdminUser();

    const [
        totalSellers,
        totalInvoices,
        totalBuyers,
        totalTeamMembers,
        totalApiKeys,
        totalInventoryItems,
        activeSellers,
        inactiveSellers,
        planGroups,
        recentSellersRaw,
        recentInvoicesRaw,
        invoiceStatusGroups,
    ] = await Promise.all([
        prisma.seller.count(),
        prisma.invoice.count(),
        prisma.buyer.count(),
        prisma.teamMember.count(),
        prisma.apiKey.count(),
        (prisma as any).inventoryItem.count(),
        prisma.seller.count({ where: { isActive: true } }),
        prisma.seller.count({ where: { isActive: false } }),
        prisma.seller.groupBy({ by: ['plan'], _count: { plan: true }, orderBy: { _count: { plan: 'desc' } } }),
        prisma.seller.findMany({
            orderBy: { createdAt: 'desc' },
            take: 8,
            include: { _count: { select: { invoices: true } } },
        }),
        prisma.invoice.findMany({
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
                seller: { select: { businessName: true } },
                buyer: { select: { name: true } },
            },
        }),
        prisma.invoice.groupBy({ by: ['paymentStatus'], _count: { paymentStatus: true } }),
    ]);

    const revenueResult = await prisma.invoice.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { totalAmount: true },
    });
    const totalRevenue = Number(revenueResult._sum.totalAmount || 0);

    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const sellersInRange = await prisma.seller.findMany({
        where: { createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true },
    });

    const invoicesInRange = await prisma.invoice.findMany({
        where: { createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true },
    });

    const monthlyGrowthMap = new Map<string, { sellers: number; invoices: number }>();
    for (let i = 0; i < 6; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
        monthlyGrowthMap.set(key, { sellers: 0, invoices: 0 });
    }

    sellersInRange.forEach((s) => {
        const key = s.createdAt.toLocaleString('default', { month: 'short', year: '2-digit' });
        const entry = monthlyGrowthMap.get(key);
        if (entry) entry.sellers++;
    });

    invoicesInRange.forEach((inv) => {
        const key = inv.createdAt.toLocaleString('default', { month: 'short', year: '2-digit' });
        const entry = monthlyGrowthMap.get(key);
        if (entry) entry.invoices++;
    });

    const monthlyGrowth = Array.from(monthlyGrowthMap.entries()).map(([month, data]) => ({
        month,
        ...data,
    }));

    return {
        totalSellers,
        totalInvoices,
        totalBuyers,
        totalTeamMembers,
        totalApiKeys,
        totalInventoryItems,
        totalRevenue,
        activeSellers,
        inactiveSellers,
        planDistribution: planGroups.map((g: any) => ({
            plan: g.plan,
            count: g._count.plan,
        })),
        recentSellers: recentSellersRaw.map((s: any) => ({
            id: s.id,
            businessName: s.businessName,
            email: s.email,
            plan: s.plan,
            isActive: s.isActive,
            createdAt: s.createdAt.toISOString(),
            invoiceCount: s._count.invoices,
        })),
        recentInvoices: recentInvoicesRaw.map((inv: any) => ({
            id: inv.id,
            invoiceNumber: inv.invoiceNumber,
            totalAmount: Number(inv.totalAmount),
            currency: inv.currency,
            paymentStatus: inv.paymentStatus,
            createdAt: inv.createdAt.toISOString(),
            sellerName: inv.seller?.businessName || 'Unknown',
            buyerName: inv.buyer?.name || null,
        })),
        invoiceStatusDistribution: invoiceStatusGroups.map((g: any) => ({
            status: g.paymentStatus,
            count: g._count.paymentStatus,
        })),
        monthlyGrowth,
    };
}


// ────────────────────────────────────────────────────────
// ADMIN USERS LIST (Paginated)
// ────────────────────────────────────────────────────────

export interface AdminUserRow {
    id: string;
    businessName: string;
    email: string;
    plan: string;
    isActive: boolean;
    createdAt: string;
    invoiceCount: number;
    buyerCount: number;
    teamMemberCount: number;
    totalRevenue: number;
}

export interface AdminUsersResponse {
    users: AdminUserRow[];
    total: number;
    page: number;
    pageSize: number;
}

export async function getAdminUsers(
    page: number = 1,
    pageSize: number = 25,
    search: string = '',
    planFilter: string = '',
    statusFilter: string = ''
): Promise<AdminUsersResponse> {
    await requireAdminUser();

    const where: any = {};

    if (search) {
        where.OR = [
            { businessName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
        ];
    }

    if (planFilter) {
        where.plan = planFilter;
    }

    if (statusFilter === 'active') {
        where.isActive = true;
    } else if (statusFilter === 'inactive') {
        where.isActive = false;
    }

    const [total, sellers] = await Promise.all([
        prisma.seller.count({ where }),
        prisma.seller.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: {
                _count: {
                    select: {
                        invoices: true,
                        buyers: true,
                        members: true,
                    },
                },
                invoices: {
                    where: { paymentStatus: 'PAID' },
                    select: { totalAmount: true },
                },
            },
        }),
    ]);

    return {
        users: sellers.map((s: any) => ({
            id: s.id,
            businessName: s.businessName,
            email: s.email,
            plan: s.plan,
            isActive: s.isActive,
            createdAt: s.createdAt.toISOString(),
            invoiceCount: s._count.invoices,
            buyerCount: s._count.buyers,
            teamMemberCount: s._count.members,
            totalRevenue: s.invoices.reduce((sum: number, inv: any) => sum + Number(inv.totalAmount), 0),
        })),
        total,
        page,
        pageSize,
    };
}


// ────────────────────────────────────────────────────────
// ADMIN INVOICES LIST
// ────────────────────────────────────────────────────────

export interface AdminInvoiceRow {
    id: string;
    invoiceNumber: string;
    sellerName: string;
    sellerEmail: string;
    buyerName: string | null;
    totalAmount: number;
    currency: string;
    paymentStatus: string;
    deliveryStatus: string;
    createdAt: string;
}

export interface AdminInvoicesResponse {
    invoices: AdminInvoiceRow[];
    total: number;
    page: number;
    pageSize: number;
}

export async function getAdminInvoices(
    page: number = 1,
    pageSize: number = 25,
    search: string = '',
    statusFilter: string = ''
): Promise<AdminInvoicesResponse> {
    await requireAdminUser();

    const where: any = {};

    if (search) {
        where.OR = [
            { invoiceNumber: { contains: search, mode: 'insensitive' } },
            { seller: { businessName: { contains: search, mode: 'insensitive' } } },
        ];
    }

    if (statusFilter) {
        where.paymentStatus = statusFilter;
    }

    const [total, invoices] = await Promise.all([
        prisma.invoice.count({ where }),
        prisma.invoice.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: {
                seller: { select: { businessName: true, email: true } },
                buyer: { select: { name: true } },
            },
        }),
    ]);

    return {
        invoices: invoices.map((inv: any) => ({
            id: inv.id,
            invoiceNumber: inv.invoiceNumber,
            sellerName: inv.seller?.businessName || 'Unknown',
            sellerEmail: inv.seller?.email || '',
            buyerName: inv.buyer?.name || null,
            totalAmount: Number(inv.totalAmount),
            currency: inv.currency,
            paymentStatus: inv.paymentStatus,
            deliveryStatus: inv.deliveryStatus,
            createdAt: inv.createdAt.toISOString(),
        })),
        total,
        page,
        pageSize,
    };
}


// ────────────────────────────────────────────────────────
// ADMIN TOGGLE USER STATUS
// ────────────────────────────────────────────────────────

export async function toggleUserStatus(userId: string): Promise<{ success: boolean; isActive: boolean }> {
    await requireAdminUser();

    const seller = await prisma.seller.findUnique({ where: { id: userId } });
    if (!seller) throw new Error('User not found');

    const updated = await prisma.seller.update({
        where: { id: userId },
        data: { isActive: !seller.isActive },
    });

    return { success: true, isActive: updated.isActive };
}


// ────────────────────────────────────────────────────────
// ADMIN CHANGE USER PLAN
// ────────────────────────────────────────────────────────

export async function changeUserPlan(userId: string, plan: string): Promise<{ success: boolean }> {
    await requireAdminUser();

    await prisma.seller.update({
        where: { id: userId },
        data: { plan: plan as any },
    });

    return { success: true };
}


// ────────────────────────────────────────────────────────
// ADMIN SEND EMAIL TO SELLER (Platform-level email)
// ────────────────────────────────────────────────────────

export interface AdminEmailInput {
    sellerId: string;
    subject: string;
    body: string; // HTML body
}

export async function sendAdminEmail(input: AdminEmailInput): Promise<{ success: boolean; error?: string }> {
    await requireAdminUser();

    const seller = await prisma.seller.findUnique({
        where: { id: input.sellerId },
        select: { email: true, businessName: true },
    });

    if (!seller) {
        return { success: false, error: 'Seller not found' };
    }

    // Read SMTP config from database first, fallback to env vars
    const siteConfig = await (prisma as any).siteConfig.findFirst();
    const smtpHost = siteConfig?.smtpHost || process.env.SMTP_HOST;
    const smtpPort = siteConfig?.smtpPort || process.env.SMTP_PORT || '587';
    const smtpUser = siteConfig?.smtpUser || process.env.SMTP_USER;
    const smtpPass = siteConfig?.smtpPass || process.env.SMTP_PASS;
    const fromEmail = siteConfig?.fromEmail || process.env.ADMIN_EMAIL || smtpUser;

    if (!smtpHost || !smtpUser || !smtpPass) {
        return { success: false, error: 'Platform SMTP not configured. Configure SMTP in Site & Marketing → Email Settings.' };
    }

    try {
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: parseInt(smtpPort),
            secure: parseInt(smtpPort) === 465,
            auth: { user: smtpUser, pass: smtpPass },
        });

        const htmlContent = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: auto; padding: 32px 24px; background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin: 0;">Rasid Platform</h2>
                    <p style="color: #6b7280; font-size: 12px; margin: 4px 0 0;">Official Communication</p>
                </div>
                <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 16px 0;" />
                <div style="color: #374151; font-size: 15px; line-height: 1.7;">
                    ${input.body}
                </div>
                <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                    Sent from Rasid Admin · <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://rasid.app'}" style="color: #6366f1;">rasid.app</a>
                </p>
            </div>
        `;

        await transporter.sendMail({
            from: `"Rasid Platform" <${fromEmail}>`,
            to: seller.email,
            subject: input.subject,
            html: htmlContent,
        });

        return { success: true };
    } catch (error) {
        console.error('Admin email error:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' };
    }
}

// Bulk send to multiple sellers
export async function sendBulkAdminEmail(input: {
    sellerIds: string[];
    subject: string;
    body: string;
}): Promise<{ sent: number; failed: number; errors: string[] }> {
    await requireAdminUser();

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const sellerId of input.sellerIds) {
        const result = await sendAdminEmail({ sellerId, subject: input.subject, body: input.body });
        if (result.success) {
            sent++;
        } else {
            failed++;
            errors.push(`${sellerId}: ${result.error}`);
        }
    }

    return { sent, failed, errors };
}


// ────────────────────────────────────────────────────────
// ADMIN GET SELLERS FOR EMAIL (quick list)
// ────────────────────────────────────────────────────────

export interface EmailableSeller {
    id: string;
    businessName: string;
    email: string;
    plan: string;
    isActive: boolean;
    subscriptionEndsAt: string | null;
}

export async function getEmailableSellers(
    search: string = '',
    planFilter: string = '',
    expiryFilter: string = ''
): Promise<EmailableSeller[]> {
    await requireAdminUser();

    const where: any = {};

    if (search) {
        where.OR = [
            { businessName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
        ];
    }
    if (planFilter) {
        where.plan = planFilter;
    }

    // Expiry-based filters
    if (expiryFilter === '7days') {
        const now = new Date();
        const in7Days = new Date();
        in7Days.setDate(now.getDate() + 7);
        where.subscriptionEndsAt = { gte: now, lte: in7Days };
    } else if (expiryFilter === 'lastday') {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        where.subscriptionEndsAt = { gte: todayStart, lte: todayEnd };
    } else if (expiryFilter === 'expired') {
        where.subscriptionEndsAt = { lt: new Date() };
    }

    const sellers = await prisma.seller.findMany({
        where,
        select: { id: true, businessName: true, email: true, plan: true, isActive: true, subscriptionEndsAt: true },
        orderBy: { businessName: 'asc' },
        take: 100,
    });

    return sellers.map((s) => ({
        ...s,
        subscriptionEndsAt: s.subscriptionEndsAt ? s.subscriptionEndsAt.toISOString() : null,
    }));
}
