import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createInvoice } from '@/lib/services';
import { generateInvoicePDF } from '@/lib/pdf';
import { z } from 'zod';

// Rate limiting: 60 requests per minute per key
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60 * 1000; // 1 minute

// API Invoice Generation Schema
const apiInvoiceSchema = z.object({
    invoiceNumber: z.string().optional(),
    buyer: z.object({
        name: z.string().min(1, 'Buyer name is required'),
        email: z.string().email().optional().or(z.literal('')),
        phone: z.string().optional(),
        address: z.string().optional(),
        state: z.string().optional(),
        taxId: z.string().optional(),
    }),
    items: z.array(z.object({
        description: z.string().min(1, 'Item description is required'),
        quantity: z.number().positive('Quantity must be positive'),
        unitPrice: z.number().min(0, 'Unit price cannot be negative'),
        unit: z.string().optional().default('pcs'),
        taxRate: z.number().min(0).max(100).optional().default(0),
        discount: z.number().min(0).optional().default(0),
    })).min(1, 'At least one item is required'),
    date: z.string().optional(),
    dueDate: z.string().optional(),
    currency: z.string().optional().default('INR'),
    notes: z.string().optional(),
    terms: z.string().optional(),
});

function checkRateLimit(apiKey: string): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const entry = rateLimitMap.get(apiKey);

    if (!entry || now > entry.resetTime) {
        rateLimitMap.set(apiKey, { count: 1, resetTime: now + RATE_WINDOW_MS });
        return { allowed: true, remaining: RATE_LIMIT - 1 };
    }

    if (entry.count >= RATE_LIMIT) {
        return { allowed: false, remaining: 0 };
    }

    entry.count++;
    return { allowed: true, remaining: RATE_LIMIT - entry.count };
}

export async function POST(request: NextRequest) {
    try {
        // 1. Get API Key from header
        const apiKey = request.headers.get('x-api-key');

        if (!apiKey) {
            return NextResponse.json(
                { success: false, error: 'Missing API key. Include x-api-key header.' },
                { status: 401 }
            );
        }

        // 2. Validate API Key (type assertion for IDE compatibility)
        const keyRecord = await (prisma as any).apiKey.findUnique({
            where: { key: apiKey },
            include: { seller: true },
        });

        if (!keyRecord) {
            return NextResponse.json(
                { success: false, error: 'Invalid API key.' },
                { status: 401 }
            );
        }

        // 3. Check usage quota (1 lakh = 100,000)
        if (keyRecord.usage >= keyRecord.limit) {
            return NextResponse.json(
                { success: false, error: 'API quota exceeded. You have reached the 100,000 request limit.' },
                { status: 429 }
            );
        }

        // 4. Rate limiting
        const rateLimit = checkRateLimit(apiKey);
        if (!rateLimit.allowed) {
            return NextResponse.json(
                { success: false, error: 'Rate limit exceeded. Maximum 60 requests per minute.' },
                { status: 429, headers: { 'X-RateLimit-Remaining': '0' } }
            );
        }

        // 5. Parse and validate request body
        const body = await request.json();
        const validated = apiInvoiceSchema.parse(body);

        // 6. Create invoice using existing service
        const invoice = await createInvoice(keyRecord.sellerId, {
            buyerName: validated.buyer.name,
            buyerEmail: validated.buyer.email || '',
            buyerPhone: validated.buyer.phone,
            buyerAddress: validated.buyer.address,
            buyerState: validated.buyer.state,
            buyerTaxId: validated.buyer.taxId,
            items: validated.items.map(item => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                unit: item.unit || 'pcs',
                taxRate: item.taxRate || 0,
                discount: item.discount || 0,
            })),
            issueDate: validated.date ? new Date(validated.date) : new Date(),
            dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
            currency: validated.currency || 'INR',
            notes: validated.notes,
            terms: validated.terms,
            status: 'PENDING',
        });

        // 7. Generate PDF with the template specified in the API key
        const templateId = keyRecord.templateId || 'classic';
        await generateInvoicePDF(invoice.id, templateId);

        // 8. Update API key usage (type assertion for IDE compatibility)
        await (prisma as any).apiKey.update({
            where: { id: keyRecord.id },
            data: {
                usage: { increment: 1 },
                lastUsedAt: new Date(),
            },
        });

        // 9. Build PDF URL
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rasid.in';
        const pdfUrl = `${appUrl}/api/invoices/${invoice.id}/pdf`;

        return NextResponse.json({
            success: true,
            invoice: {
                id: invoice.id,
                invoiceNumber: invoice.invoiceNumber,
                totalAmount: Number(invoice.totalAmount),
                pdfUrl,
            },
            remaining_credits: keyRecord.limit - keyRecord.usage - 1,
        }, {
            headers: {
                'X-RateLimit-Remaining': String(rateLimit.remaining),
            }
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: error.issues[0].message, details: error.issues },
                { status: 400 }
            );
        }

        console.error('API Invoice Generation Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to generate invoice. Please check your request and try again.' },
            { status: 500 }
        );
    }
}

// GET - Simple health check / info
export async function GET() {
    return NextResponse.json({
        message: 'Rasid Invoice Generation API v1',
        documentation: 'https://rasid.in/dashboard/developer/docs',
        endpoints: {
            'POST /api/v1/invoices/generate': 'Generate a new invoice',
        }
    });
}
