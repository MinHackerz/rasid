
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import InventoryClient from './InventoryClient';

export default async function InventoryPage() {
    const session = await getSession();
    if (!session) return null;

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
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Inventory</h1>
                    <p className="text-neutral-500 mt-1">Manage your products and services</p>
                </div>
            </div>

            <InventoryClient initialData={serializedItems} />
        </div>
    );
}
