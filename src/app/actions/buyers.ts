'use server';

import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addBuyer(data: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    state?: string;
    taxId?: string;
}) {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        await prisma.buyer.create({
            data: {
                sellerId: session.sellerId,
                name: data.name,
                email: data.email || null,
                phone: data.phone || null,
                address: data.address || null,
                state: data.state || null,
                taxId: data.taxId || null,
            },
        });

        revalidatePath('/dashboard/buyers');
        return { success: true };
    } catch (error) {
        console.error('Failed to add buyer:', error);
        return { success: false, error: 'Failed to add buyer' };
    }
}

export async function updateBuyer(id: string, data: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    state?: string;
    taxId?: string;
}) {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        // Verify ownership
        const existing = await prisma.buyer.findUnique({
            where: { id },
        });

        if (!existing || existing.sellerId !== session.sellerId) {
            return { success: false, error: 'Buyer not found or unauthorized' };
        }

        await prisma.buyer.update({
            where: { id },
            data: {
                name: data.name,
                email: data.email || null,
                phone: data.phone || null,
                address: data.address || null,
                state: data.state || null,
                taxId: data.taxId || null,
            },
        });

        revalidatePath('/dashboard/buyers');
        return { success: true };
    } catch (error) {
        console.error('Failed to update buyer:', error);
        revalidatePath('/dashboard/buyers');
        return { success: false, error: 'Failed to update buyer' };
    }
}

export async function deleteBuyer(id: string) {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        const existing = await prisma.buyer.findUnique({
            where: { id },
        });

        if (!existing || existing.sellerId !== session.sellerId) {
            return { success: false, error: 'Buyer not found or unauthorized' };
        }

        await prisma.buyer.delete({
            where: { id },
        });

        revalidatePath('/dashboard/buyers');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete buyer:', error);
        return { success: false, error: 'Failed to delete buyer' };
    }
}
