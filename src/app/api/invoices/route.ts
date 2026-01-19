import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { listInvoices, createInvoice } from '@/lib/services';
import { createInvoiceSchema } from '@/lib/validations';
import { z } from 'zod';
import { checkLimit } from '@/lib/access-control';

// GET /api/invoices - List invoices
export async function GET(request: NextRequest) {
    try {
        const session = await requireAuth();
        const searchParams = request.nextUrl.searchParams;

        const result = await listInvoices(session.sellerId, {
            page: parseInt(searchParams.get('page') || '1'),
            pageSize: parseInt(searchParams.get('pageSize') || '20'),
            status: searchParams.get('status') as 'DRAFT' | 'PENDING' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED' | undefined,
            search: searchParams.get('search') || undefined,
            startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
            endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
        });

        return NextResponse.json({
            success: true,
            data: result.invoices,
            pagination: result.pagination,
        });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.error('List invoices error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch invoices' },
            { status: 500 }
        );
    }
}

// POST /api/invoices - Create invoice
export async function POST(request: NextRequest) {
    try {
        const session = await requireAuth();
        const body = await request.json();

        // Validate input
        const validated = createInvoiceSchema.parse(body);

        // Check subscription limit
        const canCreate = await checkLimit(session.sellerId, 'invoices');
        if (!canCreate) {
            return NextResponse.json(
                { success: false, error: 'Invoice limit reached. Upgrade your plan at /pricing' },
                { status: 403 }
            );
        }

        // Create invoice
        const invoice = await createInvoice(session.sellerId, validated);

        // Revalidate paths
        revalidatePath('/dashboard/invoices');
        revalidatePath('/dashboard/scans');
        revalidatePath('/dashboard/inventory'); // Ensure stock levels are updated
        revalidatePath('/dashboard');

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

        console.error('Create invoice error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create invoice' },
            { status: 500 }
        );
    }
}
