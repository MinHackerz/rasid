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
}

export async function InvoicesTable({ searchParams }: InvoicesTableProps) {
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
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-neutral-50 border-b border-neutral-100">
                                <tr>
                                    <th className="px-6 py-4 text-left font-medium text-neutral-500 text-xs uppercase tracking-wider">
                                        Invoice
                                    </th>
                                    <th className="px-6 py-4 text-left font-medium text-neutral-500 text-xs uppercase tracking-wider">
                                        Buyer
                                    </th>
                                    <th className="px-6 py-4 text-left font-medium text-neutral-500 text-xs uppercase tracking-wider">
                                        Issued
                                    </th>
                                    <th className="px-6 py-4 text-right font-medium text-neutral-500 text-xs uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-4 text-left font-medium text-neutral-500 text-xs uppercase tracking-wider">
                                        Payment
                                    </th>
                                    <th className="px-6 py-4 text-left font-medium text-neutral-500 text-xs uppercase tracking-wider">
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
                                                className="font-semibold text-neutral-900 hover:text-neutral-600 transition-colors"
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
                                        <td className="px-6 py-4 text-neutral-600">
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
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardBody>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50/50 rounded-b-xl flex items-center justify-between">
                    <p className="text-sm text-neutral-600">
                        Showing{' '}
                        <span className="font-medium text-neutral-900">
                            {(pagination.page - 1) * pagination.pageSize + 1}
                        </span>
                        {' '}to{' '}
                        <span className="font-medium text-neutral-900">
                            {Math.min(pagination.page * pagination.pageSize, pagination.total)}
                        </span>
                        {' '}of{' '}
                        <span className="font-medium text-neutral-900">{pagination.total}</span>
                        {' '}invoices
                    </p>
                    <div className="flex items-center gap-2">
                        {pagination.page > 1 ? (
                            <Link
                                href={`/dashboard/invoices?page=${pagination.page - 1}${status ? `&status=${status}` : ''}`}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-neutral-200 rounded-lg bg-white hover:bg-neutral-50 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Previous
                            </Link>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-400 cursor-not-allowed">
                                <ChevronLeft className="w-4 h-4" />
                                Previous
                            </span>
                        )}

                        {pagination.page < pagination.totalPages ? (
                            <Link
                                href={`/dashboard/invoices?page=${pagination.page + 1}${status ? `&status=${status}` : ''}`}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-neutral-200 rounded-lg bg-white hover:bg-neutral-50 transition-colors"
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-400 cursor-not-allowed">
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </span>
                        )}
                    </div>
                </div>
            )}
        </Card>
    );
}
