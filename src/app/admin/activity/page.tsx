'use client';

import { useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import {
    Activity, ChevronLeft, ChevronRight, Mail, Eye,
    Download, Bell, CreditCard, Trash2, PenLine, ShieldCheck,
    Plus
} from 'lucide-react';

interface ActivityRow {
    id: string;
    type: string;
    title: string;
    description: string | null;
    actorType: string;
    actorName: string | null;
    createdAt: string;
    invoiceNumber: string;
    sellerName: string;
}

interface ActivityResponse {
    activities: ActivityRow[];
    total: number;
    page: number;
    pageSize: number;
}

export default function AdminActivityPage() {
    const [data, setData] = useState<ActivityResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [typeFilter, setTypeFilter] = useState('');

    const fetchActivities = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), pageSize: '30', type: typeFilter });
            const res = await fetch(`/api/admin/activity?${params}`);
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }, [page, typeFilter]);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    useEffect(() => {
        setPage(1);
    }, [typeFilter]);

    const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

    const activityTypes = [
        '', 'CREATED', 'UPDATED', 'STATUS_CHANGED', 'SENT', 'VIEWED',
        'VERIFIED', 'DOWNLOADED', 'REMINDER_SENT', 'PAYMENT_RECORDED', 'DELETED'
    ];

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight font-display">Activity Logs</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Platform-wide audit trail of all invoice events.
                    {data && <span className="text-muted-foreground/50"> · {data.total} total events</span>}
                </p>
            </div>

            {/* Type Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible scrollbar-hide">
                {activityTypes.map((type) => (
                    <button
                        key={type}
                        onClick={() => setTypeFilter(type)}
                        className={`
                            text-[11px] font-medium px-2.5 py-1.5 rounded-lg border transition-all whitespace-nowrap shrink-0
                            ${typeFilter === type
                                ? 'bg-violet-50 border-violet-300 text-violet-700'
                                : 'bg-white border-border text-muted-foreground hover:text-foreground hover:bg-muted/40'
                            }
                        `}
                    >
                        {type || 'All'}
                    </button>
                ))}
            </div>

            {/* Timeline */}
            <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-xs">
                {loading ? (
                    <div className="divide-y divide-border">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="px-5 py-4">
                                <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
                                <div className="h-3 bg-muted rounded animate-pulse w-1/2 mt-2" />
                            </div>
                        ))}
                    </div>
                ) : data?.activities.length === 0 ? (
                    <div className="px-5 py-12 text-center">
                        <Activity className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                        <p className="text-muted-foreground text-sm">No activity logs found.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {data?.activities.map((act) => (
                            <div key={act.id} className="px-3 sm:px-5 py-3 sm:py-3.5 flex items-start gap-2.5 sm:gap-3 hover:bg-muted/30 transition-colors">
                                <span className={`p-1 sm:p-1.5 rounded-lg shrink-0 mt-0.5 ${getActivityIconStyle(act.type)}`}>
                                    {getActivityIcon(act.type)}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm text-foreground/80">
                                        <span className="font-medium">{act.title}</span>
                                        {act.description && (
                                            <span className="text-muted-foreground ml-1 hidden sm:inline">— {act.description}</span>
                                        )}
                                    </p>
                                    {act.description && (
                                        <p className="text-[10px] text-muted-foreground sm:hidden mt-0.5 truncate">{act.description}</p>
                                    )}
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[10px] sm:text-[11px] text-muted-foreground/60">
                                        <span>#{act.invoiceNumber}</span>
                                        <span className="text-muted-foreground/30">·</span>
                                        <span className="truncate">{act.sellerName}</span>
                                        {act.actorName && (
                                            <>
                                                <span className="text-muted-foreground/30">·</span>
                                                <span className="text-muted-foreground">by {act.actorName}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <span className="text-[9px] sm:text-[10px] text-muted-foreground/50 whitespace-nowrap shrink-0">
                                    {format(new Date(act.createdAt), 'dd MMM, HH:mm')}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-5 py-3 border-t border-border flex items-center justify-between bg-muted/20">
                        <span className="text-xs text-muted-foreground">
                            Page {page} of {totalPages}
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function getActivityIcon(type: string) {
    const icons: Record<string, React.ReactNode> = {
        CREATED: <Plus className="w-3.5 h-3.5" />,
        UPDATED: <PenLine className="w-3.5 h-3.5" />,
        STATUS_CHANGED: <Activity className="w-3.5 h-3.5" />,
        SENT: <Mail className="w-3.5 h-3.5" />,
        VIEWED: <Eye className="w-3.5 h-3.5" />,
        VERIFIED: <ShieldCheck className="w-3.5 h-3.5" />,
        DOWNLOADED: <Download className="w-3.5 h-3.5" />,
        REMINDER_SENT: <Bell className="w-3.5 h-3.5" />,
        REMINDER_CREATED: <Bell className="w-3.5 h-3.5" />,
        PAYMENT_RECORDED: <CreditCard className="w-3.5 h-3.5" />,
        DELETED: <Trash2 className="w-3.5 h-3.5" />,
    };
    return icons[type] || <Activity className="w-3.5 h-3.5" />;
}

function getActivityIconStyle(type: string) {
    const styles: Record<string, string> = {
        CREATED: 'bg-emerald-50 text-emerald-600',
        UPDATED: 'bg-blue-50 text-blue-600',
        STATUS_CHANGED: 'bg-amber-50 text-amber-600',
        SENT: 'bg-violet-50 text-violet-600',
        VIEWED: 'bg-sky-50 text-sky-600',
        VERIFIED: 'bg-emerald-50 text-emerald-600',
        DOWNLOADED: 'bg-indigo-50 text-indigo-600',
        REMINDER_SENT: 'bg-orange-50 text-orange-600',
        REMINDER_CREATED: 'bg-orange-50 text-orange-600',
        PAYMENT_RECORDED: 'bg-emerald-50 text-emerald-600',
        DELETED: 'bg-red-50 text-red-600',
    };
    return styles[type] || 'bg-muted text-muted-foreground';
}
