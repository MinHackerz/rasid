import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { cancelInvoiceReminders } from '@/lib/services/payment-reminder';
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

        // Verify ownership and get current status
        const invoice = await prisma.invoice.findFirst({
            where: { id, sellerId: session.sellerId },
            select: {
                id: true,
                invoiceNumber: true,
                status: true,
                paymentStatus: true
            }
        });

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        const previousStatus = invoice.status;
        const isRevertingFromPaid = previousStatus === 'PAID' && validated.status !== 'PAID';

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

        // Cancel all pending payment reminders when invoice is marked as PAID
        if (validated.status === 'PAID') {
            try {
                const result = await cancelInvoiceReminders(id, session.sellerId);
                console.log(`[Reminder Cancellation] Cancelled ${result.count} reminders for invoice ${id}`);
            } catch (error) {
                console.error('Failed to cancel payment reminders:', error);
            }
        }

        // Log status change for audit purposes (especially important for PAID reversals)
        if (previousStatus !== validated.status) {
            console.log(
                `[AUDIT] Invoice ${invoice.invoiceNumber} status changed from ${previousStatus} to ${validated.status}` +
                ` by seller ${session.sellerId} at ${new Date().toISOString()}` +
                (isRevertingFromPaid ? ' [PAID REVERSAL]' : '')
            );

            // Store audit log in database (using VerificationLog as a general audit log)
            try {
                await prisma.verificationLog.create({
                    data: {
                        hash: `audit:status:${invoice.id}:${Date.now()}`,
                        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
                        userAgent: request.headers.get('user-agent') || null,
                        result: true, // Status change was successful
                    }
                });
            } catch (error) {
                // Don't fail the request if audit log fails
                console.error('Failed to create audit log:', error);
            }
        }

        return NextResponse.json({ success: true, data: updatedInvoice });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

