'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Send, ShieldCheck, Download, Bell, Clock,
    CheckCircle2, XCircle, Edit3, Trash2, Eye, AlertCircle,
    ChevronDown, RefreshCw
} from 'lucide-react';
import { fetchInvoiceActivities } from '@/app/actions/activity';
import { cn } from '@/lib/utils';

interface ActivityItem {
    id: string;
    type: string;
    title: string;
    description: string | null;
    actorType: string;
    actorName: string | null;
    metadata: Record<string, any> | null;
    createdAt: Date;
}

const ACTIVITY_CONFIG: Record<string, {
    icon: typeof FileText;
    color: string;
    bgColor: string;
    borderColor: string;
}> = {
    CREATED: {
        icon: FileText,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
    },
    UPDATED: {
        icon: Edit3,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
    },
    STATUS_CHANGED: {
        icon: CheckCircle2,
        color: 'text-violet-600',
        bgColor: 'bg-violet-50',
        borderColor: 'border-violet-200',
    },
    SENT: {
        icon: Send,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
    },
    VIEWED: {
        icon: Eye,
        color: 'text-sky-600',
        bgColor: 'bg-sky-50',
        borderColor: 'border-sky-200',
    },
    VERIFIED: {
        icon: ShieldCheck,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
    },
    DOWNLOADED: {
        icon: Download,
        color: 'text-neutral-600',
        bgColor: 'bg-neutral-50',
        borderColor: 'border-neutral-200',
    },
    REMINDER_SENT: {
        icon: Bell,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
    },
    REMINDER_CREATED: {
        icon: Clock,
        color: 'text-orange-500',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
    },
    PAYMENT_RECORDED: {
        icon: CheckCircle2,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
    },
    DELETED: {
        icon: Trash2,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
    },
};

const DEFAULT_CONFIG = {
    icon: AlertCircle,
    color: 'text-neutral-500',
    bgColor: 'bg-neutral-50',
    borderColor: 'border-neutral-200',
};

function getActorLabel(actorType: string): string {
    switch (actorType) {
        case 'SELLER': return 'You';
        case 'BUYER': return 'Customer';
        case 'SYSTEM': return 'System';
        case 'ANONYMOUS': return 'Visitor';
        default: return 'Unknown';
    }
}

function formatTimeAgo(date: Date): string {
    const now = new Date();
    const d = new Date(date);
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
}

function formatFullDate(date: Date): string {
    return new Date(date).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

// ============================================
// Main Component
// ============================================
export default function InvoiceTimeline({ invoiceId }: { invoiceId: string }) {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAll, setShowAll] = useState(false);

    const loadActivities = async () => {
        setLoading(true);
        setError(null);
        const result = await fetchInvoiceActivities(invoiceId);
        if (result.error) {
            setError(result.error);
        } else {
            setActivities(result.data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadActivities();
    }, [invoiceId]);

    const displayedActivities = showAll ? activities : activities.slice(0, 5);
    const hasMore = activities.length > 5;

    // Loading state
    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-5 h-5 bg-neutral-200 rounded animate-pulse" />
                    <div className="h-5 w-32 bg-neutral-200 rounded animate-pulse" />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-neutral-100 animate-pulse flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-neutral-100 rounded w-3/4 animate-pulse" />
                                <div className="h-3 bg-neutral-50 rounded w-1/2 animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
                <div className="flex items-center gap-2.5">
                    <Clock className="w-4.5 h-4.5 text-neutral-400" />
                    <h3 className="text-base font-semibold text-neutral-900">Activity Timeline</h3>
                    {activities.length > 0 && (
                        <span className="text-xs font-medium text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
                            {activities.length}
                        </span>
                    )}
                </div>
                <button
                    onClick={loadActivities}
                    className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-400 hover:text-neutral-600"
                    title="Refresh"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
                {error && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg mb-4">
                        <XCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                    </div>
                )}

                {activities.length === 0 && !error ? (
                    <div className="text-center py-8">
                        <Clock className="w-8 h-8 text-neutral-200 mx-auto mb-3" />
                        <p className="text-sm text-neutral-500 font-medium">No activity yet</p>
                        <p className="text-xs text-neutral-400 mt-1">
                            Events like sending, verifying, and status changes will appear here
                        </p>
                    </div>
                ) : (
                    <div className="relative">
                        {/* Vertical timeline line */}
                        <div className="absolute left-[15px] top-3 bottom-3 w-px bg-neutral-100" />

                        <AnimatePresence initial={false}>
                            {displayedActivities.map((activity, idx) => {
                                const config = ACTIVITY_CONFIG[activity.type] || DEFAULT_CONFIG;
                                const Icon = config.icon;
                                const isFirst = idx === 0;

                                return (
                                    <motion.div
                                        key={activity.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2, delay: idx * 0.03 }}
                                        className="relative flex gap-4 pb-5 last:pb-0 group"
                                    >
                                        {/* Icon node */}
                                        <div className={cn(
                                            "relative z-10 w-[30px] h-[30px] rounded-full flex items-center justify-center flex-shrink-0 border transition-all",
                                            config.bgColor,
                                            config.borderColor,
                                            isFirst && "ring-2 ring-offset-2 ring-offset-white ring-neutral-100"
                                        )}>
                                            <Icon className={cn("w-3.5 h-3.5", config.color)} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0 pt-0.5">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-neutral-900 leading-snug">
                                                        {activity.title}
                                                    </p>
                                                    {activity.description && (
                                                        <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed line-clamp-2">
                                                            {activity.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex-shrink-0 text-right">
                                                    <p className="text-[11px] text-neutral-400 font-medium whitespace-nowrap" title={formatFullDate(activity.createdAt)}>
                                                        {formatTimeAgo(activity.createdAt)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Actor badge */}
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className={cn(
                                                    "inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded",
                                                    activity.actorType === 'SELLER' && 'bg-blue-50 text-blue-600',
                                                    activity.actorType === 'BUYER' && 'bg-violet-50 text-violet-600',
                                                    activity.actorType === 'SYSTEM' && 'bg-neutral-100 text-neutral-500',
                                                    activity.actorType === 'ANONYMOUS' && 'bg-neutral-100 text-neutral-500',
                                                )}>
                                                    {activity.actorName || getActorLabel(activity.actorType)}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {/* Show more / less */}
                        {hasMore && (
                            <div className="relative z-10 pt-2">
                                <button
                                    onClick={() => setShowAll(!showAll)}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-700 transition-colors ml-[46px]"
                                >
                                    <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showAll && "rotate-180")} />
                                    {showAll ? 'Show less' : `Show ${activities.length - 5} more`}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
