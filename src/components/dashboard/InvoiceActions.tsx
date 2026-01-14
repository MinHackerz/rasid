'use client';

import { useState } from 'react';
import { Mail, MessageCircle, MoreVertical, Download, Eye, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface InvoiceActionsProps {
    invoiceId: string;
    hasEmail: boolean;
    hasPhone: boolean;
    isFreePlan?: boolean;
}

export function InvoiceActions({ invoiceId, hasEmail, hasPhone, isFreePlan = false }: InvoiceActionsProps) {
    const [sending, setSending] = useState<'EMAIL' | 'WHATSAPP' | null>(null);
    const [success, setSuccess] = useState<'EMAIL' | 'WHATSAPP' | null>(null);

    const handleSend = async (method: 'EMAIL' | 'WHATSAPP') => {
        try {
            setSending(method);
            setSuccess(null);
            const response = await fetch(`/api/invoices/${invoiceId}/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ method }),
            });

            if (!response.ok) throw new Error('Failed to send');

            setSuccess(method);
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            console.error(error);
            // Quiet failure or minimal indication could be better, 
            // but for now removing alert as per "no browser popup"
        } finally {
            setSending(null);
        }
    };

    return (
        <div className="flex items-center justify-end gap-1">
            <Link
                href={`/dashboard/invoices/${invoiceId}`}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-500 hover:text-neutral-900"
                title="View"
            >
                <Eye className="w-4 h-4" />
            </Link>

            <a
                href={`/api/invoices/${invoiceId}/pdf`}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-500 hover:text-neutral-900"
                title="Download PDF"
                target="_blank"
                rel="noopener noreferrer"
            >
                <Download className="w-4 h-4" />
            </a>

            <button
                onClick={() => handleSend('EMAIL')}
                disabled={!hasEmail || !!sending || success === 'EMAIL' || isFreePlan}
                className={`p-2 rounded-lg transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed ${success === 'EMAIL' ? 'text-emerald-600 bg-emerald-50' : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'}`}
                title={isFreePlan ? "Upgrade to Basic plan to send emails" : success === 'EMAIL' ? 'Sent' : 'Send via Email'}
            >
                {success === 'EMAIL' ? (
                    <CheckCircle2 className="w-4 h-4" />
                ) : sending === 'EMAIL' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Mail className="w-4 h-4" />
                )}
            </button>

            <button
                onClick={() => handleSend('WHATSAPP')}
                disabled={!hasPhone || !!sending || success === 'WHATSAPP' || isFreePlan}
                className={`p-2 rounded-lg transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed ${success === 'WHATSAPP' ? 'text-emerald-600 bg-emerald-50' : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'}`}
                title={isFreePlan ? "Upgrade to Basic plan to send WhatsApp" : success === 'WHATSAPP' ? 'Sent' : 'Send via WhatsApp'}
            >
                {success === 'WHATSAPP' ? (
                    <CheckCircle2 className="w-4 h-4" />
                ) : sending === 'WHATSAPP' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <MessageCircle className="w-4 h-4" />
                )}
            </button>
        </div>
    );
}
