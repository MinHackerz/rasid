'use client';

import { Button } from '@/components/ui';
import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DownloadButtonProps {
    invoiceId: string;
    className?: string;
}

export default function DownloadButton({ invoiceId, className }: DownloadButtonProps) {
    const handleDownload = () => {
        window.location.href = `/api/invoices/${invoiceId}/pdf`;
    };

    return (
        <Button
            variant="outline"
            size="md"
            className={cn("h-10 border-neutral-900 flex-1 sm:flex-none", className)}
            onClick={handleDownload}
        >
            <Download className="w-4 h-4 text-neutral-500" />
            Download
        </Button>
    );
}
