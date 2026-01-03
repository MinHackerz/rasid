'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDate, formatCurrency } from '@/lib/utils';
import { FileText, ArrowRight, Calendar, Trash2, Loader2 } from 'lucide-react';

interface ScanProps {
    scan: {
        id: string;
        originalName: string;
        createdAt: Date;
        confidence?: number | null;
        extractedData: any;
    };
}

export function ScanCard({ scan }: ScanProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this scan? This cannot be undone.')) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/scans/${scan.id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                router.refresh();
            } else {
                alert('Failed to delete scan. Please try again.');
                setIsDeleting(false);
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('An error occurred while deleting.');
            setIsDeleting(false);
        }
    };

    const extracted = scan.extractedData || {};
    const totalAmount = extracted.totalAmount || 0;
    const currency = extracted.currency || 'INR';
    const itemsCount = extracted?.items?.length || 0;

    return (
        <div className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-sm transition-shadow group relative">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden min-w-0 flex-1">
                        <h3 className="font-medium text-neutral-900 truncate" title={scan.originalName}>
                            {scan.originalName}
                        </h3>
                        <p className="text-xs text-neutral-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(scan.createdAt)}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2 flex-shrink-0"
                    title="Delete Scan"
                >
                    {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Trash2 className="w-4 h-4" />
                    )}
                </button>
            </div>

            <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Predicted Amount</span>
                    <span className="font-medium text-neutral-900 truncate ml-2">
                        {formatCurrency(totalAmount, currency)}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Items Found</span>
                    <span className="font-medium text-neutral-900">{itemsCount}</span>
                </div>
                {scan.confidence !== null && scan.confidence !== undefined && (
                    <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">Confidence</span>
                        <span className={`font-medium ${Number(scan.confidence) * 100 > 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {(Number(scan.confidence) * 100).toFixed(0)}%
                        </span>
                    </div>
                )}
            </div>

            <Link
                href={`/dashboard/invoices/new?fromUpload=${scan.id}`}
                className="flex items-center justify-between w-full px-4 py-2.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-900 text-sm font-medium rounded-lg transition-colors group-hover:bg-neutral-900 group-hover:text-white"
            >
                Create Invoice
                <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
    );
}
