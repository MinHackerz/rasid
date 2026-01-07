import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const updatePaymentMethodSchema = z.object({
    type: z.string().optional(),
    details: z.any().optional(),
    isEnabled: z.boolean().optional(),
});

export async function PATCH(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await requireAuth();
        const body = await request.json();
        const validated = updatePaymentMethodSchema.parse(body);

        const method = await (prisma as any).paymentMethod.findUnique({
            where: { id: params.id },
        });

        if (!method || method.sellerId !== session.sellerId) {
            return NextResponse.json({ success: false, error: 'Payment method not found' }, { status: 404 });
        }

        // If enabling, disable others
        if (validated.isEnabled) {
            await (prisma as any).paymentMethod.updateMany({
                where: {
                    sellerId: session.sellerId,
                    id: { not: params.id },
                },
                data: { isEnabled: false },
            });
        }

        const updatedMethod = await (prisma as any).paymentMethod.update({
            where: { id: params.id },
            data: validated,
        });

        return NextResponse.json({
            success: true,
            data: updatedMethod,
        });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({ success: false, error: 'Failed to update payment method' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await requireAuth();

        const method = await (prisma as any).paymentMethod.findUnique({
            where: { id: params.id },
        });

        if (!method || method.sellerId !== session.sellerId) {
            return NextResponse.json({ success: false, error: 'Payment method not found' }, { status: 404 });
        }

        await (prisma as any).paymentMethod.delete({
            where: { id: params.id },
        });

        return NextResponse.json({
            success: true,
            data: { id: params.id },
        });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({ success: false, error: 'Failed to delete payment method' }, { status: 500 });
    }
}
