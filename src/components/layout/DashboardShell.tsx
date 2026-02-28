'use client';

import React from 'react';
import { SidebarProvider, useSidebar } from '@/components/layout/SidebarContext';
import { Sidebar, Header } from '@/components/layout';
import { PlanType } from '@/lib/constants/plans';
import { NoBusinessAlert } from '@/components/dashboard/NoBusinessAlert';
import { ReferralSync } from '@/components/dashboard/ReferralSync';

interface DashboardShellProps {
    children: React.ReactNode;
    businessName: string;
    businesses: { id: string; businessName: string | null }[];
    role?: 'OWNER' | 'ADMIN' | 'VIEWER';
    plan: PlanType;
    hasSession: boolean;
    isAdmin?: boolean;
    referrerToken?: string | null;
}

function DashboardShellInner({ children, businessName, businesses, role, plan, hasSession, isAdmin, referrerToken }: DashboardShellProps) {
    const { collapsed } = useSidebar();

    return (
        <div className="min-h-screen bg-background-subtle">
            <ReferralSync />
            <Sidebar businessName={businessName} businesses={businesses as { id: string; businessName: string }[]} role={role} plan={plan} />

            <main className={`${collapsed ? 'lg:ml-[72px]' : 'lg:ml-64'} ml-0 min-h-screen flex flex-col transition-all duration-300`}>
                <Header
                    showSearch
                    businessName={businessName}
                    businesses={businesses}
                    role={role}
                    plan={plan}
                    isAdmin={isAdmin}
                    referrerToken={referrerToken}
                />
                <div className="flex-1 p-6 lg:p-10 max-w-[1600px] mx-auto w-full animate-enter">
                    {hasSession ? children : <NoBusinessAlert />}
                </div>
            </main>
        </div>
    );
}

export default function DashboardShell(props: DashboardShellProps) {
    return (
        <SidebarProvider>
            <DashboardShellInner {...props} />
        </SidebarProvider>
    );
}
