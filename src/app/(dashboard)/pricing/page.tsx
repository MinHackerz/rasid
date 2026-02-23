
import { Metadata } from 'next';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import PricingClient from './PricingClient';
import { PlanType } from '@/lib/constants/plans';

export const metadata: Metadata = {
    title: 'Pricing Plans',
    description: 'Choose the right Rasid plan for your business. From Free to Lifetime — AI invoicing, OCR digitization, payment reminders, and API access.',
    openGraph: {
        title: 'Pricing Plans - Rasid',
        description: 'From Free to Lifetime — find the right invoice platform plan for your business.',
        images: [{ url: '/api/og?page=pricing', width: 1200, height: 630, alt: 'Rasid Pricing Plans' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Pricing Plans - Rasid',
        description: 'From Free to Lifetime — AI invoicing, OCR, payment reminders, and more.',
        images: ['/api/og?page=pricing'],
    },
};

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
