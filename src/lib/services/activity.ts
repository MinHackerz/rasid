/**
 * Invoice Activity Service
 * 
 * Records and retrieves audit trail events for invoices.
 * Every significant action (create, send, verify, status change, etc.)
 * is logged here for a complete activity timeline.
 */

import { prisma } from '@/lib/prisma';
import { ActivityType, ActorType, Prisma } from '@prisma/client';

// ============================================
// Types
// ============================================
export interface RecordActivityInput {
    invoiceId: string;
    type: ActivityType;
    title: string;
    description?: string;
    actorType?: ActorType;
    actorId?: string;
    actorName?: string;
    metadata?: Record<string, any>;
}

export interface ActivityItem {
    id: string;
    type: ActivityType;
    title: string;
    description: string | null;
    actorType: ActorType;
    actorName: string | null;
    metadata: Record<string, any> | null;
    createdAt: Date;
}

// ============================================
// Record an activity (fire-and-forget safe)
// ============================================
export async function recordActivity(input: RecordActivityInput): Promise<void> {
    try {
        await prisma.invoiceActivity.create({
            data: {
                invoiceId: input.invoiceId,
                type: input.type,
                title: input.title,
                description: input.description || null,
                actorType: input.actorType || 'SYSTEM',
                actorId: input.actorId || null,
                actorName: input.actorName || null,
                metadata: input.metadata || Prisma.JsonNull,
            },
        });
    } catch (error) {
        // Activity logging should never break the main flow
        console.error('[ActivityService] Failed to record activity:', error);
    }
}

// ============================================
// Get activities for an invoice
// ============================================
export async function getInvoiceActivities(
    invoiceId: string,
    sellerId: string,
    limit: number = 50
): Promise<ActivityItem[]> {
    // Verify the invoice belongs to the seller first
    const invoice = await prisma.invoice.findFirst({
        where: { id: invoiceId, sellerId },
        select: { id: true },
    });

    if (!invoice) return [];

    const activities = await prisma.invoiceActivity.findMany({
        where: { invoiceId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
            id: true,
            type: true,
            title: true,
            description: true,
            actorType: true,
            actorName: true,
            metadata: true,
            createdAt: true,
        },
    });

    return activities.map(a => ({
        ...a,
        metadata: a.metadata as Record<string, any> | null,
    }));
}

// ============================================
// Convenience helpers for common events
// ============================================

export function logInvoiceCreated(invoiceId: string, sellerId: string, sellerName: string, invoiceNumber: string, sourceType: string) {
    const isOCR = sourceType === 'OCR';
    return recordActivity({
        invoiceId,
        type: 'CREATED',
        title: 'Invoice Created',
        description: isOCR
            ? `Invoice ${invoiceNumber} was created from a digitized document`
            : `Invoice ${invoiceNumber} was created manually`,
        actorType: 'SELLER',
        actorId: sellerId,
        actorName: sellerName,
        metadata: { sourceType, invoiceNumber },
    });
}

export function logInvoiceSent(invoiceId: string, sellerId: string, sellerName: string, method: string, recipient: string) {
    return recordActivity({
        invoiceId,
        type: 'SENT',
        title: `Sent via ${method.charAt(0) + method.slice(1).toLowerCase()}`,
        description: `Invoice delivered to ${recipient}`,
        actorType: 'SELLER',
        actorId: sellerId,
        actorName: sellerName,
        metadata: { method, recipient },
    });
}

export function logInvoiceVerified(invoiceId: string, success: boolean, ip?: string, userAgent?: string) {
    return recordActivity({
        invoiceId,
        type: 'VERIFIED',
        title: success ? 'Verification Passed' : 'Verification Failed',
        description: success
            ? 'Someone scanned the QR code and the invoice was confirmed authentic'
            : 'A verification attempt was made but the signature check failed',
        actorType: 'ANONYMOUS',
        actorName: 'Visitor',
        metadata: { success, ip: ip || null, userAgent: userAgent?.substring(0, 120) || null },
    });
}

export function logStatusChanged(invoiceId: string, sellerId: string, sellerName: string, field: string, oldStatus: string, newStatus: string) {
    return recordActivity({
        invoiceId,
        type: 'STATUS_CHANGED',
        title: `${field} changed to ${newStatus}`,
        description: `${field} was updated from "${oldStatus}" to "${newStatus}"`,
        actorType: 'SELLER',
        actorId: sellerId,
        actorName: sellerName,
        metadata: { field, oldStatus, newStatus },
    });
}

export function logPDFDownloaded(invoiceId: string, actorType: ActorType = 'SELLER', actorName?: string) {
    return recordActivity({
        invoiceId,
        type: 'DOWNLOADED',
        title: 'PDF Downloaded',
        description: 'The invoice PDF was downloaded',
        actorType,
        actorName: actorName || undefined,
    });
}

export function logReminderSent(invoiceId: string, channel: string, recipient: string) {
    return recordActivity({
        invoiceId,
        type: 'REMINDER_SENT',
        title: 'Payment Reminder Sent',
        description: `Reminder sent to ${recipient} via ${channel.toLowerCase()}`,
        actorType: 'SYSTEM',
        actorName: 'Rasid',
        metadata: { channel, recipient },
    });
}
