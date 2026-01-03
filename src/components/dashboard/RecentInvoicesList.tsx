import { getDashboardStats } from '@/lib/services';
import { getSession } from '@/lib/auth';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardBody, Badge, EmptyState } from '@/components/ui';
import { FileText, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { prisma } from "@/lib/prisma";

export async function RecentInvoicesList() {
    const session = await getSession();

    if (!session) {
        return null;
    }

    const stats = await getDashboardStats(session.sellerId);

    // Fetch seller's preferred currency for consistency if needed, 
    // though individual invoices have currency.
    // Assuming invoices carry their own currency.

    const statusVariant = (status: string) => {
        const map: Record<string, 'draft' | 'pending' | 'sent' | 'paid' | 'overdue' | 'cancelled'> = {
            DRAFT: 'draft',
            PENDING: 'pending',
            SENT: 'sent',
            PAID: 'paid',
            OVERDUE: 'overdue',
            CANCELLED: 'cancelled',
        };
        return map[status] || 'draft';
    };

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Recent Invoices</h2>
                <Link
                    href="/dashboard/invoices"
                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1 group"
                >
                    View all
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
            </div>

            <Card className="flex-1 flex flex-col min-h-[400px] overflow-hidden">
                <CardBody className="p-0 flex-1 relative flex flex-col min-h-0">
                    {stats.recentInvoices.length === 0 ? (
                        <EmptyState
                            icon={<FileText className="w-12 h-12" />}
                            title="No invoices yet"
                            description="Create your first invoice to get started with digital invoicing"
                            action={
                                <Link
                                    href="/dashboard/invoices/new"
                                    className="btn-primary"
                                >
                                    <Plus className="w-4 h-4 mr-2 inline" />
                                    Create Invoice
                                </Link>
                            }
                            className="flex-1"
                        />
                    ) : (
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="sticky top-0 z-10 bg-card border-b border-border/50 text-xs uppercase text-muted-foreground font-semibold tracking-wider shadow-sm">
                                    <tr>
                                        <th className="px-6 py-4 min-w-[140px] whitespace-nowrap">Invoice</th>
                                        <th className="px-6 py-4 min-w-[200px] whitespace-nowrap">Buyer</th>
                                        <th className="px-6 py-4 min-w-[120px] whitespace-nowrap">Date</th>
                                        <th className="px-6 py-4 text-right min-w-[120px] whitespace-nowrap">Amount</th>
                                        <th className="px-6 py-4 min-w-[120px] whitespace-nowrap">Payment</th>
                                        <th className="px-6 py-4 min-w-[120px] whitespace-nowrap">Delivery</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {stats.recentInvoices.map((invoice) => (
                                        <tr key={invoice.id} className="hover:bg-muted/20 transition-colors group">
                                            <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                                                <Link
                                                    href={`/dashboard/invoices/${invoice.id}`}
                                                    className="hover:text-primary transition-colors"
                                                >
                                                    {invoice.invoiceNumber}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-foreground/80 whitespace-nowrap">
                                                {invoice.buyer?.name || (
                                                    <span className="text-muted-foreground italic">Walk-in Customer</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                                                {formatDate(invoice.issueDate)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-foreground tabular-nums group-hover:text-primary transition-colors whitespace-nowrap">
                                                {formatCurrency(invoice.totalAmount, invoice.currency)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge variant={invoice.paymentStatus.toLowerCase() as any} dot>
                                                    {invoice.paymentStatus.charAt(0) + invoice.paymentStatus.slice(1).toLowerCase()}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge variant={invoice.deliveryStatus === 'SENT' ? 'sent' : invoice.deliveryStatus === 'VIEWED' ? 'sent' : invoice.deliveryStatus === 'DOWNLOADED' ? 'sent' : 'draft'} dot className={invoice.deliveryStatus === 'SENT' ? 'bg-blue-50 text-blue-700 border-blue-200' : invoice.deliveryStatus === 'VIEWED' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : invoice.deliveryStatus === 'DOWNLOADED' ? 'bg-violet-50 text-violet-700 border-violet-200' : ''}>
                                                    {invoice.deliveryStatus.charAt(0) + invoice.deliveryStatus.slice(1).toLowerCase()}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );
}
