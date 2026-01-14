
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkLimit } from '@/lib/access-control';

export async function GET(req: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const inventoryItems = await prisma.inventoryItem.findMany({
            where: { sellerId: session.sellerId },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ success: true, data: inventoryItems });
    } catch (error) {
        console.error('Failed to fetch inventory:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    try {
        const canManageInventory = await checkLimit(session.sellerId, 'inventory');
        if (!canManageInventory) {
            return NextResponse.json({ error: 'Inventory management is not available on your plan.' }, { status: 403 });
        }

        const body = await req.json();
        const { description, note, sku, hsnCode, quantity, unit, price, taxRate } = body;

        if (!description || price === undefined) {
            return NextResponse.json({ error: 'Description and Price are required' }, { status: 400 });
        }

        const newItem = await prisma.inventoryItem.create({
            data: {
                sellerId: session.sellerId,
                description,
                note,
                sku,
                hsnCode,
                quantity: quantity || 0,
                unit: unit || 'pcs',
                price,
                taxRate: taxRate || 0,
            },
        });

        return NextResponse.json({ success: true, data: newItem });
    } catch (error) {
        console.error('Failed to create inventory item:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
