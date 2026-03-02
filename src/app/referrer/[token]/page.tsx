'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    getReferrerPortalData,
    addReferralPaymentMethod,
    removeReferralPaymentMethod,
    setDefaultReferralPaymentMethod,
    type ReferrerPortalData,
} from '@/app/actions/referrals';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import {
    MousePointerClick,
    UserPlus,
    TrendingUp,
    Wallet,
    CalendarClock,
    Copy,
    Check,
    Plus,
    Trash2,
    Star,
    X,
    CreditCard,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Shield,
    BadgeIndianRupee,
    ExternalLink,
    LayoutDashboard,
    Home,
    LogOut,
} from 'lucide-react';
import { useClerk } from '@clerk/nextjs';

export default function ReferrerPortalPage() {
    const params = useParams();
    const token = params.token as string;
    const { signOut } = useClerk();
    const [data, setData] = useState<ReferrerPortalData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const [showAddMethod, setShowAddMethod] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        try {
            const result = await getReferrerPortalData(token);
            if (!result) {
                setError(true);
            } else {
                setData(result);
            }
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleCopyLink = () => {
        if (!data) return;
        const url = `${window.location.origin}/refer/${data.code}`;
        navigator.clipboard.writeText(url);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    const handleRemoveMethod = async (methodId: string) => {
        if (!confirm('Remove this payment method?')) return;
        await removeReferralPaymentMethod(token, methodId);
        loadData();
    };

    const handleSetDefault = async (methodId: string) => {
        await setDefaultReferralPaymentMethod(token, methodId);
        loadData();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 flex items-center justify-center">
                <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm font-medium">Loading your portal...</span>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 flex items-center justify-center p-4">
                <div className="bg-white border border-border rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-50 flex items-center justify-center">
                        <Shield className="w-8 h-8 text-red-400" />
                    </div>
                    <h1 className="text-xl font-bold text-foreground font-display mb-2">Access Denied</h1>
                    <p className="text-sm text-muted-foreground mb-6">
                        This referrer portal link is invalid or has expired. Please contact the admin for a new link.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-all"
                    >
                        Go to Homepage
                    </Link>
                </div>
            </div>
        );
    }

    const nextPayout = new Date(data.nextPayoutDate);
    const daysUntilPayout = Math.max(0, Math.ceil((nextPayout.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
            {/* Decorative */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-100/40 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-64 h-64 bg-indigo-100/30 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-2xl border-b border-border/40 shadow-sm supports-[backdrop-filter]:bg-white/60">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 rounded-lg overflow-hidden shadow-md shadow-violet-500/10 group-hover:scale-105 transition-transform">
                            <Image
                                src="/logos/Rasid_Logo.png"
                                alt="Rasid Logo"
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <span className="text-lg font-bold tracking-tight text-foreground font-display">Rasid</span>
                            <span className="block text-[10px] text-muted-foreground -mt-0.5 font-medium">Referrer Portal</span>
                        </div>
                    </Link>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link href="/" className="flex items-center justify-center p-2 sm:px-3 sm:py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground bg-white/50 hover:bg-white rounded-lg transition-colors border border-border/50 shadow-sm">
                            <Home className="w-4 h-4 sm:mr-1.5" />
                            <span className="hidden sm:inline">Home</span>
                        </Link>
                        <Link href="/dashboard" className="flex items-center justify-center p-2 sm:px-3 sm:py-1.5 text-xs font-semibold text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-lg border border-violet-200/60 transition-colors shadow-sm">
                            <LayoutDashboard className="w-4 h-4 sm:mr-1.5" />
                            <span className="hidden sm:inline">Dashboard</span>
                        </Link>
                        <button onClick={() => signOut({ redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://rasid.in'}/` })} className="flex items-center justify-center p-2 sm:px-3 sm:py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200/60 transition-colors shadow-sm">
                            <LogOut className="w-4 h-4 sm:mr-1.5" />
                            <span className="hidden sm:inline">Sign Out</span>
                        </button>
                        <span className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border ${data.isActive
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : 'bg-gray-100 text-gray-500 border-gray-200'
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${data.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                            {data.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
            </header>

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
                {/* Welcome */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-display tracking-tight">
                            Welcome, {data.referrerName}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Track your referrals and manage your rewards
                        </p>
                    </div>
                    <button
                        onClick={handleCopyLink}
                        className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-violet-500/15 transition-all hover:shadow-lg"
                    >
                        {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copiedLink ? 'Link Copied!' : 'Copy Referral Link'}
                    </button>
                </div>

                {/* Referral Code Card */}
                <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.12),transparent_50%)]" />
                    <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <p className="text-violet-200 text-xs font-semibold uppercase tracking-wider mb-1">Your Referral Code</p>
                            <p className="text-3xl sm:text-4xl font-bold font-mono tracking-widest">{data.code}</p>
                            <p className="text-violet-200 text-sm mt-2">
                                Eligible Share: {data.rewardValue || 'N/A'}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white/15 backdrop-blur rounded-xl px-4 py-3 text-center">
                                <p className="text-2xl font-bold">{daysUntilPayout}</p>
                                <p className="text-[10px] text-violet-200 uppercase tracking-wider">Days to Payout</p>
                            </div>
                            <div className="bg-white/15 backdrop-blur rounded-xl px-4 py-3 text-center">
                                <p className="text-2xl font-bold">${data.pendingBalance.toLocaleString()}</p>
                                <p className="text-[10px] text-violet-200 uppercase tracking-wider">Pending</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <StatCard label="Clicks" value={data.clicks} icon={<MousePointerClick className="w-4 h-4" />} color="blue" />
                    <StatCard label="Successful Referrals" value={data.signups} icon={<UserPlus className="w-4 h-4" />} color="amber" />
                    <StatCard label="Plans Subscribed" value={data.conversions} icon={<TrendingUp className="w-4 h-4" />} color="emerald" />
                    <StatCard label="Total Earned" value={`$${data.totalEarned.toLocaleString()}`} icon={<Wallet className="w-4 h-4" />} color="violet" isText />
                </div>

                {/* Two-column: Earnings Summary + Payment Methods */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Earnings Summary */}
                    <div className="bg-white border border-border rounded-2xl shadow-xs overflow-hidden">
                        <div className="px-5 py-4 border-b border-border">
                            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Wallet className="w-4 h-4 text-violet-500" />
                                Earnings Summary
                            </h2>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Total Earned</span>
                                <span className="text-sm font-bold text-foreground">${data.totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Total Paid Out</span>
                                <span className="text-sm font-bold text-emerald-600">${data.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <hr className="border-border" />
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-foreground">Pending Balance</span>
                                <span className="text-lg font-bold text-violet-600">${data.pendingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="bg-violet-50/60 rounded-xl p-4 border border-violet-100/60">
                                <div className="flex items-center gap-2 mb-2">
                                    <CalendarClock className="w-4 h-4 text-violet-500" />
                                    <span className="text-xs font-semibold text-violet-700">Next Payout</span>
                                </div>
                                <p className="text-sm font-bold text-violet-900">
                                    {format(nextPayout, 'MMMM d, yyyy')}
                                </p>
                                <p className="text-[11px] text-violet-600 mt-0.5">
                                    {daysUntilPayout === 0 ? 'Payout is today!' : `${daysUntilPayout} day${daysUntilPayout !== 1 ? 's' : ''} from now`}
                                    {' · '}Payouts on the {getOrdinal(data.payoutDay)} of each month
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="bg-white border border-border rounded-2xl shadow-xs overflow-hidden">
                        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-violet-500" />
                                Payment Methods
                            </h2>
                            <button
                                onClick={() => setShowAddMethod(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-lg border border-violet-200/60 transition-all"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add
                            </button>
                        </div>
                        <div className="p-5">
                            {data.paymentMethods.length === 0 ? (
                                <div className="text-center py-6">
                                    <CreditCard className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                                    <p className="text-sm text-muted-foreground">No payment methods added</p>
                                    <p className="text-[11px] text-muted-foreground/60 mt-1">Add UPI or PayPal to receive payouts</p>
                                    <button
                                        onClick={() => setShowAddMethod(true)}
                                        className="mt-4 flex items-center gap-2 px-4 py-2 text-xs font-semibold text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-xl border border-violet-200/60 transition-all mx-auto"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Add Payment Method
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {data.paymentMethods.map((pm) => (
                                        <div
                                            key={pm.id}
                                            className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${pm.isDefault
                                                ? 'bg-violet-50/50 border-violet-200/60'
                                                : 'bg-muted/20 border-border hover:bg-muted/40'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${pm.type === 'upi'
                                                ? 'bg-emerald-100 text-emerald-600'
                                                : 'bg-blue-100 text-blue-600'
                                                }`}>
                                                {pm.type === 'upi' ? (
                                                    <BadgeIndianRupee className="w-5 h-5" />
                                                ) : (
                                                    <span className="text-xs font-bold">PP</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold text-foreground">
                                                        {pm.type === 'upi' ? 'UPI' : 'PayPal'}
                                                    </p>
                                                    {pm.isDefault && (
                                                        <span className="text-[9px] font-bold text-violet-600 bg-violet-100 px-1.5 py-0.5 rounded-full uppercase">
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {pm.type === 'upi' ? pm.upiId : pm.paypalEmail}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                {!pm.isDefault && (
                                                    <button
                                                        onClick={() => handleSetDefault(pm.id)}
                                                        className="p-1.5 rounded-lg text-muted-foreground hover:text-violet-600 hover:bg-violet-50 transition-all"
                                                        title="Set as default"
                                                    >
                                                        <Star className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleRemoveMethod(pm.id)}
                                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-all"
                                                    title="Remove"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Payout History */}
                <div className="bg-white border border-border rounded-2xl shadow-xs overflow-hidden">
                    <div className="px-5 py-4 border-b border-border">
                        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Clock className="w-4 h-4 text-violet-500" />
                            Payout History
                        </h2>
                    </div>
                    {data.payouts.length === 0 ? (
                        <div className="p-8 text-center">
                            <Clock className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">No payouts yet</p>
                            <p className="text-[11px] text-muted-foreground/60 mt-1">
                                Your payouts will appear here once processed
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-muted/30">
                                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Date</th>
                                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Amount</th>
                                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Method</th>
                                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell">Reference</th>
                                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Receipt</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {data.payouts.map((p) => (
                                        <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                                            <td className="px-4 py-3 text-foreground/80">
                                                {format(new Date(p.scheduledAt), 'MMM d, yyyy')}
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-foreground">
                                                ${p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${p.method === 'upi'
                                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                                    : 'bg-blue-50 text-blue-600 border border-blue-200'
                                                    }`}>
                                                    {p.method || '—'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <PayoutStatusBadge status={p.status} />
                                            </td>
                                            <td className="px-4 py-3 hidden sm:table-cell">
                                                <span className="text-xs text-muted-foreground font-mono">
                                                    {p.reference || '—'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {p.receiptUrl ? (
                                                    <button onClick={() => setSelectedReceipt(p.receiptUrl)} className="inline-flex p-1.5 bg-violet-50 text-violet-600 hover:bg-violet-100 rounded-lg transition-colors" title="View Receipt">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground/50">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center py-6 text-xs text-muted-foreground/50">
                    © {new Date().getFullYear()} Rasid Platform · Referrer Portal
                </div>
            </div>

            {/* Add Payment Method Modal */}
            {showAddMethod && (
                <AddPaymentMethodModal
                    token={token}
                    onClose={() => setShowAddMethod(false)}
                    onAdded={() => {
                        setShowAddMethod(false);
                        loadData();
                    }}
                />
            )}

            {/* Receipt Modal */}
            {selectedReceipt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedReceipt(null)} />
                    <div className="relative bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-border">
                        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
                            <h3 className="font-bold text-foreground">Payment Receipt</h3>
                            <button onClick={() => setSelectedReceipt(null)} className="p-1.5 text-muted-foreground hover:bg-muted rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 flex items-center justify-center bg-slate-50 min-h-[300px]">
                            {selectedReceipt.startsWith('data:image') || selectedReceipt.startsWith('http') ? (
                                <Image src={selectedReceipt} alt="Receipt" width={800} height={600} className="w-auto h-auto max-w-full max-h-[70vh] rounded-lg shadow-sm border border-border" />
                            ) : (
                                <a href={selectedReceipt} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">
                                    Download Document
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Stat Card ───

function StatCard({
    label,
    value,
    icon,
    color,
    isText,
}: {
    label: string;
    value: number | string;
    icon: React.ReactNode;
    color: 'blue' | 'amber' | 'emerald' | 'violet';
    isText?: boolean;
}) {
    const bgMap = { blue: 'bg-blue-50', amber: 'bg-amber-50', emerald: 'bg-emerald-50', violet: 'bg-violet-50' };
    const iconBgMap = {
        blue: 'bg-blue-100 text-blue-600',
        amber: 'bg-amber-100 text-amber-600',
        emerald: 'bg-emerald-100 text-emerald-600',
        violet: 'bg-violet-100 text-violet-600',
    };

    return (
        <div className={`rounded-xl sm:rounded-2xl ${bgMap[color]} border border-border/60 p-3 sm:p-4 shadow-xs`}>
            <div className="flex items-start justify-between mb-2">
                <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
                <span className={`p-1.5 rounded-lg ${iconBgMap[color]}`}>{icon}</span>
            </div>
            <p className="text-lg sm:text-xl font-bold text-foreground tracking-tight font-display">
                {isText ? value : (value as number).toLocaleString()}
            </p>
        </div>
    );
}

// ─── Payout Status Badge ───

function PayoutStatusBadge({ status }: { status: string }) {
    const config: Record<string, { icon: React.ReactNode; bg: string; text: string }> = {
        pending: { icon: <Clock className="w-3 h-3" />, bg: 'bg-amber-50 border-amber-200 text-amber-600', text: 'Pending' },
        processing: { icon: <Loader2 className="w-3 h-3 animate-spin" />, bg: 'bg-blue-50 border-blue-200 text-blue-600', text: 'Processing' },
        completed: { icon: <CheckCircle2 className="w-3 h-3" />, bg: 'bg-emerald-50 border-emerald-200 text-emerald-600', text: 'Completed' },
        failed: { icon: <AlertCircle className="w-3 h-3" />, bg: 'bg-red-50 border-red-200 text-red-600', text: 'Failed' },
    };
    const c = config[status] || config.pending;

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${c.bg}`}>
            {c.icon}
            {c.text}
        </span>
    );
}

// ─── Get Ordinal ───

function getOrdinal(n: number): string {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ─── Add Payment Method Modal ───

function AddPaymentMethodModal({
    token,
    onClose,
    onAdded,
}: {
    token: string;
    onClose: () => void;
    onAdded: () => void;
}) {
    const [type, setType] = useState<'upi' | 'paypal'>('upi');
    const [upiId, setUpiId] = useState('');
    const [paypalEmail, setPaypalEmail] = useState('');
    const [label, setLabel] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        const result = await addReferralPaymentMethod(token, {
            type,
            label: label || undefined,
            upiId: type === 'upi' ? upiId : undefined,
            paypalEmail: type === 'paypal' ? paypalEmail : undefined,
        });

        if (result.success) {
            onAdded();
        } else {
            setError(result.error || 'Failed to add payment method.');
        }
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl border border-border shadow-2xl w-full max-w-md p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-foreground font-display">Add Payment Method</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Choose UPI or PayPal to receive payouts</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-2.5">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Type Selection */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setType('upi')}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${type === 'upi'
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'border-border hover:border-muted-foreground/30'
                                }`}
                        >
                            <BadgeIndianRupee className={`w-6 h-6 ${type === 'upi' ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                            <span className={`text-sm font-semibold ${type === 'upi' ? 'text-emerald-700' : 'text-muted-foreground'}`}>UPI</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('paypal')}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${type === 'paypal'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-border hover:border-muted-foreground/30'
                                }`}
                        >
                            <span className={`text-lg font-bold ${type === 'paypal' ? 'text-blue-600' : 'text-muted-foreground'}`}>PP</span>
                            <span className={`text-sm font-semibold ${type === 'paypal' ? 'text-blue-700' : 'text-muted-foreground'}`}>PayPal</span>
                        </button>
                    </div>

                    {/* Label */}
                    <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                            Label <span className="text-muted-foreground/50">(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder={type === 'upi' ? 'e.g. My Google Pay' : 'e.g. Personal PayPal'}
                            className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all"
                        />
                    </div>

                    {/* Type-specific fields */}
                    {type === 'upi' ? (
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                                UPI ID <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                placeholder="yourname@upi"
                                className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
                                required
                            />
                            <p className="text-[11px] text-muted-foreground mt-1">Enter your UPI VPA (e.g. name@paytm, name@okicici)</p>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                                PayPal Email <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="email"
                                value={paypalEmail}
                                onChange={(e) => setPaypalEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                required
                            />
                            <p className="text-[11px] text-muted-foreground mt-1">Enter the email linked to your PayPal account</p>
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-xl border border-border hover:bg-muted transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl shadow-md shadow-violet-500/15 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                        >
                            {saving ? 'Adding...' : 'Add Method'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
