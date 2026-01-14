
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import PricingClient from './PricingClient';
import { PlanType } from '@/lib/constants/plans';

export default async function PricingPage() {
    const session = await requireAuth();

    const seller = await (prisma.seller as any).findFirst({
        where: { id: session.sellerId },
        select: {
            plan: true,
            email: true,
            cancelledAt: true,
            subscriptionEndsAt: true
        }
    });

    // Default to FREE if not found (though should be found if authenticated)
    const currentPlan = (seller?.plan || 'FREE') as PlanType;
    const hasPendingCancellation = currentPlan !== 'FREE' && !!seller?.cancelledAt;
    const subscriptionEndsAt = seller?.subscriptionEndsAt ? new Date(seller.subscriptionEndsAt).toISOString() : null;

    return (
        <PricingClient
            currentPlan={currentPlan}
            hasPendingCancellation={hasPendingCancellation}
            subscriptionEndsAt={subscriptionEndsAt}
        />
    );
}
