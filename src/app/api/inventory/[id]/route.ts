
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await req.json();

        // Verify ownership
        const existingItem = await prisma.inventoryItem.findFirst({
            where: { id, sellerId: session.sellerId }
        });

        if (!existingItem) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        const updatedItem = await prisma.inventoryItem.update({
            where: { id },
            data: {
                ...body,
                updatedAt: new Date(),
            }
        });

        return NextResponse.json({ success: true, data: updatedItem });
    } catch (error) {
        console.error('Failed to update inventory item:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;

        // Verify ownership
        const existingItem = await prisma.inventoryItem.findFirst({
            where: { id, sellerId: session.sellerId }
        });

        if (!existingItem) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        await prisma.inventoryItem.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete inventory item:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
