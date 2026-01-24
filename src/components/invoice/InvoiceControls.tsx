'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { Send, CheckCircle2, AlertCircle, Loader2, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InvoiceControlsProps {
    invoiceId: string;
    initialStatus: string;
    hasWhatsApp: boolean; // Is WhatsApp integration configured?
    hasEmail: boolean;
    showSendButtons?: boolean; // Hide buttons if auto-send is enabled
    isFreePlan?: boolean;
}

export default function InvoiceControls({
    invoiceId,
    initialStatus,
    hasWhatsApp,
    hasEmail,
    showSendButtons = true,
    isFreePlan = false,
}: InvoiceControlsProps) {
    const router = useRouter();
    const [status, setStatus] = useState(initialStatus);
    const [updating, setUpdating] = useState(false);
    const [sending, setSending] = useState<false | 'EMAIL' | 'WHATSAPP'>(false);
    const [success, setSuccess] = useState<false | 'EMAIL' | 'WHATSAPP'>(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<string | null>(null);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (showConfirmModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [showConfirmModal]);

    const handleStatusChange = async (newStatus: string) => {
        // Show confirmation if changing from PAID to another status
        if (status === 'PAID' && newStatus !== 'PAID') {
            setPendingStatus(newStatus);
            setShowConfirmModal(true);
            return;
        }

        await updateStatus(newStatus);
    };

    const updateStatus = async (newStatus: string) => {
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
            setShowConfirmModal(false);
            setPendingStatus(null);
        }
    };

    const handleConfirmRevert = () => {
        if (pendingStatus) {
            updateStatus(pendingStatus);
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
            }
        } catch (error) {
            console.error('Failed to send invoice:', error);
        } finally {
            setSending(false);
        }
    };

    return (
        <>
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
                        disabled={!!sending || success === 'EMAIL' || isFreePlan}
                        title={isFreePlan ? "Upgrade to Basic plan to send emails" : undefined}
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
                        disabled={!!sending || success === 'WHATSAPP' || isFreePlan}
                        title={isFreePlan ? "Upgrade to Basic plan to send WhatsApp" : undefined}
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

            {/* Confirmation Modal */}
            <AnimatePresence>
                {showConfirmModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowConfirmModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden border border-neutral-900"
                        >
                            <div className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                        <AlertTriangle className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-neutral-900">
                                            Revert Paid Status?
                                        </h3>
                                        <p className="mt-2 text-sm text-neutral-600">
                                            This invoice is marked as <strong>PAID</strong>. Changing it to{' '}
                                            <strong>{pendingStatus}</strong> will:
                                        </p>
                                        <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                                            <li className="flex items-start gap-2">
                                                <span className="text-amber-500 mt-0.5">•</span>
                                                Affect your financial reports and analytics
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-amber-500 mt-0.5">•</span>
                                                This change will be logged for audit purposes
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setShowConfirmModal(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="primary"
                                        className="flex-1 bg-amber-600 hover:bg-amber-700"
                                        onClick={handleConfirmRevert}
                                        loading={updating}
                                    >
                                        {updating ? 'Updating...' : 'Yes, Change Status'}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

