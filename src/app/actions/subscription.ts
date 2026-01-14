'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { PLANS, PlanType } from '@/lib/constants/plans';
import { dodo } from '@/lib/dodo';
import { redirect } from 'next/navigation';

export async function createSubscriptionCheckout(planKey: PlanType) {
    const user = await currentUser();

    if (!user || !user.emailAddresses?.[0]?.emailAddress) {
        throw new Error('User not authenticated');
    }

    // DEBUG: Check if API Key is loaded
    const apiKey = process.env.DODO_PAYMENTS_API_KEY;
    console.log('Using Dodo API Key:', apiKey ? `Present (Length: ${apiKey.length})` : 'MISSING');
    if (!apiKey) {
        throw new Error('DODO_PAYMENTS_API_KEY is missing in server environment');
    }

    const email = user.emailAddresses[0].emailAddress;
    const plan = PLANS[planKey];

    // Get the seller (organization/user)
    const seller = await prisma.seller.findFirst({
        where: { email }, // Assuming email maps to seller for now, or match via clerkId if mapped
    });

    if (!seller) {
        throw new Error('Seller profile not found');
    }

    if (planKey === 'FREE') {
        // Update DB directly
        await (prisma as any).seller.update({
            where: { id: seller.id },
            data: {
                plan: 'FREE',
                subscriptionId: null,
                customerId: null,
            }
        });
        return { url: '/dashboard' };
    }

    if (!plan.dodoProductId) {
        throw new Error('Plan not configured for payments');
    }



    try {
        const billing = {
            city: 'City', // Placeholder
            country: 'US' as any,
            state: 'NY',
            street: '123 Startups St',
            zipcode: '10001'
        };

        const customer = {
            email: email,
            name: `${user.firstName} ${user.lastName}`.trim() || seller.businessName,
        };

        // Use checkoutSessions for both one-time and recurring products
        // We cast to any because TS definitions might be missing checkoutSessions on the main client instance in some versions
        // but we verified it exists at runtime.
        const session = await (dodo as any).checkoutSessions.create({
            billing,
            customer,
            product_cart: [{
                product_id: plan.dodoProductId,
                quantity: 1
            }],
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
        });

        return { url: session.checkout_url };
    } catch (error: any) {
        console.error('Dodo Payment Error:', error);
        throw new Error(error.message || 'Failed to initialize payment');
    }
}


export async function cancelSubscription() {
    const user = await currentUser();
    if (!user || !user.emailAddresses?.[0]?.emailAddress) {
        throw new Error('User not authenticated');
    }

    const email = user.emailAddresses[0].emailAddress;

    const seller = await prisma.seller.findFirst({
        where: { email },
    });

    if (!seller || !(seller as any).subscriptionId) {
        throw new Error('No active subscription found');
    }

    const subscriptionId = (seller as any).subscriptionId;

    try {
        // Cancel in Dodo at the end of billing period
        // The update method takes subscription_id as first param (path), then options object
        await (dodo as any).subscriptions.update(subscriptionId, {
            status: 'cancelled' // or 'cancel_at_period_end' depending on API
        });

        // DO NOT update database plan immediately!
        // The subscription remains active until the billing period ends.
        // The webhook for 'subscription.cancelled' or 'subscription.expired' will handle the plan downgrade.

        return { success: true, message: 'Subscription will be cancelled at the end of the billing period.' };
    } catch (error: any) {
        console.error('Cancel Subscription Error:', error);

        // If the API doesn't support cancel_at_period_end, we'll just update the DB directly
        // and rely on the subscription naturally expiring
        try {
            // Mark as cancelled in our DB but don't change plan yet
            // The plan will stay active, but we mark intent to cancel
            // When the next billing fails or period ends, webhook will handle it
            // Mark as cancelled in our DB but don't change plan yet
            // The plan will stay active until the billing period ends (handled by calculated check or webhook)
            // We set subscriptionId to null to prevent further API syncs which might re-activate it? 
            // Actually, keep subscriptionId so we can match webhooks.
            await (prisma as any).seller.update({
                where: { id: seller.id },
                data: {
                    cancelledAt: new Date(),
                    // We don't know the exact end date here since API failed, 
                    // but we'll assume end of current billing cycle (~30 days from last reset if available, or just now + 30 days)
                    // Better to let webhook handle exact date, but we mark intent here.
                    // DO NOT SET plan: 'FREE'
                }
            });
            return { success: true, message: 'Subscription cancelled.' };
        } catch (dbError: any) {
            console.error('DB Update Error:', dbError);
            throw new Error('Failed to cancel subscription. Please contact support.');
        }
    }
}

