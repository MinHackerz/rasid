import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getDashboardStats, getSalesBreakdown } from '@/lib/services';

export async function GET() {
    try {
        const session = await requireAuth();

        const [stats, breakdown] = await Promise.all([
            getDashboardStats(session.sellerId),
            getSalesBreakdown(session.sellerId),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                ...stats,
                salesBreakdown: breakdown,
            },
        });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.error('Dashboard stats error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch dashboard stats' },
            { status: 500 }
        );
    }
}
