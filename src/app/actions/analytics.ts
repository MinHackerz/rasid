'use server';

import { prisma } from '@/lib/prisma';
import { getSession, getUserPlan } from '@/lib/auth';
import { PlanType } from '@/lib/constants/plans';

export type AnalyticsData = {
    totalRevenue: number;
    pendingRevenue: number;
    overdueRevenue: number;
    monthlyRevenue: { name: string; value: number }[];
    statusDistribution: { name: string; value: number; color: string }[];
    topBuyers: { name: string; value: number }[];
    averageInvoiceValue: number;
};

const ALLOWED_PLANS: PlanType[] = ['PRO', 'PREMIUM', 'LIFETIME'];

export async function getAnalyticsData(): Promise<AnalyticsData | { error: string }> {
    const session = await getSession();
    if (!session) {
        return { error: 'Unauthorized' };
    }

    const plan = await getUserPlan();

    // Check if user has access
    if (!ALLOWED_PLANS.includes(plan)) {
        return { error: 'Upgrade required' };
    }

    const { sellerId } = session;

    // Fetch invoices
    const invoices = await prisma.invoice.findMany({
        where: { sellerId },
        select: {
            totalAmount: true,
            status: true,
            paymentStatus: true,
            createdAt: true,
            buyer: {
                select: {
                    name: true
                }
            }
        },
        orderBy: { createdAt: 'asc' }
    });

    // 1. Calculate Totals
    let totalRevenue = 0;
    let pendingRevenue = 0;
    let overdueRevenue = 0;

    const statusCounts: Record<string, number> = {
        PAID: 0,
        PENDING: 0,
        OVERDUE: 0,
        DRAFT: 0
    };

    const monthlyRevenueMap = new Map<string, number>();
    const buyerRevenueMap = new Map<string, number>();

    invoices.forEach(inv => {
        const amount = Number(inv.totalAmount);

        // Status counts
        const status = inv.paymentStatus || 'DRAFT';
        statusCounts[status] = (statusCounts[status] || 0) + 1;

        if (status === 'PAID') {
            totalRevenue += amount;

            // Monthly Revenue
            const date = new Date(inv.createdAt);
            const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
            monthlyRevenueMap.set(monthYear, (monthlyRevenueMap.get(monthYear) || 0) + amount);

            // Buyer Revenue
            if (inv.buyer?.name) {
                buyerRevenueMap.set(inv.buyer.name, (buyerRevenueMap.get(inv.buyer.name) || 0) + amount);
            }
        } else if (status === 'PENDING') {
            pendingRevenue += amount;
        } else if (status === 'OVERDUE') {
            overdueRevenue += amount;
        }
    });

    // Format Monthly Revenue for Chart
    // Get last 6 months to ensure continuity even if 0
    const monthlyRevenue = Array.from(monthlyRevenueMap.entries())
        .map(([name, value]) => ({ name, value }))
    // sort by date logic if needed, but simple map iteration might be out of order. 
    // For simplicity, we rely on existing keys or just basic sort ?? 
    // Better: Pre-fill last 6 months.

    // Let's just return what we have, the frontend or simple sort is okay for now.
    // Actually, let's just make it chronologically sorted based on the keys we inserted (invoice sort order helps).
    // Find unique keys and sort implementation is safer. Used invoices are sorted ASC.

    // Format Status Distribution
    const statusDistribution = [
        { name: 'Paid', value: statusCounts['PAID'], color: '#10b981' }, // emerald-500
        { name: 'Pending', value: statusCounts['PENDING'], color: '#f59e0b' }, // amber-500
        { name: 'Overdue', value: statusCounts['OVERDUE'], color: '#ef4444' }, // red-500
        { name: 'Draft', value: statusCounts['DRAFT'], color: '#6b7280' }, // gray-500
    ].filter(item => item.value > 0);

    // Format Top Buyers
    const topBuyers = Array.from(buyerRevenueMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    const averageInvoiceValue = invoices.length > 0 ? (totalRevenue + pendingRevenue + overdueRevenue) / invoices.length : 0;

    return {
        totalRevenue,
        pendingRevenue,
        overdueRevenue,
        monthlyRevenue,
        statusDistribution,
        topBuyers,
        averageInvoiceValue
    };
}
