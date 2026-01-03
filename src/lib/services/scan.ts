import { prisma } from '@/lib/prisma';

export async function listPendingScans(sellerId: string) {
    return prisma.uploadedDocument.findMany({
        where: {
            sellerId,
            processingStatus: 'COMPLETED',
            invoices: {
                none: {}
            }
        },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            originalName: true,
            createdAt: true,
            confidence: true,
            extractedData: true
        }
    });
}
