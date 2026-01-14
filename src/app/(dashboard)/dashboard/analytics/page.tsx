import { PremiumFeatureGuard } from '@/components/dashboard/PremiumFeatureGuard';
import { AnalyticsDashboard } from '@/components/dashboard/AnalyticsDashboard';
import { getAnalyticsData, AnalyticsData } from '@/app/actions/analytics';
import { getSession, getUserPlan } from '@/lib/auth';
import type { PlanType } from '@/lib/constants/plans';

export const dynamic = 'force-dynamic';

const MOCK_DATA: AnalyticsData = {
    totalRevenue: 1250000,
    pendingRevenue: 45000,
    overdueRevenue: 12000,
    monthlyRevenue: Array.from({ length: 6 }, (_, i) => ({
        name: new Date(2025, i, 1).toLocaleString('default', { month: 'short', year: 'numeric' }),
        value: Math.floor(Math.random() * 500000) + 100000
    })),
    statusDistribution: [
        { name: 'Paid', value: 45, color: '#10b981' },
        { name: 'Pending', value: 12, color: '#f59e0b' },
        { name: 'Overdue', value: 5, color: '#ef4444' },
    ],
    topBuyers: [
        { name: 'Acme Corp', value: 500000 },
        { name: 'Global Tech', value: 350000 },
        { name: 'Local Biz', value: 200000 },
    ],
    averageInvoiceValue: 25000
};

const ALLOWED_PLANS: PlanType[] = ['PRO', 'PREMIUM', 'LIFETIME'];

export default async function AnalyticsPage() {
    const session = await getSession();
    const plan = await getUserPlan();
    const isAllowed = ALLOWED_PLANS.includes(plan);

    let data: AnalyticsData = MOCK_DATA;

    if (isAllowed) {
        const result = await getAnalyticsData();
        if (!('error' in result)) {
            data = result;
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight font-display">Advanced Analytics</h1>
                <p className="text-muted-foreground">
                    Deep insights into your business performance and revenue streams.
                </p>
            </div>

            <PremiumFeatureGuard
                isAllowed={isAllowed}
                featureName="Advanced Analytics"
                description="Unlock deep insights, revenue trends, and customer behavior analysis with our Advanced Analytics suite. Available on Pro, Premium, and Lifetime plans."
            >
                <AnalyticsDashboard data={data} />
            </PremiumFeatureGuard>
        </div>
    );
}
