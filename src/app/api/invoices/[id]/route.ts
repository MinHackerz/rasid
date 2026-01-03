import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getInvoice, updateInvoice, deleteInvoice, sendInvoice } from '@/lib/services';
import { updateInvoiceSchema } from '@/lib/validations';
import { z } from 'zod';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/invoices/[id] - Get single invoice
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await requireAuth();
        const { id } = await params;

        const invoice = await getInvoice(id, session.sellerId);

        if (!invoice) {
            return NextResponse.json(
                { success: false, error: 'Invoice not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: invoice,
        });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.error('Get invoice error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch invoice' },
            { status: 500 }
        );
    }
}

// PATCH /api/invoices/[id] - Update invoice
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await requireAuth();
        const { id } = await params;
        const body = await request.json();

        // Validate input
        const validated = updateInvoiceSchema.parse(body);

        const invoice = await updateInvoice(id, session.sellerId, validated);

        if (!invoice) {
            return NextResponse.json(
                { success: false, error: 'Invoice not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: invoice,
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

        console.error('Update invoice error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update invoice' },
            { status: 500 }
        );
    }
}

// DELETE /api/invoices/[id] - Delete invoice
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await requireAuth();
        const { id } = await params;

        const success = await deleteInvoice(id, session.sellerId);

        if (!success) {
            return NextResponse.json(
                { success: false, error: 'Invoice not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.error('Delete invoice error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete invoice' },
            { status: 500 }
        );
    }
}

// POST /api/invoices/[id] with action=send - Send invoice
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await requireAuth();
        const { id } = await params;
        const { action } = await request.json();

        if (action === 'send') {
            const result = await sendInvoice(id, session.sellerId);

            if (!result.success) {
                return NextResponse.json(
                    { success: false, error: result.error },
                    { status: 400 }
                );
            }

            return NextResponse.json({
                success: true,
                message: `Invoice sent via ${result.method}`,
            });
        }

        return NextResponse.json(
            { success: false, error: 'Invalid action' },
            { status: 400 }
        );
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.error('Invoice action error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to process action' },
            { status: 500 }
        );
    }
}
