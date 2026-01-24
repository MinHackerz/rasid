/**
 * Payment Reminder Service for Rasid Invoice Platform
 * 
 * Handles scheduling, sending, and managing payment reminders for invoices
 */

import { prisma } from '@/lib/prisma';
import { sendInvoiceEmail, sendInvoiceWhatsApp } from '@/lib/delivery';
import { sendEmail } from '@/lib/email';
import { formatCurrency, formatDate } from '@/lib/utils';
import { addDays, subDays, isAfter, isBefore, startOfDay } from 'date-fns';

export type ReminderType = 'BEFORE_DUE' | 'ON_DUE' | 'AFTER_DUE' | 'CUSTOM';
export type ReminderStatus = 'PENDING' | 'SENT' | 'FAILED' | 'CANCELLED' | 'SKIPPED';
export type DeliveryChannel = 'EMAIL' | 'WHATSAPP' | 'SMS';

interface CreateReminderInput {
    invoiceId: string;
    sellerId: string;
    type: ReminderType;
    daysOffset?: number; // Days before(-) or after(+) due date
    channel?: DeliveryChannel;
    customDate?: Date; // For CUSTOM type
}

interface ReminderSettings {
    enableReminders: boolean;
    beforeDueDays: number[]; // e.g., [3, 1] = reminders 3 days and 1 day before
    onDueDate: boolean;
    afterDueDays: number[]; // e.g., [1, 3, 7] = reminders 1, 3, 7 days after
    preferredChannel: DeliveryChannel;
}

const DEFAULT_SETTINGS: ReminderSettings = {
    enableReminders: true,
    beforeDueDays: [3, 1],
    onDueDate: true,
    afterDueDays: [1, 3, 7],
    preferredChannel: 'EMAIL'
};

// ============================================
// Create a Single Reminder
// ============================================
export async function createReminder(input: CreateReminderInput) {
    const { invoiceId, sellerId, type, daysOffset = 0, channel = 'EMAIL', customDate } = input;

    // Get invoice to calculate scheduled date
    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        select: { dueDate: true, paymentStatus: true }
    });

    if (!invoice) {
        throw new Error('Invoice not found');
    }

    if (!invoice.dueDate && type !== 'CUSTOM') {
        throw new Error('Invoice has no due date. Cannot schedule reminder.');
    }

    // Calculate scheduled date based on type
    let scheduledFor: Date;

    if (type === 'CUSTOM' && customDate) {
        scheduledFor = customDate;
    } else if (invoice.dueDate) {
        if (type === 'BEFORE_DUE') {
            scheduledFor = subDays(new Date(invoice.dueDate), Math.abs(daysOffset));
        } else if (type === 'ON_DUE') {
            scheduledFor = new Date(invoice.dueDate);
        } else {
            scheduledFor = addDays(new Date(invoice.dueDate), Math.abs(daysOffset));
        }
    } else {
        throw new Error('Could not calculate reminder date');
    }

    // Don't create reminder if it's in the past
    if (isBefore(startOfDay(scheduledFor), startOfDay(new Date()))) {
        console.log('Skipping reminder creation - date is in the past');
        return null;
    }

    const reminder = await prisma.paymentReminder.create({
        data: {
            invoiceId,
            sellerId,
            type,
            daysOffset,
            channel,
            scheduledFor,
            status: 'PENDING'
        }
    });

    return reminder;
}

// ============================================
// Create Default Reminders for Invoice
// ============================================
export async function createDefaultReminders(
    invoiceId: string,
    sellerId: string,
    settings: ReminderSettings = DEFAULT_SETTINGS
) {
    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        select: { dueDate: true, paymentStatus: true }
    });

    if (!invoice || !invoice.dueDate || !settings.enableReminders) {
        return [];
    }

    const reminders = [];

    // Before due date reminders
    for (const days of settings.beforeDueDays) {
        const reminder = await createReminder({
            invoiceId,
            sellerId,
            type: 'BEFORE_DUE',
            daysOffset: days,
            channel: settings.preferredChannel
        });
        if (reminder) reminders.push(reminder);
    }

    // On due date reminder
    if (settings.onDueDate) {
        const reminder = await createReminder({
            invoiceId,
            sellerId,
            type: 'ON_DUE',
            daysOffset: 0,
            channel: settings.preferredChannel
        });
        if (reminder) reminders.push(reminder);
    }

    // After due date reminders (overdue)
    for (const days of settings.afterDueDays) {
        const reminder = await createReminder({
            invoiceId,
            sellerId,
            type: 'AFTER_DUE',
            daysOffset: days,
            channel: settings.preferredChannel
        });
        if (reminder) reminders.push(reminder);
    }

    return reminders;
}

