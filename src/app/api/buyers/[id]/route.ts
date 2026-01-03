import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await requireAuth();
        const { id } = params;

        const buyer = await prisma.buyer.findUnique({
            where: {
                id,
                sellerId: session.sellerId,
            },
        });

        if (!buyer) {
            return NextResponse.json(
                { success: false, error: 'Buyer not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: buyer,
        });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.error('Get buyer error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch buyer' },
            { status: 500 }
        );
    }
}
