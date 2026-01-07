import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const createPaymentMethodSchema = z.object({
    type: z.string(),
    details: z.any(),
    isEnabled: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
    try {
        const session = await requireAuth();

        const methods = await (prisma as any).paymentMethod.findMany({
            where: { sellerId: session.sellerId },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({
            success: true,
            data: methods,
        });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({ success: false, error: 'Failed to fetch payment methods' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await requireAuth();
        const body = await request.json();
        // Force validated type to match expectations if needed
        const validated = createPaymentMethodSchema.parse(body);

        // If this method is enabled, disable all others
        if (validated.isEnabled) {
            await (prisma as any).paymentMethod.updateMany({
                where: { sellerId: session.sellerId },
                data: { isEnabled: false },
            });
        }

        const method = await (prisma as any).paymentMethod.create({
            data: {
                sellerId: session.sellerId,
                type: validated.type,
                details: validated.details,
                isEnabled: validated.isEnabled || false,
            },
        });

        return NextResponse.json({
            success: true,
            data: method,
        });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: error.issues[0].message }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: 'Failed to create payment method' }, { status: 500 });
    }
}
