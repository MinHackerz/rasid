import { getSession } from '@/lib/auth';
import { listPendingScans } from '@/lib/services/scan';
import { ScanCard } from './ScanCard';
import { formatDate, formatCurrency } from '@/lib/utils';
import { FileText, ArrowRight, Calendar, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default async function PendingScansPage() {
    const session = await getSession();
    if (!session) return null;

    const scans = await listPendingScans(session.sellerId);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Pending Scans</h1>
                    <p className="text-neutral-500 mt-0.5">Digitized documents waiting to be converted into invoices</p>
                </div>
            </div>

            {scans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-neutral-200 border-dashed">
                    <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center mb-4">
                        <FileText className="w-6 h-6 text-neutral-400" />
                    </div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-1">No pending scans</h3>
                    <p className="text-neutral-500 text-sm max-w-sm text-center mb-6">
                        All your uploaded documents have been processed. Upload a new document to start digitizing.
                    </p>
                    <Link
                        href="/dashboard/upload"
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors"
                    >
                        Upload Invoice
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {scans.map((scan) => (
                        <ScanCard
                            key={scan.id}
                            scan={{
                                ...scan,
                                confidence: scan.confidence ? Number(scan.confidence) : null,
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
