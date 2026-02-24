import { PrismaClient } from '@prisma/client';
// Prisma client with ApiKey model support

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Next.js statically evaluates routes during build. 
// If Vercel doesn't pass the DATABASE_URL to the build environment, Prisma fails to initialize.
// We use a dummy URL during build phase to prevent crash. It will fail gracefully at runtime if actually used.
const dummyUrl = "postgresql://dummy:dummy@localhost:5432/dummy";
const databaseUrl = process.env.DATABASE_URL || dummyUrl;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: databaseUrl,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
