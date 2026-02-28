'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    getAdminReferrals,
    getReferralStats,
    createReferral,
    toggleReferralStatus,
    deleteReferral,
    getAdminReferralApplications,
    approveReferralApplication,
    rejectReferralApplication,
    type ReferralRow,
    type ReferralStats,
    type ReferralInput,
    type ReferralApplicationRow,
} from '@/app/actions/referrals';
import { format } from 'date-fns';
import {
    Link2,
    Plus,
    Search,
    ToggleLeft,
    ToggleRight,
    Trash2,
    MousePointerClick,
    UserPlus,
    TrendingUp,
    Copy,
    Check,
    X,
    Users,
    Gift,
    ExternalLink,
    UserCog,
    FileText,
    CheckCircle2,
    XCircle,
    Clock,
    MessageSquare,
} from 'lucide-react';

type TabType = 'referrals' | 'applications';

export default function AdminReferralsPage() {
    const [activeTab, setActiveTab] = useState<TabType>('referrals');

    return (
        <div className="space-y-5 sm:space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight font-display">
                        Referral Program
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage referral codes, applications, and track performance.
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl w-fit border border-border/60">
                <button
                    onClick={() => setActiveTab('referrals')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'referrals'
                        ? 'bg-white text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <Link2 className="w-4 h-4" />
                    Referrals
                </button>
                <button
                    onClick={() => setActiveTab('applications')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'applications'
                        ? 'bg-white text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <FileText className="w-4 h-4" />
                    Applications
                </button>
            </div>

            {activeTab === 'referrals' ? <ReferralsTab /> : <ApplicationsTab />}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// REFERRALS TAB
// ═══════════════════════════════════════════════════════════

function ReferralsTab() {
    const [referrals, setReferrals] = useState<ReferralRow[]>([]);
    const [stats, setStats] = useState<ReferralStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [copiedPortal, setCopiedPortal] = useState<string | null>(null);
    const pageSize = 15;

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [refData, statsData] = await Promise.all([
                getAdminReferrals(page, pageSize, search, statusFilter),
                getReferralStats(),
            ]);
            setReferrals(refData.referrals);
            setTotal(refData.total);
            setStats(statsData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, search, statusFilter]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleToggle = async (id: string) => {
        await toggleReferralStatus(id);
        loadData();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this referral?')) return;
        await deleteReferral(id);
        loadData();
    };

    const handleCopy = (code: string) => {
        const url = `${window.location.origin}/refer/${code}`;
        navigator.clipboard.writeText(url);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const handleCopyPortal = (token: string | null, id: string) => {
        if (!token) return;
        const url = `${window.location.origin}/referrer/${token}`;
        navigator.clipboard.writeText(url);
        setCopiedPortal(id);
        setTimeout(() => setCopiedPortal(null), 2000);
    };

    const totalPages = Math.ceil(total / pageSize);

    return (
        <>
            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
                    <StatsCard label="Total Referrals" value={stats.totalReferrals} icon={<Link2 className="w-4 h-4" />} color="violet" />
                    <StatsCard label="Active" value={stats.activeReferrals} icon={<ToggleRight className="w-4 h-4" />} color="emerald" />
                    <StatsCard label="Total Clicks" value={stats.totalClicks} icon={<MousePointerClick className="w-4 h-4" />} color="blue" />
                    <StatsCard label="Signups" value={stats.totalSignups} icon={<UserPlus className="w-4 h-4" />} color="amber" />
                    <StatsCard label="Conversions" value={stats.totalConversions} icon={<TrendingUp className="w-4 h-4" />} color="rose" />
                </div>
            )}

            {/* Header + Create */}
            <div className="flex items-center justify-end">
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-violet-500/15 transition-all hover:shadow-lg hover:shadow-violet-500/25"
                >
                    <Plus className="w-4 h-4" />
                    Create Referral
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-violet-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by code, name, or email..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-border rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="px-4 py-2.5 text-sm bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-xs">
                {loading ? (
                    <div className="p-12 text-center text-muted-foreground animate-pulse">Loading referrals...</div>
                ) : referrals.length === 0 ? (
                    <div className="p-12 text-center">
                        <Gift className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground">No referrals found.</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Create your first referral code to get started.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-muted/30">
                                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Code</th>
                                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Referrer</th>
                                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden md:table-cell">Reward</th>
                                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Clicks</th>
                                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Signups</th>
                                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell">Conv.</th>
                                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                                        <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {referrals.map((r) => (
                                        <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-lg text-xs">{r.code}</span>
                                                    <button onClick={() => handleCopy(r.code)} className="p-1 text-muted-foreground hover:text-violet-600 transition-colors" title="Copy referral link">
                                                        {copiedCode === r.code ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-foreground">{r.referrerName}</p>
                                                <p className="text-[11px] text-muted-foreground">{r.referrerEmail}</p>
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell">
                                                <span className="text-xs font-medium text-foreground/80 capitalize">{r.rewardType}</span>
                                                {r.rewardValue && <span className="text-xs text-muted-foreground ml-1.5">({r.rewardValue})</span>}
                                            </td>
                                            <td className="px-4 py-3 text-center"><span className="font-semibold text-blue-600">{r.clicks}</span></td>
                                            <td className="px-4 py-3 text-center"><span className="font-semibold text-amber-600">{r.signups}</span></td>
                                            <td className="px-4 py-3 text-center hidden sm:table-cell"><span className="font-semibold text-emerald-600">{r.conversions}</span></td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${r.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${r.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                                                    {r.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1 justify-end">
                                                    <button onClick={() => handleToggle(r.id)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all" title={r.isActive ? 'Deactivate' : 'Activate'}>
                                                        {r.isActive ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4" />}
                                                    </button>
                                                    <a href={`/refer/${r.code}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all" title="View referral page">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                    {r.accessToken && (
                                                        <button onClick={() => handleCopyPortal(r.accessToken, r.id)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-violet-50 hover:text-violet-600 transition-all" title="Copy referrer portal link">
                                                            {copiedPortal === r.id ? <Check className="w-4 h-4 text-emerald-500" /> : <UserCog className="w-4 h-4" />}
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all" title="Delete">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                                <p className="text-xs text-muted-foreground">
                                    Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
                                </p>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Prev</button>
                                    <span className="px-3 py-1.5 text-xs text-muted-foreground">{page} / {totalPages}</span>
                                    <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next</button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {showCreateModal && (
                <CreateReferralModal
                    onClose={() => setShowCreateModal(false)}
                    onCreated={() => { setShowCreateModal(false); loadData(); }}
                />
            )}
        </>
    );
}

// ═══════════════════════════════════════════════════════════
// APPLICATIONS TAB
// ═══════════════════════════════════════════════════════════

function ApplicationsTab() {
    const [applications, setApplications] = useState<ReferralApplicationRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [actionModal, setActionModal] = useState<{ app: ReferralApplicationRow; action: 'approve' | 'reject' } | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAdminReferralApplications(statusFilter, search);
            setApplications(data.applications);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const pendingCount = applications.filter((a) => a.status === 'pending').length;

    return (
        <>
            {/* Pending counter */}
            {pendingCount > 0 && (
                <div className="bg-amber-50 border border-amber-200/60 rounded-xl px-4 py-3 flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-500" />
                    <p className="text-sm text-amber-700">
                        <span className="font-bold">{pendingCount}</span> application{pendingCount !== 1 ? 's' : ''} pending review
                    </p>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-violet-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-border rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 text-sm bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {/* Applications Table */}
            <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-xs">
                {loading ? (
                    <div className="p-12 text-center text-muted-foreground animate-pulse">Loading applications...</div>
                ) : applications.length === 0 ? (
                    <div className="p-12 text-center">
                        <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground">No applications found.</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Applications from users will appear here.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/30">
                                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Applicant</th>
                                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell">Reason</th>
                                    <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Reward Pref.</th>
                                    <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden md:table-cell">Date</th>
                                    <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {applications.map((app) => (
                                    <tr key={app.id} className="hover:bg-muted/20 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-foreground">{app.userName}</p>
                                            <p className="text-[11px] text-muted-foreground">{app.userEmail}</p>
                                            {app.socialLinks && (
                                                <p className="text-[10px] text-violet-500 mt-0.5 truncate max-w-[150px]">{app.socialLinks}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 hidden sm:table-cell">
                                            <p className="text-xs text-muted-foreground line-clamp-2 max-w-[200px]">
                                                {app.reason || '—'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-xs font-semibold text-foreground/80 capitalize">{app.preferredReward}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <ApplicationStatusBadge status={app.status} />
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <span className="text-xs text-muted-foreground">{format(new Date(app.createdAt), 'MMM d, yyyy')}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1 justify-end">
                                                {app.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => setActionModal({ app, action: 'approve' })}
                                                            className="p-1.5 rounded-lg text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setActionModal({ app, action: 'reject' })}
                                                            className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {app.status === 'approved' && app.referralId && (
                                                    <span className="text-[10px] text-emerald-600 font-semibold">Converted</span>
                                                )}
                                                {app.status === 'rejected' && (
                                                    <span className="text-[10px] text-muted-foreground/50">Rejected</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Approve/Reject Modal */}
            {actionModal && (
                <ApplicationActionModal
                    app={actionModal.app}
                    action={actionModal.action}
                    onClose={() => setActionModal(null)}
                    onDone={() => { setActionModal(null); loadData(); }}
                />
            )}
        </>
    );
}

// ─── Application Status Badge ───

function ApplicationStatusBadge({ status }: { status: string }) {
    const config: Record<string, { icon: React.ReactNode; bg: string; text: string }> = {
        pending: { icon: <Clock className="w-3 h-3" />, bg: 'bg-amber-50 border-amber-200 text-amber-600', text: 'Pending' },
        approved: { icon: <CheckCircle2 className="w-3 h-3" />, bg: 'bg-emerald-50 border-emerald-200 text-emerald-600', text: 'Approved' },
        rejected: { icon: <XCircle className="w-3 h-3" />, bg: 'bg-red-50 border-red-200 text-red-600', text: 'Rejected' },
    };
    const c = config[status] || config.pending;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${c.bg}`}>
            {c.icon}
            {c.text}
        </span>
    );
}

// ─── Application Action Modal ───

function ApplicationActionModal({
    app,
    action,
    onClose,
    onDone,
}: {
    app: ReferralApplicationRow;
    action: 'approve' | 'reject';
    onClose: () => void;
    onDone: () => void;
}) {
    const [adminNote, setAdminNote] = useState('');
    const [customCode, setCustomCode] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        let result;
        if (action === 'approve') {
            result = await approveReferralApplication(app.id, adminNote, customCode || undefined);
        } else {
            result = await rejectReferralApplication(app.id, adminNote);
        }

        if (result.success) {
            onDone();
        } else {
            setError(result.error || `Failed to ${action} application.`);
        }
        setSaving(false);
    };

    const isApprove = action === 'approve';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl border border-border shadow-2xl w-full max-w-md p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isApprove ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                            {isApprove ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground font-display">
                                {isApprove ? 'Approve Application' : 'Reject Application'}
                            </h2>
                            <p className="text-xs text-muted-foreground">{app.userName} · {app.userEmail}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {app.reason && (
                    <div className="bg-muted/30 rounded-xl p-3 border border-border/40">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Applicant&apos;s Reason</p>
                        <p className="text-xs text-foreground/80">{app.reason}</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-2.5">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isApprove && (
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                                Custom Referral Code <span className="text-muted-foreground/50">(optional)</span>
                            </label>
                            <input
                                type="text"
                                value={customCode}
                                onChange={(e) => setCustomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
                                placeholder="Auto-generated if empty"
                                className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 font-mono uppercase transition-all"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                            <MessageSquare className="w-3 h-3 inline mr-1" />
                            Note to Applicant <span className="text-muted-foreground/50">(optional)</span>
                        </label>
                        <textarea
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            placeholder={isApprove ? 'Welcome aboard! Your referral code is ready.' : 'Reason for rejection...'}
                            rows={2}
                            className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all resize-none"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-xl border border-border hover:bg-muted transition-all">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className={`px-6 py-2.5 text-sm font-semibold text-white rounded-xl shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition-all ${isApprove
                                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/15'
                                : 'bg-red-600 hover:bg-red-700 shadow-red-500/15'
                                }`}
                        >
                            {saving ? 'Processing...' : isApprove ? 'Approve & Create Referral' : 'Reject'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Stats Card ───

function StatsCard({
    label,
    value,
    icon,
    color,
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
    color: 'violet' | 'emerald' | 'blue' | 'amber' | 'rose';
}) {
    const bgMap = {
        violet: 'bg-violet-50', emerald: 'bg-emerald-50', blue: 'bg-blue-50', amber: 'bg-amber-50', rose: 'bg-rose-50',
    };
    const iconBgMap = {
        violet: 'bg-violet-100 text-violet-600', emerald: 'bg-emerald-100 text-emerald-600', blue: 'bg-blue-100 text-blue-600', amber: 'bg-amber-100 text-amber-600', rose: 'bg-rose-100 text-rose-600',
    };

    return (
        <div className={`rounded-xl sm:rounded-2xl ${bgMap[color]} border border-border/60 p-3 sm:p-4 shadow-xs`}>
            <div className="flex items-start justify-between mb-2">
                <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
                <span className={`p-1.5 rounded-lg ${iconBgMap[color]}`}>{icon}</span>
            </div>
            <p className="text-lg sm:text-xl font-bold text-foreground tracking-tight font-display">{value.toLocaleString()}</p>
        </div>
    );
}

// ─── Create Modal ───

function CreateReferralModal({
    onClose,
    onCreated,
}: {
    onClose: () => void;
    onCreated: () => void;
}) {
    const [form, setForm] = useState<ReferralInput>({
        code: '', referrerName: '', referrerEmail: '', description: '', rewardType: 'discount', rewardValue: '', maxUses: null, expiresAt: null,
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.code || !form.referrerName || !form.referrerEmail) {
            setError('Please fill all required fields.');
            return;
        }
        setSaving(true);
        setError('');
        const result = await createReferral(form);
        if (result.success) {
            onCreated();
        } else {
            setError(result.error || 'Failed to create referral.');
        }
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl border border-border shadow-2xl w-full max-w-lg p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-foreground font-display">Create Referral</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Set up a new referral code</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-2.5">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Referral Code <span className="text-red-400">*</span></label>
                            <input type="text" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '') }))} placeholder="e.g. FRIEND20" className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 font-mono uppercase transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Reward Type</label>
                            <select value={form.rewardType} onChange={(e) => setForm((f) => ({ ...f, rewardType: e.target.value }))} className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all">
                                <option value="discount">Discount</option>
                                <option value="credit">Credit</option>
                                <option value="commission">Commission</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Referrer Name <span className="text-red-400">*</span></label>
                            <input type="text" value={form.referrerName} onChange={(e) => setForm((f) => ({ ...f, referrerName: e.target.value }))} placeholder="John Doe" className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Referrer Email <span className="text-red-400">*</span></label>
                            <input type="email" value={form.referrerEmail} onChange={(e) => setForm((f) => ({ ...f, referrerEmail: e.target.value }))} placeholder="john@example.com" className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Reward Value</label>
                            <input type="text" value={form.rewardValue || ''} onChange={(e) => setForm((f) => ({ ...f, rewardValue: e.target.value }))} placeholder="e.g. 10% or ₹500" className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Max Uses</label>
                            <input type="number" value={form.maxUses || ''} onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value ? parseInt(e.target.value) : null }))} placeholder="Unlimited" className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Description</label>
                        <textarea value={form.description || ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional description..." rows={2} className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all resize-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Expiry Date</label>
                        <input type="date" value={form.expiresAt ? form.expiresAt.split('T')[0] : ''} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value ? new Date(e.target.value).toISOString() : null }))} className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all" />
                    </div>
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-xl border border-border hover:bg-muted transition-all">Cancel</button>
                        <button type="submit" disabled={saving} className="px-6 py-2.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl shadow-md shadow-violet-500/15 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
                            {saving ? 'Creating...' : 'Create Referral'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
