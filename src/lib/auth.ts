import { currentUser } from '@clerk/nextjs/server';
import { prisma } from './prisma';
import type { AuthSession } from '@/types';
import { cookies } from 'next/headers';
import { cache } from 'react';
import type { PlanType } from '@/lib/constants/plans';

export async function getSession(): Promise<AuthSession | null> {
    const user = await currentUser();
    if (!user) return null;

    const userEmail = user.emailAddresses[0]?.emailAddress;

    // 1. Fetch owned businesses
    const ownedSellers = await prisma.seller.findMany({
        where: { clerkUserId: user.id },
        select: { id: true, email: true, businessName: true, isActive: true },
    });

    // 2. Fetch member businesses
    let memberSellers: any[] = [];
    if (userEmail) {
        // Auto-accept pending invites for this email (Case Insensitive)
        const pendingInvites = await prisma.teamMember.findMany({
            where: {
                email: { equals: userEmail, mode: 'insensitive' },
                status: 'PENDING'
            }
        });

        if (pendingInvites.length > 0) {
            // Update each pending invite
            // Note: updateMany doesn't support insensitive directly in 'where' in all prisma versions effectively for safety, 
            // but we can use the IDs we just found.
            await prisma.teamMember.updateMany({
                where: {
                    id: { in: pendingInvites.map(p => p.id) }
                },
                data: { status: 'ACCEPTED' }
            });
        }

        const memberships = await prisma.teamMember.findMany({
            where: {
                email: { equals: userEmail, mode: 'insensitive' }
            },
            include: {
                seller: {
                    select: { id: true, email: true, businessName: true, isActive: true }
                }
            }
        });

        memberSellers = memberships.map(m => ({
            ...m.seller,
            role: m.role, // 'ADMIN' | 'VIEWER'
            // Ensure we use the correct team member email case if needed, but session usually uses user's email
        }));
    }

    const allSellers = [
        ...ownedSellers.map(s => ({ ...s, role: 'OWNER' })),
        ...memberSellers
    ];

    if (allSellers.length === 0) {
        return null;
    }

    // Determine active business
    const cookieStore = await cookies();
    const activeBusinessId = cookieStore.get('rashid-active-business')?.value;

    let activeSeller = allSellers[0];

    if (activeBusinessId) {
        const found = allSellers.find(s => s.id === activeBusinessId);
        if (found) {
            activeSeller = found;
        }
    }

    if (!activeSeller.isActive) {
        return null;
    }

    return {
        sellerId: activeSeller.id,
        email: activeSeller.email,
        businessName: activeSeller.businessName,
        role: activeSeller.role as 'OWNER' | 'ADMIN' | 'VIEWER',
    };
}

export async function requireAuth(): Promise<AuthSession> {
    const session = await getSession();
    if (!session) {
        throw new Error('Unauthorized');
    }
    return session;
}

// Helper to get all businesses for UI switcher
export async function getUserBusinesses() {
    const user = await currentUser();
    if (!user) return [];

    const userEmail = user.emailAddresses[0]?.emailAddress;

    const owned = await prisma.seller.findMany({
        where: { clerkUserId: user.id },
        select: { id: true, businessName: true },
        orderBy: { createdAt: 'desc' }
    });

    let memberBusinesses: any[] = [];
    if (userEmail) {
        const memberships = await prisma.teamMember.findMany({
            where: {
                email: { equals: userEmail, mode: 'insensitive' }
            },
            include: { seller: { select: { id: true, businessName: true } } }
        });
        memberBusinesses = memberships.map(m => ({ ...m.seller, role: m.role }));
    }

    // Combine and deduplicate
    const all = [...owned.map(s => ({ ...s, role: 'OWNER' })), ...memberBusinesses];
    const unique = Array.from(new Map(all.map(item => [item.id, item])).values());

    return unique;
}

// Cached helper to get user's plan - prevents duplicate DB queries in the same request
export const getUserPlan = cache(async (): Promise<PlanType> => {
    const session = await getSession();
    if (!session) return 'FREE';

    const seller = await (prisma.seller as any).findUnique({
        where: { id: session.sellerId },
        select: { plan: true }
    });

    return (seller?.plan || 'FREE') as PlanType;
});
