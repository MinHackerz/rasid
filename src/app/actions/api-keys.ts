'use server';

import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export type ApiKey = {
    id: string;
    name: string;
    keyPreview: string; // Only shows masked version like rsd_live_...abc
    templateId: string;
    usage: number;
    limit: number;
    lastUsedAt: Date | null;
    createdAt: Date;
};

// Mask an API key - show first 12 chars and last 4 chars
function maskApiKey(key: string): string {
    if (key.length <= 16) return key;
    return `${key.substring(0, 12)}...${key.substring(key.length - 4)}`;
}

export async function getApiKeys(): Promise<ApiKey[]> {
    const session = await requireAuth();
    if (session.role !== 'OWNER') {
        return [];
    }

    // Use type assertion to work around IDE cache issue
    const keys = await (prisma as any).apiKey.findMany({
        where: { sellerId: session.sellerId },
        orderBy: { createdAt: 'desc' }
    });

    // Return masked keys - full key is never shown after creation
    return keys.map((k: any) => ({
        id: k.id,
        name: k.name,
        keyPreview: maskApiKey(k.key),
        templateId: k.templateId || 'classic',
        usage: k.usage,
        limit: k.limit,
        lastUsedAt: k.lastUsedAt,
        createdAt: k.createdAt,
    }));
}

export async function createApiKey(name: string, templateId: string = 'classic'): Promise<{ success: boolean; key?: string; apiKey?: ApiKey }> {
    const session = await requireAuth();
    if (session.role !== 'OWNER') {
        throw new Error('Unauthorized');
    }

    if (!name) throw new Error('Name is required');

    // Generate Key: rsd_live_<random>
    const random = crypto.randomBytes(24).toString('hex');
    const key = `rsd_live_${random}`;

    // Use type assertion to work around IDE cache issue
    // Use type assertion to work around IDE cache issue
    const newKey = await (prisma as any).apiKey.create({
        data: {
            sellerId: session.sellerId,
            name,
            key,
            templateId,
            limit: 100000 // 1 lakh limit as requested
        }
    });

    revalidatePath('/dashboard/developer');

    // Return the full key ONLY during creation - this is the only time it's visible
    return {
        success: true,
        key,
        apiKey: {
            id: newKey.id,
            name: newKey.name,
            keyPreview: maskApiKey(newKey.key),
            templateId: newKey.templateId || 'classic',
            usage: newKey.usage,
            limit: newKey.limit,
            lastUsedAt: newKey.lastUsedAt,
            createdAt: newKey.createdAt,
        }
    };
}

export async function deleteApiKey(keyId: string) {
    const session = await requireAuth();
    if (session.role !== 'OWNER') {
        throw new Error('Unauthorized');
    }

    // Use type assertion to work around IDE cache issue
    await (prisma as any).apiKey.delete({
        where: { id: keyId, sellerId: session.sellerId }
    });

    revalidatePath('/dashboard/developer');
    return { success: true };
}
