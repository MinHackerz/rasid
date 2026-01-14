import { getSession } from '@/lib/auth';
import { Plus, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Suspense } from 'react';
import { InvoicesTable } from '@/components/dashboard/InvoicesTable';
import { InvoicesTableSkeleton } from '@/components/skeletons/DashboardSkeletons';
import { InvoicesSearch } from '@/components/dashboard/InvoicesSearch';
import { InvoiceSourceDropdown } from '@/components/dashboard/InvoiceSourceDropdown';

interface PageProps {
    searchParams: Promise<{
        page?: string;
        status?: string;
        search?: string;
        source?: string;
    }>;
}

export default async function InvoicesPage({ searchParams }: PageProps) {
    const session = await getSession();
    if (!session) return null;

    const params = await searchParams;
    const status = params.status || 'ALL';
    const source = params.source || 'MANUAL'; // Default to MANUAL (Digital Invoices)
    const search = params.search || '';

    // Statuses helper for rendering tabs (static list)
    const statuses = ['ALL', 'DRAFT', 'PENDING', 'SENT', 'PAID'];

    // Fetch seller plan
    const seller = await import('@/lib/prisma').then(m => m.prisma.seller.findUnique({
        where: { id: session.sellerId },
        select: { plan: true } as any
    })) as any;

    const isFreePlan = seller?.plan === 'FREE';

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight font-display">Invoices</h1>
                        <p className="text-neutral-500 mt-1.5 text-sm">Manage and track all your invoices</p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Link
                            href="/dashboard/scans"
                            className="flex-1 sm:flex-none justify-center inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-white text-neutral-900 border border-neutral-200 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-200"
                        >
                            <FileText className="w-4 h-4 text-neutral-500" />
                            <span className="whitespace-nowrap">Pending Scans</span>
                        </Link>
                        <Link
                            href="/dashboard/invoices/new"
                            className="flex-1 sm:flex-none justify-center inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-neutral-900 text-white rounded-xl shadow-sm hover:bg-neutral-800 hover:shadow-md hover:-translate-y-px active:translate-y-0 active:shadow-sm transition-all duration-200"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="whitespace-nowrap">New Invoice</span>
                        </Link>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="w-full">
                    <InvoicesSearch initialSearch={search} status={status} source={source} />
                </div>
            </div>

            {/* Filters Section */}
            <div className="flex flex-col gap-4">
                {/* Source Dropdown */}
                <div>
                    <InvoiceSourceDropdown
                        currentSource={source}
                        currentStatus={status}
                        currentSearch={search}
                    />
                </div>

                {/* Status Filters */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {statuses.map((s) => {
                        const isActive = s === status || (s === 'ALL' && !params.status);

                        // Construct URL preserving search and source
                        const href = `/dashboard/invoices${s === 'ALL' ? '' : `?status=${s}`}${source && source !== 'MANUAL' ? `&source=${source}` : ''}${search ? `&search=${encodeURIComponent(search)}` : ''}`;

                        return (
                            <Link
                                key={s}
                                href={href}
                                className={cn(
                                    "px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap",
                                    isActive
                                        ? 'bg-neutral-900 text-white shadow-sm'
                                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                )}
                            >
                                {s === 'ALL' ? 'All Invoices' : s.charAt(0) + s.slice(1).toLowerCase()}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Invoices Table */}
            <Suspense key={JSON.stringify(params)} fallback={<InvoicesTableSkeleton />}>
                <InvoicesTable searchParams={params} isFreePlan={isFreePlan} />
            </Suspense>
        </div>
    );
}
