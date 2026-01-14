import { getSession } from '@/lib/auth';
import { Card, CardBody } from '@/components/ui';
import {
    FileText,
    ArrowUpRight,
    Plus,
    CreditCard,
    BarChart2
} from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { DashboardStatsGrid } from '@/components/dashboard/DashboardStatsGrid';
import { RecentInvoicesList } from '@/components/dashboard/RecentInvoicesList';
import { InvoiceBreakdown } from '@/components/dashboard/InvoiceBreakdown';
import { StatsGridSkeleton, RecentInvoicesSkeleton } from '@/components/skeletons/DashboardSkeletons';
import { Skeleton } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const session = await getSession();

    if (!session) {
        return null;
    }

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="space-y-10">
            {/* Welcome Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-2">
                    <p className="text-muted-foreground font-medium">{getGreeting()}, {session.businessName}</p>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground font-display">
                        Overview
                    </h1>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/dashboard/analytics"
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold bg-background border border-border text-foreground hover:bg-muted/50 rounded-xl transition-all duration-200"
                    >
                        <BarChart2 className="w-5 h-5" />
                        Advanced Analytics
                    </Link>
                    <Link
                        href="/dashboard/invoices/new"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold bg-primary text-primary-foreground border border-border rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/30 transition-all duration-200 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Create New Invoice
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <Suspense fallback={<StatsGridSkeleton />}>
                <DashboardStatsGrid />
            </Suspense>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Recent Invoices - Takes up 2 cols */}
                <div className="xl:col-span-2 flex flex-col">
                    <Suspense fallback={<RecentInvoicesSkeleton />}>
                        <RecentInvoicesList />
                    </Suspense>
                </div>

                {/* Side Panel - Quick Actions & Status */}
                <div className="space-y-8">
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
                        <div className="grid gap-4">
                            <Link href="/dashboard/upload">
                                <Card hover className="group cursor-pointer">
                                    <CardBody className="flex items-center gap-4 py-5">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-foreground">Upload Invoice</h3>
                                            <p className="text-xs text-muted-foreground mt-0.5">Digitize with AI</p>
                                        </div>
                                        <ArrowUpRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                                    </CardBody>
                                </Card>
                            </Link>
                            <Link href="/dashboard/buyers">
                                <Card hover className="group cursor-pointer">
                                    <CardBody className="flex items-center gap-4 py-5">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
                                            <CreditCard className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-foreground">Manage Buyers</h3>
                                            <p className="text-xs text-muted-foreground mt-0.5">Organize clients</p>
                                        </div>
                                        <ArrowUpRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                                    </CardBody>
                                </Card>
                            </Link>
                        </div>
                    </div>

                    <Suspense fallback={<div className="space-y-4"><Skeleton className="h-6 w-32" /><Skeleton className="h-48 w-full" /></div>}>
                        <InvoiceBreakdown />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
