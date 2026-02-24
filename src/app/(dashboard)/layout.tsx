import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getSession, getUserBusinesses, getUserPlan } from '@/lib/auth';
import { Sidebar, Header } from '@/components/layout';
import { PlanType } from '@/lib/constants/plans';
import { NoBusinessAlert } from '@/components/dashboard/NoBusinessAlert';

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

    // If no session but has businesses, or no businesses at all, we land here.
    // We only redirect to onboarding if they really have NO way to get a session? 
    // Actually, let's allow them to see the dashboard without a session.
    // If they have no session, they might need to create one.

    // Use cached plan fetch - this will be reused by child pages
    const plan = await getUserPlan();

    return (
        <div className="min-h-screen bg-background-subtle">
            <Sidebar businessName={session?.businessName || 'No Business'} businesses={businesses} role={session?.role} plan={plan} />

            <main className="lg:ml-64 ml-0 min-h-screen flex flex-col transition-all duration-300">
                <Header
                    showSearch
                    businessName={session?.businessName || 'No Business'}
                    businesses={businesses}
                    role={session?.role}
                    plan={plan}
                />
                <div className="flex-1 p-6 lg:p-10 max-w-[1600px] mx-auto w-full animate-enter">
                    {session ? children : <NoBusinessAlert />}
                </div>
            </main>
        </div>
    );
}
