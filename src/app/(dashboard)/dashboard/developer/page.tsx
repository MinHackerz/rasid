import { Metadata } from 'next';
import { requireAuth, getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getApiKeys } from '@/app/actions/api-keys';
import { DeveloperPlatform } from '@/components/dashboard/DeveloperPlatform';
import { PremiumFeatureGuard } from '@/components/dashboard/PremiumFeatureGuard';
import { PLANS, PlanType } from '@/lib/constants/plans';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
    title: 'API Platform | Rasid',
    description: 'Manage your API keys and integrations',
};

export default async function DeveloperPage() {
    const session = await requireAuth();

    if (session.role !== 'OWNER') {
        redirect('/dashboard');
    }

    // Fetch seller plan to check limits
    const seller = await (prisma.seller as any).findUnique({
        where: { id: session.sellerId },
        select: { plan: true, pdfApiUsage: true }
    });

    const currentPlanKey = (seller?.plan || 'FREE') as PlanType;
    const isAllowed = !!PLANS[currentPlanKey]?.limits.pdfApi && PLANS[currentPlanKey].limits.pdfApi > 0;
    const usageLimit = PLANS[currentPlanKey]?.limits.pdfApi || 0;
    const totalUsage = seller?.pdfApiUsage || 0;

    const keys = await getApiKeys();

    return (
        <PremiumFeatureGuard
            isAllowed={isAllowed}
            featureName="API Platform"
            description="Generate invoices programmatically using our REST API. Perfect for automation and integration."
        >
            <DeveloperPlatform
                initialKeys={keys}
                usageLimit={usageLimit}
                totalUsage={totalUsage}
                currentPlan={currentPlanKey}
            />
        </PremiumFeatureGuard>
    );
}
