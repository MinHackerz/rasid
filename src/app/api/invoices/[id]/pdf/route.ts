import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getInvoicePDFBuffer } from '@/lib/pdf';
import { prisma } from '@/lib/prisma';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await requireAuth();
        const { id } = await params;

        // Verify invoice belongs to seller
        const invoice = await prisma.invoice.findFirst({
            where: { id, sellerId: session.sellerId },
            select: { invoiceNumber: true },
        });

        if (!invoice) {
            return NextResponse.json(
                { success: false, error: 'Invoice not found' },
                { status: 404 }
            );
        }

        // Get PDF buffer
        const pdfBuffer = await getInvoicePDFBuffer(id);

        if (!pdfBuffer) {
            return NextResponse.json(
                { success: false, error: 'Failed to generate PDF' },
                { status: 500 }
            );
        }

        // Return PDF
        return new NextResponse(new Uint8Array(pdfBuffer), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Invoice-${invoice.invoiceNumber}.pdf"`,
            },
        });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.error('Get PDF error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to get PDF' },
            { status: 500 }
        );
    }
}
