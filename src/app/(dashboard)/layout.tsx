import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getSession, getUserBusinesses, getUserPlan } from '@/lib/auth';
import { PlanType } from '@/lib/constants/plans';
import DashboardShell from '@/components/layout/DashboardShell';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await currentUser();

    if (!user) {
        redirect('/sign-in');
    }

    const session = await getSession();
    const businesses = await getUserBusinesses();

    // Use cached plan fetch - this will be reused by child pages
    const plan = await getUserPlan();

    return (
        <DashboardShell
            businessName={session?.businessName || 'No Business'}
            businesses={businesses}
            role={session?.role}
            plan={plan}
            hasSession={!!session}
        >
            {children}
        </DashboardShell>
    );
}
