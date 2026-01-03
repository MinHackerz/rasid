import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const statusSchema = z.object({
    status: z.enum(['DRAFT', 'PENDING', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']),
});

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await requireAuth();
        const { id } = await params;
        const body = await request.json();

        const validated = statusSchema.parse(body);

        // Verify ownership
        const invoice = await prisma.invoice.findFirst({
            where: { id, sellerId: session.sellerId },
        });

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        // Map status to paymentStatus and deliveryStatus
        let paymentStatus: 'DRAFT' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
        let deliveryStatus: 'DRAFT' | 'SENT' | 'VIEWED' | 'DOWNLOADED';

        switch (validated.status) {
            case 'PAID':
                paymentStatus = 'PAID';
                deliveryStatus = 'SENT';
                break;
            case 'PENDING':
                paymentStatus = 'PENDING';
                deliveryStatus = 'DRAFT';
                break;
            case 'DRAFT':
            default:
                paymentStatus = 'DRAFT';
                deliveryStatus = 'DRAFT';
                break;
        }

        const updatedInvoice = await prisma.invoice.update({
            where: { id },
            data: {
                status: validated.status,
                paymentStatus,
                deliveryStatus,
            },
        });

        return NextResponse.json({ success: true, data: updatedInvoice });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
