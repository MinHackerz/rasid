import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getSession, getUserBusinesses, getUserPlan } from '@/lib/auth';
import { PlanType } from '@/lib/constants/plans';
import DashboardShell from '@/components/layout/DashboardShell';
import { checkIsAdmin } from '@/app/actions/admin';
import { getUserApplicationStatus } from '@/app/actions/referrals';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await currentUser();

    if (!user) {
        redirect('/sign-in?redirect_url=/dashboard');
    }

    const session = await getSession();
    const businesses = await getUserBusinesses();

    // Use cached plan fetch - this will be reused by child pages
    const plan = await getUserPlan();

    // Check flags for features
    const isAdmin = await checkIsAdmin();
    const referrerStatus = await getUserApplicationStatus(user.id);

    return (
        <DashboardShell
            businessName={session?.businessName || 'No Business'}
            businesses={businesses}
            role={session?.role}
            plan={plan}
            hasSession={!!session}
            isAdmin={isAdmin}
            referrerToken={referrerStatus.status === 'approved' ? referrerStatus.portalToken : null}
        >
            {children}
        </DashboardShell>
    );
}
