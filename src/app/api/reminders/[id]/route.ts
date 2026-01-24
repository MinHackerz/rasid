/**
 * Individual Payment Reminder API
 * 
 * GET /api/reminders/[id] - Get a specific reminder
 * PATCH /api/reminders/[id] - Update a reminder
 * DELETE /api/reminders/[id] - Cancel a reminder
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, getUserPlan } from '@/lib/auth';
import { cancelReminder, sendReminder } from '@/lib/services/payment-reminder';
import { z } from 'zod';

const PAID_PLANS = ['BASIC', 'PRO', 'PREMIUM', 'LIFETIME'];

interface RouteParams {
    params: Promise<{ id: string }>;
}

// Schema for updating a reminder
const updateReminderSchema = z.object({
    action: z.enum(['cancel', 'send']).optional(),
    scheduledFor: z.string().datetime().optional(),
    channel: z.enum(['EMAIL', 'WHATSAPP', 'SMS']).optional()
});

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await requireAuth();
        const plan = await getUserPlan();
        const { id } = await params;

        if (!PAID_PLANS.includes(plan)) {
            return NextResponse.json({
                error: 'Payment reminders are available on Basic plan and above.'
            }, { status: 403 });
        }

        const reminder = await prisma.paymentReminder.findFirst({
            where: {
                id,
                sellerId: session.sellerId
            },
            include: {
                invoice: {
                    select: {
                        invoiceNumber: true,
                        totalAmount: true,
                        currency: true,
                        dueDate: true,
                        paymentStatus: true,
                        buyer: {
                            select: {
                                name: true,
                                email: true,
                                phone: true
                            }
                        }
                    }
                }
            }
        });

        if (!reminder) {
            return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: reminder });
    } catch (error) {
        console.error('Error fetching reminder:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Internal Server Error'
        }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await requireAuth();
        const plan = await getUserPlan();
        const { id } = await params;

        if (!PAID_PLANS.includes(plan)) {
            return NextResponse.json({
                error: 'Payment reminders are available on Basic plan and above.'
            }, { status: 403 });
        }

        const body = await request.json();
        const validated = updateReminderSchema.parse(body);

        // Handle actions
        if (validated.action === 'cancel') {
            const result = await cancelReminder(id, session.sellerId);
            return NextResponse.json({ success: true, data: result });
        }

        if (validated.action === 'send') {
            // Verify ownership first
            const reminder = await prisma.paymentReminder.findFirst({
                where: { id, sellerId: session.sellerId }
            });

            if (!reminder) {
                return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
            }

            const result = await sendReminder(id);
            return NextResponse.json(result);
        }

        // Update reminder fields
        const updateData: any = {};
        if (validated.scheduledFor) {
            updateData.scheduledFor = new Date(validated.scheduledFor);
        }
        if (validated.channel) {
            updateData.channel = validated.channel;
        }

        const updated = await prisma.paymentReminder.updateMany({
            where: {
                id,
                sellerId: session.sellerId,
                status: 'PENDING' // Can only update pending reminders
            },
            data: updateData
        });

        if (updated.count === 0) {
            return NextResponse.json({
                error: 'Reminder not found or cannot be modified'
            }, { status: 404 });
        }

        const reminder = await prisma.paymentReminder.findUnique({
            where: { id }
        });

        return NextResponse.json({ success: true, data: reminder });
    } catch (error) {
        console.error('Error updating reminder:', error);

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

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await requireAuth();
        const plan = await getUserPlan();
        const { id } = await params;

        if (!PAID_PLANS.includes(plan)) {
            return NextResponse.json({
                error: 'Payment reminders are available on Basic plan and above.'
            }, { status: 403 });
        }

        const result = await cancelReminder(id, session.sellerId);
        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error('Error cancelling reminder:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Internal Server Error'
        }, { status: 500 });
    }
}
