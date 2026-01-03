'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface InvoiceControlsProps {
    invoiceId: string;
    initialStatus: string;
    hasWhatsApp: boolean; // Is WhatsApp integration configured?
    hasEmail: boolean;
    showSendButtons?: boolean; // Hide buttons if auto-send is enabled
}

export default function InvoiceControls({
    invoiceId,
    initialStatus,
    hasWhatsApp,
    hasEmail,
    showSendButtons = true,
}: InvoiceControlsProps) {
    const router = useRouter();
    const [status, setStatus] = useState(initialStatus);
    const [updating, setUpdating] = useState(false);
    const [sending, setSending] = useState<false | 'EMAIL' | 'WHATSAPP'>(false);
    const [success, setSuccess] = useState<false | 'EMAIL' | 'WHATSAPP'>(false);

    const handleStatusChange = async (newStatus: string) => {
        setUpdating(true);
        try {
            const res = await fetch(`/api/invoices/${invoiceId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                setStatus(newStatus);
                router.refresh();
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setUpdating(false);
        }
    };

    const handleSend = async (method: 'EMAIL' | 'WHATSAPP') => {
        setSending(method);
        setSuccess(false);
        try {
            const res = await fetch(`/api/invoices/${invoiceId}/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ method }),
            });

            if (res.ok) {
                setSuccess(method);
                setTimeout(() => setSuccess(false), 3000);
                router.refresh();
            } else {
                const data = await res.json();
                console.error(`Failed to send: ${data.error}`);
                // Ideally show a toast here, but avoiding alert as requested
            }
        } catch (error) {
            console.error('Failed to send invoice:', error);
        } finally {
            setSending(false);
        }
    };

    // Helper to get status color/label
    return (
        <div className="flex items-center gap-3">
            {/* Status Dropdown */}
            <div className="relative">
                <select
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={updating}
                    className="appearance-none h-9 bg-white border border-neutral-200 text-neutral-900 text-sm font-medium rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                >
                    <option value="DRAFT">Draft</option>
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                    {updating ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    )}
                </div>
            </div>

            {/* Send Buttons */}
            {showSendButtons && hasEmail && (
                <Button
                    onClick={() => handleSend('EMAIL')}
                    loading={sending === 'EMAIL'}
                    disabled={!!sending || success === 'EMAIL'}
                    variant={success === 'EMAIL' ? 'primary' : 'outline'}
                    size="sm"
                    className={`border border-neutral-900 shadow-none h-9 transition-all duration-300 ${success === 'EMAIL' ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent' : ''}`}
                >
                    {success === 'EMAIL' ? (
                        <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Sent
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4 mr-2" />
                            {sending === 'EMAIL' ? 'Sending...' : 'Send Email'}
                        </>
                    )}
                </Button>
            )}

            {showSendButtons && hasWhatsApp && (
                <Button
                    onClick={() => handleSend('WHATSAPP')}
                    loading={sending === 'WHATSAPP'}
                    disabled={!!sending || success === 'WHATSAPP'}
                    size="sm"
                    className={`border border-neutral-900 shadow-none h-9 transition-all duration-300 ${success === 'WHATSAPP' ? 'bg-emerald-600 hover:bg-emerald-700 border-transparent' : 'bg-[#25D366] hover:bg-[#128C7E] text-white'}`}
                >
                    {success === 'WHATSAPP' ? (
                        <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Sent
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4 mr-2" />
                            {sending === 'WHATSAPP' ? 'Sending...' : 'WhatsApp'}
                        </>
                    )}
                </Button>
            )}
        </div>
    );
}
