import { getDashboardStats } from '@/lib/services';
import { getSession } from '@/lib/auth';
import { Card, CardBody, Badge } from '@/components/ui';
import Link from 'next/link';

export async function InvoiceBreakdown() {
    const session = await getSession();
    if (!session) return null;
    const stats = await getDashboardStats(session.sellerId);

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
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Invoice Breakdown</h2>
            <Card>
                <CardBody className="p-5">
                    <div className="grid grid-cols-2 gap-3">
                        {(['DRAFT', 'PENDING', 'SENT', 'PAID'] as const).map((status) => (
                            <Link
                                key={status}
                                href={`/dashboard/invoices?status=${status}`}
                                className="relative overflow-hidden rounded-xl p-3 bg-muted/30 hover:bg-muted/50 transition-all border border-transparent hover:border-border/50 group"
                            >
                                <div className="flex flex-col gap-1">
                                    <Badge variant={statusVariant(status)} className="w-fit scale-90 origin-left opacity-80" dot>
                                        {status.charAt(0) + status.slice(1).toLowerCase()}
                                    </Badge>
                                    <p className="text-2xl font-bold text-foreground tabular-nums mt-1 group-hover:scale-105 transition-transform origin-left">
                                        {stats.invoicesByStatus[status] || 0}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
