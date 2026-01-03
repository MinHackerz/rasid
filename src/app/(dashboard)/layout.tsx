import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getSession, getUserBusinesses } from '@/lib/auth';
import { Sidebar, Header } from '@/components/layout';

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

    if (!session) {
        redirect('/onboarding');
    }

    const businesses = await getUserBusinesses();

    return (
        <div className="min-h-screen bg-background-subtle">
            <Sidebar businessName={session.businessName} businesses={businesses} />

            <main className="lg:ml-64 ml-0 min-h-screen flex flex-col transition-all duration-300">
                <Header
                    showSearch
                    businessName={session.businessName}
                    businesses={businesses}
                />
                <div className="flex-1 p-6 lg:p-10 max-w-[1600px] mx-auto w-full animate-enter">
                    {children}
                </div>
            </main>
        </div>
    );
}
