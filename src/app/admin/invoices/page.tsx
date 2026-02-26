'use client';

import { useEffect, useState, useCallback } from 'react';
import { getAdminInvoices, type AdminInvoicesResponse } from '@/app/actions/admin';
import { format } from 'date-fns';
import { Search, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

const STATUS_OPTIONS = ['', 'DRAFT', 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED'];

export default function AdminInvoicesPage() {
    const [data, setData] = useState<AdminInvoicesResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const fetchInvoices = useCallback(() => {
        setLoading(true);
        getAdminInvoices(page, 20, search, statusFilter)
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [page, search, statusFilter]);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    useEffect(() => {
        setPage(1);
    }, [search, statusFilter]);

    const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight font-display">Invoices</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Browse all invoices generated across the platform.
                    {data && <span className="text-muted-foreground/50"> · {data.total} total</span>}
                </p>
            </div>

            {/* Status Filter Chips */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible scrollbar-hide">
                {STATUS_OPTIONS.filter(Boolean).map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(statusFilter === status ? '' : status)}
                        className={`
                            rounded-xl px-3 py-2 sm:py-2.5 border text-xs font-medium transition-all whitespace-nowrap shrink-0
                            ${statusFilter === status
                                ? getStatusActiveStyle(status)
                                : 'bg-white border-border text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                            }
                        `}>
                        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${getStatusDotColor(status)}`} />
                        {status}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <input
                    type="text"
                    placeholder="Search by invoice number or business name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                />
            </div>

            {/* Table */}
            <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3 sm:px-5 py-3">Invoice</th>
                                <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 hidden md:table-cell">Business</th>
                                <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Buyer</th>
                                <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3 sm:px-5 py-3">Amount</th>
                                <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3 sm:px-5 py-3">Payment</th>
                                <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Delivery</th>
                                <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                [...Array(10)].map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-5 py-3" colSpan={7}>
                                            <div className="h-5 bg-muted rounded animate-pulse" />
                                        </td>
                                    </tr>
                                ))
                            ) : data?.invoices.length === 0 ? (
                                <tr>
                                    <td className="px-5 py-12 text-center text-muted-foreground" colSpan={7}>
                                        <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                                        No invoices matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                data?.invoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-3 sm:px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full shrink-0 ${getStatusDotColor(inv.paymentStatus)}`} />
                                                <div className="min-w-0">
                                                    <p className="text-xs sm:text-sm font-semibold text-foreground">#{inv.invoiceNumber}</p>
                                                    <p className="text-[10px] sm:text-[11px] text-muted-foreground md:hidden truncate">{inv.sellerName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 hidden md:table-cell">
                                            <p className="text-xs text-foreground/70 truncate max-w-[160px]">{inv.sellerName}</p>
                                            <p className="text-[10px] text-muted-foreground truncate max-w-[160px]">{inv.sellerEmail}</p>
                                        </td>
                                        <td className="px-5 py-3 text-xs text-muted-foreground hidden lg:table-cell truncate max-w-[120px]">
                                            {inv.buyerName || <span className="text-muted-foreground/40 italic">—</span>}
                                        </td>
                                        <td className="px-3 sm:px-5 py-3 text-right">
                                            <span className="text-xs sm:text-sm font-semibold text-foreground/80">
                                                {inv.currency} {inv.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-5 py-3">
                                            <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full ${getStatusBadgeStyle(inv.paymentStatus)}`}>
                                                {inv.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 hidden sm:table-cell">
                                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getDeliveryBadgeStyle(inv.deliveryStatus)}`}>
                                                {inv.deliveryStatus}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-xs text-muted-foreground hidden sm:table-cell whitespace-nowrap">
                                            {format(new Date(inv.createdAt), 'dd MMM yyyy')}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-5 py-3 border-t border-border flex items-center justify-between bg-muted/20">
                        <span className="text-xs text-muted-foreground">
                            Page {page} of {totalPages} · {data?.total} total
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function getStatusDotColor(status: string) {
    const colors: Record<string, string> = {
        PAID: 'bg-emerald-500',
        PENDING: 'bg-amber-500',
        DRAFT: 'bg-gray-400',
        OVERDUE: 'bg-red-500',
        CANCELLED: 'bg-gray-400',
    };
    return colors[status] || 'bg-gray-400';
}

function getStatusBadgeStyle(status: string) {
    const styles: Record<string, string> = {
        PAID: 'bg-emerald-50 text-emerald-700',
        PENDING: 'bg-amber-50 text-amber-700',
        DRAFT: 'bg-gray-100 text-gray-500',
        OVERDUE: 'bg-red-50 text-red-700',
        CANCELLED: 'bg-gray-100 text-gray-500',
    };
    return styles[status] || 'bg-gray-100 text-gray-500';
}

function getDeliveryBadgeStyle(status: string) {
    const styles: Record<string, string> = {
        DRAFT: 'bg-gray-50 text-gray-500',
        SENT: 'bg-blue-50 text-blue-600',
        VIEWED: 'bg-violet-50 text-violet-600',
        DOWNLOADED: 'bg-emerald-50 text-emerald-600',
    };
    return styles[status] || 'bg-gray-50 text-gray-500';
}

function getStatusActiveStyle(status: string) {
    const styles: Record<string, string> = {
        PAID: 'bg-emerald-50 border-emerald-300 text-emerald-700',
        PENDING: 'bg-amber-50 border-amber-300 text-amber-700',
        DRAFT: 'bg-gray-100 border-gray-300 text-gray-600',
        OVERDUE: 'bg-red-50 border-red-300 text-red-700',
        CANCELLED: 'bg-gray-100 border-gray-300 text-gray-600',
    };
    return styles[status] || 'bg-gray-100 border-gray-300 text-gray-600';
}
