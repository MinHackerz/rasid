/**
 * Payment Reminders API
 * 
 * GET /api/reminders?invoiceId=xxx - Get reminders for an invoice
 * POST /api/reminders - Create a new reminder
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, getUserPlan } from '@/lib/auth';
import { createReminder, createDefaultReminders, getInvoiceReminders } from '@/lib/services/payment-reminder';
import { z } from 'zod';

const PAID_PLANS = ['BASIC', 'PRO', 'PREMIUM', 'LIFETIME'];

// Schema for creating a reminder
const createReminderSchema = z.object({
    invoiceId: z.string().min(1, 'Invoice ID is required'),
    type: z.enum(['BEFORE_DUE', 'ON_DUE', 'AFTER_DUE', 'CUSTOM']).default('BEFORE_DUE'),
    daysOffset: z.number().int().min(0).max(90).default(3),
    channel: z.enum(['EMAIL', 'WHATSAPP', 'SMS']).default('EMAIL'),
    customDate: z.string().datetime().optional(),
    createDefaults: z.boolean().optional() // If true, create default reminder set
});

export async function GET(request: NextRequest) {
    try {
        const session = await requireAuth();
        const plan = await getUserPlan();

        // Check if user has access to payment reminders
        if (!PAID_PLANS.includes(plan)) {
            return NextResponse.json({
                error: 'Payment reminders are available on Basic plan and above. Please upgrade to access this feature.'
            }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const invoiceId = searchParams.get('invoiceId');

        if (!invoiceId) {
            return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
        }

        // Verify invoice belongs to seller
        const invoice = await prisma.invoice.findFirst({
            where: {
                id: invoiceId,
                sellerId: session.sellerId
            }
        });

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        const reminders = await getInvoiceReminders(invoiceId);

        return NextResponse.json({ success: true, data: reminders });
    } catch (error) {
        console.error('Error fetching reminders:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Internal Server Error'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await requireAuth();
        const plan = await getUserPlan();

        // Check if user has access to payment reminders
        if (!PAID_PLANS.includes(plan)) {
            return NextResponse.json({
                error: 'Payment reminders are available on Basic plan and above. Please upgrade to access this feature.'
            }, { status: 403 });
        }

        const body = await request.json();
        const validated = createReminderSchema.parse(body);

        // Verify invoice belongs to seller
        const invoice = await prisma.invoice.findFirst({
            where: {
                id: validated.invoiceId,
                sellerId: session.sellerId
            },
            select: {
                id: true,
                dueDate: true,
                paymentStatus: true
            }
        });

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        if (invoice.paymentStatus === 'PAID') {
            return NextResponse.json({
                error: 'Cannot create reminders for paid invoices'
            }, { status: 400 });
        }

        if (!invoice.dueDate && validated.type !== 'CUSTOM') {
            return NextResponse.json({
                error: 'Invoice has no due date. Please set a due date or use custom reminder.'
            }, { status: 400 });
        }

        let result;

        if (validated.createDefaults) {
            // Create default reminder set
            result = await createDefaultReminders(validated.invoiceId, session.sellerId);
        } else {
            // Create single reminder
            result = await createReminder({
                invoiceId: validated.invoiceId,
                sellerId: session.sellerId,
                type: validated.type,
                daysOffset: validated.daysOffset,
                channel: validated.channel,
                customDate: validated.customDate ? new Date(validated.customDate) : undefined
            });
        }

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error('Error creating reminder:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                error: error.issues[0].message
            }, { status: 400 });
        }

        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Internal Server Error'
        }, { status: 500 });
    }
}
