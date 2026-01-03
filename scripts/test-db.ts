
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Attempting to connect to database...');
    try {
        await prisma.$connect();
        console.log('Successfully connected to database!');
        const count = await prisma.invoice.count();
        console.log(`Invoice count: ${count}`);
    } catch (e) {
        console.error('Connection failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
