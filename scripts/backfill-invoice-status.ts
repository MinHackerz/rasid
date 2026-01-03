import { PrismaClient, InvoiceStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting migration of invoice statuses...');

    const invoices = await prisma.invoice.findMany();

    console.log(`Found ${invoices.length} invoices to process.`);

    for (const invoice of invoices) {
        let paymentStatus: 'DRAFT' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED' = 'DRAFT';
        let deliveryStatus: 'DRAFT' | 'SENT' | 'VIEWED' | 'DOWNLOADED' = 'DRAFT';

        switch (invoice.status) {
            case 'DRAFT':
                paymentStatus = 'DRAFT';
                deliveryStatus = 'DRAFT';
                break;
            case 'PENDING':
                paymentStatus = 'PENDING';
                deliveryStatus = 'DRAFT'; // Assuming PENDING matches "Created but not Sent" if SENT exists
                break;
            case 'SENT':
                paymentStatus = 'PENDING';
                deliveryStatus = 'SENT';
                break;
            case 'PAID':
                paymentStatus = 'PAID';
                deliveryStatus = 'SENT'; // safe assumption
                break;
            case 'OVERDUE':
                paymentStatus = 'OVERDUE';
                deliveryStatus = 'SENT'; // safe assumption
                break;
            case 'CANCELLED':
                paymentStatus = 'CANCELLED';
                deliveryStatus = 'DRAFT';
                break;
        }

        // Check delivery logs for more accurate delivery status if possible
        // (Optional enhancement, skipping for speed unless critical)

        await prisma.invoice.update({
            where: { id: invoice.id },
            data: {
                paymentStatus,
                deliveryStatus,
            } as any,
        });
    }

    console.log('Migration completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
