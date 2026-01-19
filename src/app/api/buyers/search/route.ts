import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query || query.length < 2) {
            return NextResponse.json({ success: true, data: [] });
        }

        // Search buyers by name, email, or phone
        const buyers = await prisma.buyer.findMany({
            where: {
                sellerId: session.sellerId,
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } },
                    { phone: { contains: query, mode: 'insensitive' } },
                ],
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
                state: true,
                taxId: true,
            },
            take: 10,
            orderBy: { name: 'asc' },
        });

        return NextResponse.json({ success: true, data: buyers });
    } catch (error) {
        console.error('Buyer search error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to search buyers' },
            { status: 500 }
        );
    }
}
