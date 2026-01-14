import { getSession } from '@/lib/auth';
import { listInvoices } from '@/lib/services';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardBody, Badge, EmptyState } from '@/components/ui';
import { InvoiceActions } from '@/components/dashboard/InvoiceActions';
import { FileText, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { InvoicesTableSkeleton } from '@/components/skeletons/DashboardSkeletons';

interface InvoicesTableProps {
    searchParams: {
        page?: string;
        status?: string;
        search?: string;
        buyerId?: string;
        source?: string;
    };
    isFreePlan?: boolean;
}

export async function InvoicesTable({ searchParams, isFreePlan = false }: InvoicesTableProps) {
    const session = await getSession();
    if (!session) return null;

    const page = parseInt(searchParams.page || '1');
    const status = searchParams.status as 'DRAFT' | 'PENDING' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED' | undefined;
    const search = searchParams.search;
    const buyerId = searchParams.buyerId;
    const sourceType = searchParams.source as 'MANUAL' | 'OCR' | 'IMPORTED' | undefined;

    const { invoices, pagination } = await listInvoices(session.sellerId, {
        page,
        status,
        search,
        buyerId,
        sourceType,
    });

    const statusVariant = (s: string) => {
        const map: Record<string, 'draft' | 'pending' | 'sent' | 'paid' | 'overdue' | 'cancelled'> = {
            DRAFT: 'draft',
            PENDING: 'pending',
            SENT: 'sent',
            PAID: 'paid',
            OVERDUE: 'overdue',
            CANCELLED: 'cancelled',
        };
        return map[s] || 'draft';
    };

    return (
        <Card>
            <CardBody className="p-0">
                {invoices.length === 0 ? (
                    <EmptyState
                        icon={<FileText className="w-12 h-12" />}
                        title="No invoices found"
                        description={status ? `No ${status.toLowerCase()} invoices` : 'Create your first invoice to get started'}
                        action={
                            <Link
                                href="/dashboard/invoices/new"
                                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Create Invoice
                            </Link>
                        }
                    />
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-neutral-50/80 border-b border-neutral-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-semibold text-neutral-700 text-xs uppercase tracking-wider">
                                            Invoice
                                        </th>
                                        <th className="px-6 py-4 text-left font-semibold text-neutral-700 text-xs uppercase tracking-wider">
                                            Buyer
                                        </th>
                                        <th className="px-6 py-4 text-left font-semibold text-neutral-700 text-xs uppercase tracking-wider">
                                            Issued
                                        </th>
                                        <th className="px-6 py-4 text-right font-semibold text-neutral-700 text-xs uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-4 text-left font-semibold text-neutral-700 text-xs uppercase tracking-wider">
                                            Payment
                                        </th>
                                        <th className="px-6 py-4 text-left font-semibold text-neutral-700 text-xs uppercase tracking-wider">
                                            Delivery
                                        </th>
                                        <th className="px-6 py-4 w-20"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {invoices.map((invoice: any) => (
                                        <tr key={invoice.id} className="hover:bg-neutral-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <Link
                                                    href={`/dashboard/invoices/${invoice.id}`}
                                                    className="font-semibold text-neutral-900 hover:text-primary transition-colors"
                                                >
                                                    {invoice.invoiceNumber}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-neutral-900">
                                                    {invoice.buyer?.name || (
                                                        <span className="text-neutral-400 italic">Walk-in</span>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-neutral-600 text-sm">
                                                {formatDate(invoice.issueDate)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-semibold text-neutral-900 tabular-nums">
                                                    {formatCurrency(invoice.totalAmount, invoice.currency)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={invoice.paymentStatus.toLowerCase()} dot>
                                                    {invoice.paymentStatus.charAt(0) + invoice.paymentStatus.slice(1).toLowerCase()}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={invoice.deliveryStatus === 'SENT' ? 'sent' : invoice.deliveryStatus === 'VIEWED' ? 'sent' : invoice.deliveryStatus === 'DOWNLOADED' ? 'sent' : 'draft'} dot className={invoice.deliveryStatus === 'SENT' ? 'bg-blue-50 text-blue-700 border-blue-200' : invoice.deliveryStatus === 'VIEWED' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : invoice.deliveryStatus === 'DOWNLOADED' ? 'bg-violet-50 text-violet-700 border-violet-200' : ''}>
                                                    {invoice.deliveryStatus.charAt(0) + invoice.deliveryStatus.slice(1).toLowerCase()}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <InvoiceActions
                                                    invoiceId={invoice.id}
                                                    hasEmail={!!invoice.buyer?.email}
                                                    hasPhone={!!invoice.buyer?.phone}
                                                    isFreePlan={isFreePlan}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-3 p-4">
                            {invoices.map((invoice: any) => (
                                <Link
                                    key={invoice.id}
                                    href={`/dashboard/invoices/${invoice.id}`}
                                    className="block bg-white border border-neutral-200 rounded-xl p-4 hover:border-neutral-300 hover:shadow-sm transition-all"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-neutral-900 mb-1">
                                                {invoice.invoiceNumber}
                                            </h3>
                                            <p className="text-sm text-neutral-600">
                                                {invoice.buyer?.name || <span className="italic text-neutral-400">Walk-in</span>}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-neutral-900 tabular-nums mb-2">
                                                {formatCurrency(invoice.totalAmount, invoice.currency)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={invoice.paymentStatus.toLowerCase()} dot className="text-xs">
                                                {invoice.paymentStatus.charAt(0) + invoice.paymentStatus.slice(1).toLowerCase()}
                                            </Badge>
                                            <Badge variant={invoice.deliveryStatus === 'SENT' ? 'sent' : invoice.deliveryStatus === 'VIEWED' ? 'sent' : invoice.deliveryStatus === 'DOWNLOADED' ? 'sent' : 'draft'} dot className={`text-xs ${invoice.deliveryStatus === 'SENT' ? 'bg-blue-50 text-blue-700 border-blue-200' : invoice.deliveryStatus === 'VIEWED' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : invoice.deliveryStatus === 'DOWNLOADED' ? 'bg-violet-50 text-violet-700 border-violet-200' : ''}`}>
                                                {invoice.deliveryStatus.charAt(0) + invoice.deliveryStatus.slice(1).toLowerCase()}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-neutral-500">
                                            {formatDate(invoice.issueDate)}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </CardBody>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="px-4 md:px-6 py-4 border-t border-neutral-100 bg-neutral-50/50 rounded-b-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-neutral-600 text-center sm:text-left">
                        Showing{' '}
                        <span className="font-semibold text-neutral-900">
                            {(pagination.page - 1) * pagination.pageSize + 1}
                        </span>
                        {' '}to{' '}
                        <span className="font-semibold text-neutral-900">
                            {Math.min(pagination.page * pagination.pageSize, pagination.total)}
                        </span>
                        {' '}of{' '}
                        <span className="font-semibold text-neutral-900">{pagination.total}</span>
                        {' '}invoices
                    </p>
                    <div className="flex items-center gap-2">
                        {pagination.page > 1 ? (
                            <Link
                                href={`/dashboard/invoices?page=${pagination.page - 1}${status ? `&status=${status}` : ''}${sourceType ? `&source=${sourceType}` : ''}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-neutral-200 rounded-lg bg-white hover:bg-neutral-50 hover:border-neutral-300 transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span className="hidden sm:inline">Previous</span>
                            </Link>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-400 cursor-not-allowed">
                                <ChevronLeft className="w-4 h-4" />
                                <span className="hidden sm:inline">Previous</span>
                            </span>
                        )}

                        <span className="text-sm text-neutral-500 px-2">
                            Page {pagination.page} of {pagination.totalPages}
                        </span>

                        {pagination.page < pagination.totalPages ? (
                            <Link
                                href={`/dashboard/invoices?page=${pagination.page + 1}${status ? `&status=${status}` : ''}${sourceType ? `&source=${sourceType}` : ''}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-neutral-200 rounded-lg bg-white hover:bg-neutral-50 hover:border-neutral-300 transition-all"
                            >
                                <span className="hidden sm:inline">Next</span>
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-400 cursor-not-allowed">
                                <span className="hidden sm:inline">Next</span>
                                <ChevronRight className="w-4 h-4" />
                            </span>
                        )}
                    </div>
                </div>
            )}
        </Card>
    );
}