// ============================================
// Send a Payment Reminder
// ============================================
export async function sendReminder(reminderId: string) {
    const reminder = await prisma.paymentReminder.findUnique({
        where: { id: reminderId },
        include: {
            invoice: {
                include: {
                    seller: true,
                    buyer: true
                }
            },
            seller: true
        }
    });

    if (!reminder) {
        throw new Error('Reminder not found');
    }

    // Check if invoice is already paid
    if (reminder.invoice.paymentStatus === 'PAID') {
        await prisma.paymentReminder.update({
            where: { id: reminderId },
            data: { status: 'SKIPPED' }
        });
        return { success: true, skipped: true, reason: 'Invoice already paid' };
    }

    const { invoice, seller } = reminder;
    const buyer = invoice.buyer;

    if (!buyer?.email && reminder.channel === 'EMAIL') {
        await prisma.paymentReminder.update({
            where: { id: reminderId },
            data: { status: 'FAILED', errorMessage: 'No buyer email address' }
        });
        return { success: false, error: 'No buyer email address' };
    }

    if (!buyer?.phone && reminder.channel === 'WHATSAPP') {
        await prisma.paymentReminder.update({
            where: { id: reminderId },
            data: { status: 'FAILED', errorMessage: 'No buyer phone number' }
        });
        return { success: false, error: 'No buyer phone number' };
    }

    try {
        // Generate reminder message based on type
        const reminderSubject = getReminderSubject(reminder.type, invoice.invoiceNumber, seller.businessName);
        const reminderMessage = getReminderMessage(reminder.type, {
            invoiceNumber: invoice.invoiceNumber,
            buyerName: buyer?.name || 'Customer',
            totalAmount: Number(invoice.totalAmount),
            currency: invoice.currency,
            dueDate: invoice.dueDate ? formatDate(invoice.dueDate) : 'N/A',
            businessName: seller.businessName,
            daysOverdue: reminder.daysOffset
        });

        let result;

        if (reminder.channel === 'EMAIL' && buyer?.email) {
            result = await sendEmail({
                to: buyer.email,
                subject: reminderSubject,
                html: reminderMessage,
                sellerId: seller.id
            });
        } else if (reminder.channel === 'WHATSAPP' && buyer?.phone) {
            result = await sendInvoiceWhatsApp(invoice.id, buyer.phone);
        } else {
            throw new Error('Invalid delivery channel or missing contact info');
        }

        if (result.success) {
            await prisma.paymentReminder.update({
                where: { id: reminderId },
                data: {
                    status: 'SENT',
                    sentAt: new Date(),
                    messageId: result.messageId
                }
            });
            return { success: true };
        } else {
            await prisma.paymentReminder.update({
                where: { id: reminderId },
                data: {
                    status: 'FAILED',
                    errorMessage: result.error || 'Failed to send'
                }
            });
            return { success: false, error: result.error };
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await prisma.paymentReminder.update({
            where: { id: reminderId },
            data: {
                status: 'FAILED',
                errorMessage
            }
        });
        return { success: false, error: errorMessage };
    }
}

// ============================================
// Process Pending Reminders (Cron Job)
// ============================================
export async function processPendingReminders() {
    const now = new Date();

    // Get all pending reminders that are due
    const pendingReminders = await prisma.paymentReminder.findMany({
        where: {
            status: 'PENDING',
            scheduledFor: {
                lte: now
            }
        },
        include: {
            invoice: {
                select: { paymentStatus: true }
            }
        },
        take: 50 // Process in batches
    });

    const results = {
        processed: 0,
        sent: 0,
        skipped: 0,
        failed: 0
    };

    for (const reminder of pendingReminders) {
        try {
            // Skip if invoice is already paid
            if (reminder.invoice.paymentStatus === 'PAID') {
                await prisma.paymentReminder.update({
                    where: { id: reminder.id },
                    data: { status: 'SKIPPED' }
                });
                results.skipped++;
                continue;
            }

            const result = await sendReminder(reminder.id);
            results.processed++;

            if (result.success) {
                if (result.skipped) {
                    results.skipped++;
                } else {
                    results.sent++;
                }
            } else {
                results.failed++;
            }
        } catch (error) {
            console.error(`Failed to process reminder ${reminder.id}:`, error);
            results.failed++;
        }
    }

    return results;
}

// ============================================
// Get Reminders for Invoice
// ============================================
export async function getInvoiceReminders(invoiceId: string) {
    return prisma.paymentReminder.findMany({
        where: { invoiceId },
        orderBy: { scheduledFor: 'asc' }
    });
}

// ============================================
// Cancel Reminder
// ============================================
export async function cancelReminder(reminderId: string, sellerId: string) {
    const reminder = await prisma.paymentReminder.findFirst({
        where: { id: reminderId, sellerId }
    });

    if (!reminder) {
        throw new Error('Reminder not found');
    }

    if (reminder.status !== 'PENDING') {
        throw new Error('Can only cancel pending reminders');
    }

    return prisma.paymentReminder.update({
        where: { id: reminderId },
        data: { status: 'CANCELLED' }
    });
}

// ============================================
// Cancel All Reminders for Invoice
// ============================================
export async function cancelInvoiceReminders(invoiceId: string, sellerId: string) {
    return prisma.paymentReminder.updateMany({
        where: {
            invoiceId,
            sellerId,
            status: 'PENDING'
        },
        data: { status: 'CANCELLED' }
    });
}

// ============================================
// Helper: Get Email Subject
// ============================================
function getReminderSubject(type: ReminderType, invoiceNumber: string, businessName: string): string {
    switch (type) {
        case 'BEFORE_DUE':
            return `Payment Reminder: Invoice ${invoiceNumber} from ${businessName} - Due Soon`;
        case 'ON_DUE':
            return `Payment Due Today: Invoice ${invoiceNumber} from ${businessName}`;
        case 'AFTER_DUE':
            return `Overdue Payment: Invoice ${invoiceNumber} from ${businessName}`;
        default:
            return `Payment Reminder: Invoice ${invoiceNumber} from ${businessName}`;
    }
}

// ============================================
// Helper: Get Reminder Email HTML
// ============================================
function getReminderMessage(
    type: ReminderType,
    data: {
        invoiceNumber: string;
        buyerName: string;
        totalAmount: number;
        currency: string;
        dueDate: string;
        businessName: string;
        daysOverdue: number;
    }
): string {
    const { invoiceNumber, buyerName, totalAmount, currency, dueDate, businessName, daysOverdue } = data;

    let headerColor = '#3b82f6'; // blue
    let headerText = 'Payment Reminder';
    let messageText = '';

    switch (type) {
        case 'BEFORE_DUE':
            headerColor = '#3b82f6';
            headerText = 'Friendly Payment Reminder';
            messageText = `This is a friendly reminder that your invoice <strong>${invoiceNumber}</strong> is due on <strong>${dueDate}</strong>.`;
            break;
        case 'ON_DUE':
            headerColor = '#f59e0b';
            headerText = 'Payment Due Today';
            messageText = `Your invoice <strong>${invoiceNumber}</strong> is due <strong>today</strong>. Please ensure payment is made promptly.`;
            break;
        case 'AFTER_DUE':
            headerColor = '#ef4444';
            headerText = 'Overdue Payment Notice';
            messageText = `Your invoice <strong>${invoiceNumber}</strong> was due on <strong>${dueDate}</strong> and is now <strong>${daysOverdue} day(s) overdue</strong>. Please arrange payment as soon as possible.`;
            break;
        default:
            messageText = `This is a reminder about your invoice <strong>${invoiceNumber}</strong>.`;
    }

    return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${headerColor}; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #fff;">
                ${headerText}
            </h1>
        </div>
        
        <div style="padding: 32px; background: #fff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="margin: 0 0 16px; color: #333; font-size: 16px;">
                Hello ${buyerName},
            </p>
            
            <p style="margin: 0 0 24px; color: #666; font-size: 14px; line-height: 1.6;">
                ${messageText}
            </p>
            
            <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; color: #666; font-size: 14px;">Invoice Number</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #111;">${invoiceNumber}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666; font-size: 14px;">Due Date</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #111;">${dueDate}</td>
                    </tr>
                    <tr style="border-top: 1px solid #e5e7eb;">
                        <td style="padding: 12px 0 8px; color: #111; font-size: 16px; font-weight: 600;">Amount Due</td>
                        <td style="padding: 12px 0 8px; text-align: right; font-weight: 700; font-size: 20px; color: ${headerColor};">${currency} ${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                </table>
            </div>
            
            <p style="margin: 0 0 24px; color: #666; font-size: 14px; line-height: 1.6;">
                If you have already made this payment, please disregard this reminder. For any questions, please contact us.
            </p>
            
            <p style="margin: 0; color: #666; font-size: 14px;">
                Thank you for your business,<br/>
                <strong style="color: #111;">${businessName}</strong>
            </p>
        </div>
        
        <div style="text-align: center; padding: 16px; color: #999; font-size: 12px;">
            Sent via <a href="https://rasid.in" style="color: #3b82f6; text-decoration: none;">Rasid</a>
        </div>
    </div>
    `;
}
