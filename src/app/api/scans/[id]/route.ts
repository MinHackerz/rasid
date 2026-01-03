import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { id } = await params;

        const scan = await prisma.uploadedDocument.findUnique({
            where: { id }
        });

        if (!scan) {
            return new NextResponse('Not found', { status: 404 });
        }

        if (scan.sellerId !== session.sellerId) {
            return new NextResponse('Forbidden', { status: 403 });
        }

        await prisma.uploadedDocument.delete({
            where: { id }
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Delete scan error:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
