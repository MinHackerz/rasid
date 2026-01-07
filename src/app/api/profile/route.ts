import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { updateProfileSchema } from '@/lib/validations';
import { z } from 'zod';

export async function GET(request: NextRequest) {
    try {
        const session = await requireAuth();

        const seller = await prisma.seller.findUnique({
            where: { id: session.sellerId },
            select: {
                id: true,
                email: true,
                businessName: true,
                logo: true,
                businessAddress: true,
                phone: true,
                taxId: true,
                state: true,
                integrations: true,
                invoiceDefaults: true,
                isActive: true,
            } as any,
        });

        if (!seller) {
            return NextResponse.json(
                { success: false, error: 'Seller not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: seller,
        });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.error('Get profile error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch profile' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await requireAuth();
        const body = await request.json();

        // Validate input
        const validated = updateProfileSchema.parse(body);

        // Update seller
        const updatedSeller = await prisma.seller.update({
            where: { id: session.sellerId },
            data: {
                ...validated,
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                id: updatedSeller.id,
                email: updatedSeller.email,
                businessName: updatedSeller.businessName,
            },
        });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: error.issues[0].message },
                { status: 400 }
            );
        }

        console.error('Update profile error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update profile' },
            { status: 500 }
        );
    }
}
