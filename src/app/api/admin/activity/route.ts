import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminUser } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        await requireAdminUser();
    } catch {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '30', 10);
    const type = searchParams.get('type') || '';

    const where: any = {};
    if (type) {
        where.type = type;
    }

    const [total, activities] = await Promise.all([
        (prisma as any).invoiceActivity.count({ where }),
        (prisma as any).invoiceActivity.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: {
                invoice: {
                    select: {
                        invoiceNumber: true,
                        seller: { select: { businessName: true } },
                    },
                },
            },
        }),
    ]);

    return NextResponse.json({
        activities: activities.map((act: any) => ({
            id: act.id,
            type: act.type,
            title: act.title,
            description: act.description,
            actorType: act.actorType,
            actorName: act.actorName,
            createdAt: act.createdAt.toISOString(),
            invoiceNumber: act.invoice?.invoiceNumber || 'N/A',
            sellerName: act.invoice?.seller?.businessName || 'Unknown',
        })),
        total,
        page,
        pageSize,
    });
}
