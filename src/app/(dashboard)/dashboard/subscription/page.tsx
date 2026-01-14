
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import SubscriptionClient from './SubscriptionClient';

export default async function SubscriptionPage() {
    const session = await requireAuth();

    const seller = await (prisma.seller as any).findUnique({
        where: { id: session.sellerId },
        select: {
            plan: true,
            invoicesCount: true,
            pdfApiUsage: true,
            ocrUsage: true,
            lastResetDate: true,
            subscriptionId: true,
            cancelledAt: true,
            subscriptionEndsAt: true,
        }
    });

    if (!seller) {
        return <div>Seller not found</div>;
    }

    return <SubscriptionClient seller={seller} />;
}
