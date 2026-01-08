import { getDashboardStats } from '@/lib/services';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { formatCurrency, formatCompactNumber } from '@/lib/utils';
import { StatCard } from '@/components/ui';
import { FileText, DollarSign, Activity, Clock } from 'lucide-react';

export async function DashboardStatsGrid() {
    const session = await getSession();

    if (!session) {
        return null; // Or handle error appropriately
    }

    const stats = await getDashboardStats(session.sellerId);

    // Fetch seller's preferred currency
    const seller = await prisma.seller.findUnique({
        where: { id: session.sellerId },
        select: { invoiceDefaults: true }
    });
    const currency = (seller?.invoiceDefaults as any)?.currency || 'INR';

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
                label="Total Invoices"
                value={stats.totalInvoices.toString()}
                icon={<FileText className="w-5 h-5" />}
            />
            <StatCard
                label="Total Revenue"
                value={formatCompactNumber(stats.totalRevenue, currency)}
                icon={<DollarSign className="w-5 h-5" />}
            />
            <StatCard
                label="Monthly Revenue"
                value={formatCompactNumber(stats.monthlyRevenue, currency)}
                icon={<Activity className="w-5 h-5" />}
            />
            <StatCard
                label="Pending Amount"
                value={formatCompactNumber(stats.pendingAmount, currency)}
                icon={<Clock className="w-5 h-5" />}
                className="border-orange-200 dark:border-orange-800 bg-orange-50/30 dark:bg-orange-900/10"
            />
        </div>
    );
}
