'use server';

import { getSession } from '@/lib/auth';
import { getInvoiceActivities, type ActivityItem } from '@/lib/services/activity';

export async function fetchInvoiceActivities(
    invoiceId: string
): Promise<{ data?: ActivityItem[]; error?: string }> {
    const session = await getSession();
    if (!session) {
        return { error: 'Unauthorized' };
    }

    try {
        const activities = await getInvoiceActivities(invoiceId, session.sellerId);
        return { data: activities };
    } catch (error) {
        console.error('[fetchInvoiceActivities]', error);
        return { error: 'Failed to load activity timeline' };
    }
}
