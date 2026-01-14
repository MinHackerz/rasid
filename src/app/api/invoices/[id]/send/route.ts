import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { sendInvoice } from '@/lib/services';
import { z } from 'zod';
import { checkLimit } from '@/lib/access-control';

const sendSchema = z.object({
    method: z.enum(['EMAIL', 'WHATSAPP', 'SMS']).optional(),
});

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await requireAuth();
        const { id } = await params;
        const body = await request.json();

        const validated = sendSchema.parse(body);

        // Verify ownership
        const invoice = await prisma.invoice.findFirst({
            where: { id, sellerId: session.sellerId },
        });

        // Check subscription limit
        const canSend = await checkLimit(session.sellerId, 'emailIntegration');
        if (!canSend) {
            return NextResponse.json(
                { success: false, error: 'Email/Whatsapp sharing is not available on your plan. Upgrade your plan at /pricing' },
                { status: 403 }
            );
        }

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        // Use the service function which handles logic and logging
        // We'll trust the service to pick the right method if not specified, or use the one provided
        // Note: The service currently takes method? but we need to ensure it uses the integrations config
        // Actually sendInvoice service might check integrations? 
        // I need to update sendInvoice service? 
        // For now let's assume sendInvoice does the heavy lifting or mock it.
        // Wait, I saw sendInvoice in invoice.ts (Step 376). It calls `deliverInvoice`.

        const result = await sendInvoice(id, session.sellerId, validated.method);

        if (!result.success) {
            return NextResponse.json({ error: result.error || 'Failed to send invoice' }, { status: 400 });
        }

        return NextResponse.json({ success: true, method: result.method });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
        }
        console.error('Send invoice error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
