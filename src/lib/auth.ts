import { currentUser } from '@clerk/nextjs/server';
import { prisma } from './prisma';
import type { AuthSession } from '@/types';
import { cookies } from 'next/headers';

export async function getSession(): Promise<AuthSession | null> {
    const user = await currentUser();
    if (!user) return null;

    // Fetch all businesses owned by this user
    const sellers = await prisma.seller.findMany({
        where: { clerkUserId: user.id },
        select: { id: true, email: true, businessName: true, isActive: true },
    });

    if (!sellers || sellers.length === 0) {
        return null;
    }

    // Determine active business
    const cookieStore = await cookies();
    const activeBusinessId = cookieStore.get('rashid-active-business')?.value;

    let activeSeller = sellers[0];

    if (activeBusinessId) {
        const found = sellers.find(s => s.id === activeBusinessId);
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

    return prisma.seller.findMany({
        where: { clerkUserId: user.id },
        select: { id: true, businessName: true },
        orderBy: { createdAt: 'desc' }
    });
}
