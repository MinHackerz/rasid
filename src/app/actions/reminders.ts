'use server';

import { prisma } from '@/lib/prisma';
import { getSession, getUserPlan } from '@/lib/auth';
import { PlanType } from '@/lib/constants/plans';
import {
    createReminder,
    createDefaultReminders,
    cancelReminder,
    cancelInvoiceReminders,
    sendReminder
} from '@/lib/services/payment-reminder';

const PAID_PLANS: PlanType[] = ['BASIC', 'PRO', 'PREMIUM', 'LIFETIME'];

export type ReminderWithInvoice = {
    id: string;
    invoiceId: string;
    type: string;
    daysOffset: number;
    channel: string;
    scheduledFor: Date;
    status: string;
    sentAt: Date | null;
    errorMessage: string | null;
    invoice: {
        invoiceNumber: string;
        totalAmount: number;
        currency: string;
        dueDate: Date | null;
        paymentStatus: string;
        buyer: {
            name: string;
            email: string | null;
            phone: string | null;
        } | null;
    };
};

/**
 * Get all reminders for the current seller
 */
export async function getSellerReminders(
    options: {
        status?: string;
        limit?: number;
        offset?: number;
    } = {}
): Promise<{ data?: ReminderWithInvoice[]; error?: string }> {
    const session = await getSession();
    if (!session) {
        return { error: 'Unauthorized' };
    }

    const plan = await getUserPlan();
    if (!PAID_PLANS.includes(plan)) {
        return { error: 'Payment reminders are available on Basic plan and above.' };
    }

    const { status, limit = 50, offset = 0 } = options;

    const where: any = { sellerId: session.sellerId };
    if (status) {
        where.status = status;
    }

    const reminders = await prisma.paymentReminder.findMany({
        where,
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
        },
        orderBy: { scheduledFor: 'asc' },
        take: limit,
        skip: offset
    });

    // Transform for client
    const data = reminders.map((r) => ({
        id: r.id,
        invoiceId: r.invoiceId,
        type: r.type,
        daysOffset: r.daysOffset,
        channel: r.channel,
        scheduledFor: r.scheduledFor,
        status: r.status,
        sentAt: r.sentAt,
        errorMessage: r.errorMessage,
        invoice: {
            invoiceNumber: r.invoice.invoiceNumber,
            totalAmount: Number(r.invoice.totalAmount),
            currency: r.invoice.currency,
            dueDate: r.invoice.dueDate,
            paymentStatus: r.invoice.paymentStatus,
            buyer: r.invoice.buyer
        }
    })) as ReminderWithInvoice[];

    return { data };
}

/**
 * Create reminders for an invoice
 */
export async function createInvoiceReminders(
    invoiceId: string,
    useDefaults: boolean = true
): Promise<{ success?: boolean; error?: string }> {
    const session = await getSession();
    if (!session) {
        return { error: 'Unauthorized' };
    }

    const plan = await getUserPlan();
    if (!PAID_PLANS.includes(plan)) {
        return { error: 'Payment reminders are available on Basic plan and above.' };
    }

    // Verify invoice belongs to seller
    const invoice = await prisma.invoice.findFirst({
        where: {
            id: invoiceId,
            sellerId: session.sellerId
        },
        select: {
            id: true,
            dueDate: true,
            paymentStatus: true
        }
    });

    if (!invoice) {
        return { error: 'Invoice not found' };
    }

    if (invoice.paymentStatus === 'PAID') {
        return { error: 'Cannot create reminders for paid invoices' };
    }

    if (!invoice.dueDate) {
        return { error: 'Invoice has no due date. Please set a due date first.' };
    }

    try {
        // Delete old cancelled/skipped reminders before creating new ones
        await prisma.paymentReminder.deleteMany({
            where: {
                invoiceId,
                sellerId: session.sellerId,
                status: { in: ['CANCELLED', 'SKIPPED'] }
            }
        });

        if (useDefaults) {
            await createDefaultReminders(invoiceId, session.sellerId);
        }
        return { success: true };
    } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to create reminders' };
    }
}

/**
 * Cancel a specific reminder
 */
export async function cancelReminderAction(
    reminderId: string
): Promise<{ success?: boolean; error?: string }> {
    const session = await getSession();
    if (!session) {
        return { error: 'Unauthorized' };
    }

    const plan = await getUserPlan();
    if (!PAID_PLANS.includes(plan)) {
        return { error: 'Payment reminders are available on Basic plan and above.' };
    }

    try {
        await cancelReminder(reminderId, session.sellerId);
        return { success: true };
    } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to cancel reminder' };
    }
}

/**
 * Cancel all pending reminders for an invoice
 */
export async function cancelAllInvoiceReminders(
    invoiceId: string
): Promise<{ success?: boolean; error?: string }> {
    const session = await getSession();
    if (!session) {
        return { error: 'Unauthorized' };
    }

    try {
        await cancelInvoiceReminders(invoiceId, session.sellerId);
        return { success: true };
    } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to cancel reminders' };
    }
}

/**
 * Immediately send a reminder
 */
export async function sendReminderNow(
    reminderId: string
): Promise<{ success?: boolean; error?: string; skipped?: boolean }> {
    const session = await getSession();
    if (!session) {
        return { error: 'Unauthorized' };
    }

    const plan = await getUserPlan();
    if (!PAID_PLANS.includes(plan)) {
        return { error: 'Payment reminders are available on Basic plan and above.' };
    }

    // Verify reminder belongs to seller
    const reminder = await prisma.paymentReminder.findFirst({
        where: {
            id: reminderId,
            sellerId: session.sellerId
        }
    });

    if (!reminder) {
        return { error: 'Reminder not found' };
    }

    try {
        const result = await sendReminder(reminderId);
        return result;
    } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to send reminder' };
    }
}

/**
 * Get reminder counts for dashboard
 */
export async function getReminderStats(): Promise<{
    pending: number;
    sent: number;
    failed: number;
    upcoming: number;
} | { error: string }> {
    const session = await getSession();
    if (!session) {
        return { error: 'Unauthorized' };
    }

    const plan = await getUserPlan();
    if (!PAID_PLANS.includes(plan)) {
        return { pending: 0, sent: 0, failed: 0, upcoming: 0 };
    }

    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [pending, sent, failed, upcoming] = await Promise.all([
        prisma.paymentReminder.count({
            where: { sellerId: session.sellerId, status: 'PENDING' }
        }),
        prisma.paymentReminder.count({
            where: { sellerId: session.sellerId, status: 'SENT' }
        }),
        prisma.paymentReminder.count({
            where: { sellerId: session.sellerId, status: 'FAILED' }
        }),
        prisma.paymentReminder.count({
            where: {
                sellerId: session.sellerId,
                status: 'PENDING',
                scheduledFor: {
                    gte: now,
                    lte: nextWeek
                }
            }
        })
    ]);

    return { pending, sent, failed, upcoming };
}
