
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import InventoryClient from './InventoryClient';
import { PremiumFeatureGuard } from '@/components/dashboard/PremiumFeatureGuard';
import { PLANS, PlanType } from '@/lib/constants/plans';

export default async function InventoryPage() {
    const session = await getSession();
    if (!session) return null;

    // Fetch seller plan to check limits
    const seller = await (prisma.seller as any).findUnique({
        where: { id: session.sellerId },
        select: { plan: true }
    });

    const currentPlanKey = (seller?.plan || 'FREE') as PlanType;
    const isAllowed = !!PLANS[currentPlanKey]?.limits.inventory;

    const inventoryItems = await prisma.inventoryItem.findMany({
        where: { sellerId: session.sellerId },
        orderBy: { createdAt: 'desc' },
    });

    const serializedItems = inventoryItems.map((item: any) => ({
        ...item,
        price: item.price.toString(),
        taxRate: item.taxRate.toString(),
    }));

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Inventory</h1>
                    <p className="text-neutral-500 mt-1">Manage your products and services</p>
                </div>
            </div>

            <PremiumFeatureGuard
                isAllowed={isAllowed}
                featureName="Inventory Management"
                description="Track stock, manage SKUs, and handle product variations."
            >
                <InventoryClient initialData={serializedItems} />
            </PremiumFeatureGuard>
        </div>
    );
}
