'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Clock, Check, X, AlertCircle, Send, Loader2, Mail, MessageSquare, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardBody, Button, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
    createInvoiceReminders,
    cancelReminderAction,
    sendReminderNow,
    getSellerReminders,
    type ReminderWithInvoice
} from '@/app/actions/reminders';
import { toast } from 'sonner';

interface PaymentRemindersProps {
    invoiceId: string;
    invoiceNumber: string;
    dueDate: Date | null;
    paymentStatus: string;
    hasEmail: boolean;
    hasPhone: boolean;
    plan: string;
}

const PAID_PLANS = ['BASIC', 'PRO', 'PREMIUM', 'LIFETIME'];

type ReminderData = {
    id: string;
    type: string;
    daysOffset: number;
    channel: string;
    scheduledFor: Date;
    status: string;
    sentAt: Date | null;
    errorMessage: string | null;
};

export default function PaymentReminders({
    invoiceId,
    invoiceNumber,
    dueDate,
    paymentStatus,
    hasEmail,
    hasPhone,
    plan
}: PaymentRemindersProps) {
    const [reminders, setReminders] = useState<ReminderData[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const hasPaidPlan = PAID_PLANS.includes(plan);
    const isPaid = paymentStatus === 'PAID';
    const hasDueDate = !!dueDate;

    // Fetch existing reminders (and re-fetch when payment status changes)
    useEffect(() => {
        if (!hasPaidPlan) {
            setLoading(false);
            return;
        }

        const fetchReminders = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/reminders?invoiceId=${invoiceId}`);
                const data = await response.json();
                if (data.success) {
                    setReminders(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch reminders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReminders();
    }, [invoiceId, hasPaidPlan, paymentStatus]);

    const handleEnableReminders = async () => {
        setCreating(true);
        try {
            const result = await createInvoiceReminders(invoiceId, true);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success('Payment reminders enabled!');
                // Refresh reminders
                const response = await fetch(`/api/reminders?invoiceId=${invoiceId}`);
                const data = await response.json();
                if (data.success) {
                    setReminders(data.data);
                }
            }
        } catch (error) {
            toast.error('Failed to enable reminders');
        } finally {
            setCreating(false);
        }
    };

    const handleCancelReminder = async (reminderId: string) => {
        setActionLoading(reminderId);
        try {
            const result = await cancelReminderAction(reminderId);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success('Reminder cancelled');
                setReminders(prev => prev.map(r =>
                    r.id === reminderId ? { ...r, status: 'CANCELLED' } : r
                ));
            }
        } catch (error) {
            toast.error('Failed to cancel reminder');
        } finally {
            setActionLoading(null);
        }
    };

    const handleSendNow = async (reminderId: string) => {
        setActionLoading(reminderId);
        try {
            const result = await sendReminderNow(reminderId);
            if (result.error) {
                toast.error(result.error);
            } else if (result.skipped) {
                toast.info('Reminder skipped - invoice already paid');
                setReminders(prev => prev.map(r =>
                    r.id === reminderId ? { ...r, status: 'SKIPPED' } : r
                ));
            } else {
                toast.success('Reminder sent!');
                setReminders(prev => prev.map(r =>
                    r.id === reminderId ? { ...r, status: 'SENT', sentAt: new Date() } : r
                ));
            }
        } catch (error) {
            toast.error('Failed to send reminder');
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Badge variant="default" className="bg-blue-100 text-blue-700">Scheduled</Badge>;
            case 'SENT':
                return <Badge variant="success" className="bg-emerald-100 text-emerald-700">Sent</Badge>;
            case 'FAILED':
                return <Badge variant="destructive" className="bg-red-100 text-red-700">Failed</Badge>;
            case 'SKIPPED':
                return <Badge variant="default" className="bg-neutral-100 text-neutral-600">Skipped</Badge>;
            case 'CANCELLED':
                return <Badge variant="default" className="bg-neutral-100 text-neutral-500">Cancelled</Badge>;
            default:
                return null;
        }
    };

    const getReminderLabel = (type: string, daysOffset: number) => {
        switch (type) {
            case 'BEFORE_DUE':
                return `${daysOffset} day${daysOffset !== 1 ? 's' : ''} before due`;
            case 'ON_DUE':
                return 'On due date';
            case 'AFTER_DUE':
                return `${daysOffset} day${daysOffset !== 1 ? 's' : ''} overdue`;
            default:
                return 'Custom reminder';
        }
    };

    const formatDateTime = (date: Date) => {
        return new Date(date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    // Count statistics
    const pendingCount = reminders.filter(r => r.status === 'PENDING').length;
    const sentCount = reminders.filter(r => r.status === 'SENT').length;

    // If not paid plan, show upgrade prompt
    if (!hasPaidPlan) {
        return (
            <Card>
                <CardBody className="py-6">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
                            <Bell className="w-5 h-5 text-neutral-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-neutral-900 mb-1">Smart Payment Reminders</h3>
                            <p className="text-sm text-neutral-500 mb-3">
                                Automatically remind customers about upcoming and overdue payments.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.location.href = '/pricing'}
                            >
                                Upgrade to enable
                            </Button>
                        </div>
                    </div>
                </CardBody>
            </Card>
        );
    }

    return (
        <Card>
            <CardBody className="p-0">
                {/* Header */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                            reminders.length > 0 ? "bg-blue-100" : "bg-neutral-100"
                        )}>
                            <Bell className={cn(
                                "w-5 h-5",
                                reminders.length > 0 ? "text-blue-600" : "text-neutral-400"
                            )} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold text-neutral-900">Payment Reminders</h3>
                            <p className="text-sm text-neutral-500">
                                {loading ? 'Loading...' :
                                    reminders.length === 0 ? 'No reminders scheduled' :
                                        `${pendingCount} pending, ${sentCount} sent`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isPaid && (
                            <Badge variant="success" className="bg-emerald-100 text-emerald-700">
                                <Check className="w-3 h-3 mr-1" />
                                Paid
                            </Badge>
                        )}
                        {expanded ? (
                            <ChevronUp className="w-5 h-5 text-neutral-400" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-neutral-400" />
                        )}
                    </div>
                </button>

                {/* Expanded Content */}
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="px-4 pb-4 border-t border-neutral-100 pt-4">
                                {/* No due date warning */}
                                {!hasDueDate && (
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 text-amber-700 text-sm mb-4">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        <span>Set a due date to enable payment reminders.</span>
                                    </div>
                                )}

                                {/* No contact info warning */}
                                {hasDueDate && !hasEmail && !hasPhone && (
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 text-amber-700 text-sm mb-4">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        <span>Buyer needs email or phone number for reminders.</span>
                                    </div>
                                )}

                                {/* Invoice paid notice */}
                                {isPaid && (
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm mb-4">
                                        <Check className="w-4 h-4 flex-shrink-0" />
                                        <span>Invoice is paid. Pending reminders will be skipped.</span>
                                    </div>
                                )}

                                {/* Enable reminders button - show when no pending reminders */}
                                {pendingCount === 0 && hasDueDate && (hasEmail || hasPhone) && !isPaid && (
                                    <Button
                                        onClick={handleEnableReminders}
                                        disabled={creating}
                                        className="w-full mb-4"
                                    >
                                        {creating ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Setting up...
                                            </>
                                        ) : (
                                            <>
                                                <Bell className="w-4 h-4 mr-2" />
                                                {reminders.length > 0 ? 'Reschedule Reminders' : 'Enable Smart Reminders'}
                                            </>
                                        )}
                                    </Button>
                                )}

                                {/* Reminders list */}
                                {reminders.length > 0 && (
                                    <div className="space-y-2">
                                        {reminders.map((reminder) => (
                                            <div
                                                key={reminder.id}
                                                className={cn(
                                                    "flex items-center justify-between p-3 rounded-lg border",
                                                    reminder.status === 'PENDING' ? "bg-white border-neutral-200" :
                                                        reminder.status === 'SENT' ? "bg-emerald-50/50 border-emerald-100" :
                                                            reminder.status === 'FAILED' ? "bg-red-50/50 border-red-100" :
                                                                "bg-neutral-50 border-neutral-100"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-lg flex items-center justify-center",
                                                        reminder.channel === 'EMAIL' ? "bg-blue-100" : "bg-green-100"
                                                    )}>
                                                        {reminder.channel === 'EMAIL' ? (
                                                            <Mail className="w-4 h-4 text-blue-600" />
                                                        ) : (
                                                            <MessageSquare className="w-4 h-4 text-green-600" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-neutral-900">
                                                            {getReminderLabel(reminder.type, reminder.daysOffset)}
                                                        </div>
                                                        <div className="text-xs text-neutral-500 flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {formatDateTime(reminder.scheduledFor)}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {getStatusBadge(reminder.status)}

                                                    {reminder.status === 'PENDING' && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleSendNow(reminder.id)}
                                                                disabled={actionLoading === reminder.id}
                                                                className="h-7 px-2"
                                                            >
                                                                {actionLoading === reminder.id ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                ) : (
                                                                    <Send className="w-4 h-4" />
                                                                )}
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleCancelReminder(reminder.id)}
                                                                disabled={actionLoading === reminder.id}
                                                                className="h-7 px-2 text-neutral-400 hover:text-red-600"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        </>
                                                    )}

                                                    {reminder.status === 'FAILED' && reminder.errorMessage && (
                                                        <span className="text-xs text-red-600 max-w-[150px] truncate" title={reminder.errorMessage}>
                                                            {reminder.errorMessage}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardBody>
        </Card>
    );
}
