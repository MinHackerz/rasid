import { getSession } from '@/lib/auth';
import { Plus, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Suspense } from 'react';
import { InvoicesTable } from '@/components/dashboard/InvoicesTable';
import { InvoicesTableSkeleton } from '@/components/skeletons/DashboardSkeletons';

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
    const source = params.source || 'MANUAL';

    // Statuses helper for rendering tabs (static list)
    const statuses = ['ALL', 'DRAFT', 'PENDING', 'SENT', 'PAID'];

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Invoices</h1>
                    <p className="text-neutral-500 mt-1">Manage and track all your invoices</p>
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
                        className="flex-1 sm:flex-none justify-center inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-neutral-900 text-white rounded-xl shadow-sm hover:bg-neutral-800 hover:shadow-md hover:-translate-y-px active:translate-y-0 active:shadow-sm transition-all duration-200"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="whitespace-nowrap">New Invoice</span>
                    </Link>
                </div>
            </div>

            {/* Source Tabs */}
            <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl w-fit">
                <Link
                    href={`/dashboard/invoices?source=MANUAL${status === 'ALL' ? '' : `&status=${status}`}`}
                    className={cn(
                        "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                        source === 'MANUAL' || !source ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-900"
                    )}
                >
                    Digital Invoices
                </Link>
                <Link
                    href={`/dashboard/invoices?source=OCR${status === 'ALL' ? '' : `&status=${status}`}`}
                    className={cn(
                        "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                        source === 'OCR' ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-900"
                    )}
                >
                    Digitized Invoices
                </Link>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
                {statuses.map((s) => {
                    const isActive = s === status
                        || (s === 'ALL' && !params.status); // Handle case where status param is missing (default All)

                    // Construct URL
                    const href = `/dashboard/invoices${s === 'ALL' ? '' : `?status=${s}`}${source ? `&source=${source}` : ''}`;

                    return (
                        <Link
                            key={s}
                            href={href}
                            className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap ${isActive
                                ? 'bg-neutral-900 text-white shadow-sm'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                }`}
                        >
                            {s === 'ALL' ? 'All Invoices' : s.charAt(0) + s.slice(1).toLowerCase()}
                        </Link>
                    );
                })}
            </div>

            {/* Invoices Table */}
            <Suspense key={JSON.stringify(params)} fallback={<InvoicesTableSkeleton />}>
                <InvoicesTable searchParams={params} />
            </Suspense>
        </div>
    );
}
