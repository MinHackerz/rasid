'use client';

import { useEffect, useState } from 'react';
import { getAdminOverviewData, type AdminOverviewData } from '@/app/actions/admin';
import { format } from 'date-fns';
import {
    Users, FileText, ShoppingCart, Package, Key, UserPlus,
    TrendingUp, DollarSign, Activity, ArrowUpRight,
    Building2, BarChart3
} from 'lucide-react';

export default function AdminOverviewPage() {
    const [data, setData] = useState<AdminOverviewData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAdminOverviewData()
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSkeleton />;
    if (!data) return <div className="text-muted-foreground text-center py-20">Failed to load dashboard data.</div>;

    const maxGrowthInvoices = Math.max(...data.monthlyGrowth.map(m => m.invoices), 1);
    const maxGrowthSellers = Math.max(...data.monthlyGrowth.map(m => m.sellers), 1);

    return (
        <div className="space-y-5 sm:space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight font-display">
                    Platform Overview
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Real-time metrics and insights for the entire Rasid platform.
                </p>
            </div>

            {/* Primary Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4">
                <StatCard
                    label="Total Revenue"
                    value={formatCurrency(data.totalRevenue)}
                    icon={<DollarSign className="w-4 h-4" />}
                    bgClass="bg-emerald-50"
                    iconBg="bg-emerald-100 text-emerald-600"
                />
                <StatCard
                    label="Businesses"
                    value={data.totalSellers.toLocaleString()}
                    icon={<Building2 className="w-4 h-4" />}
                    bgClass="bg-violet-50"
                    iconBg="bg-violet-100 text-violet-600"
                    sub={`${data.activeSellers} active · ${data.inactiveSellers} inactive`}
                />
                <StatCard
                    label="Total Invoices"
                    value={data.totalInvoices.toLocaleString()}
                    icon={<FileText className="w-4 h-4" />}
                    bgClass="bg-blue-50"
                    iconBg="bg-blue-100 text-blue-600"
                />
                <StatCard
                    label="Total Buyers"
                    value={data.totalBuyers.toLocaleString()}
                    icon={<ShoppingCart className="w-4 h-4" />}
                    bgClass="bg-amber-50"
                    iconBg="bg-amber-100 text-amber-600"
                />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
                <MiniStat label="Team" value={data.totalTeamMembers} icon={<UserPlus className="w-3.5 h-3.5" />} />
                <MiniStat label="API Keys" value={data.totalApiKeys} icon={<Key className="w-3.5 h-3.5" />} />
                <MiniStat label="Inventory" value={data.totalInventoryItems} icon={<Package className="w-3.5 h-3.5" />} />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Monthly Growth */}
                <div className="bg-white border border-border rounded-2xl p-4 sm:p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-4 sm:mb-5">
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">Monthly Growth</h3>
                            <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">Last 6 months</p>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-4 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500" /> Sellers</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Invoices</span>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {data.monthlyGrowth.map((m) => (
                            <div key={m.month} className="flex items-center gap-2 sm:gap-3">
                                <span className="text-[10px] sm:text-[11px] text-muted-foreground w-12 sm:w-14 shrink-0">{m.month}</span>
                                <div className="flex-1 flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400 transition-all duration-700"
                                                style={{ width: `${(m.sellers / maxGrowthSellers) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-muted-foreground/60 w-6 text-right">{m.sellers}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-700"
                                                style={{ width: `${(m.invoices / maxGrowthInvoices) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-muted-foreground/60 w-6 text-right">{m.invoices}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Plan Distribution + Invoice Status */}
                <div className="space-y-4">
                    {/* Plan Distribution */}
                    <div className="bg-white border border-border rounded-2xl p-4 sm:p-5 shadow-xs">
                        <h3 className="text-sm font-semibold text-foreground mb-4">Plan Distribution</h3>
                        <div className="space-y-2.5">
                            {data.planDistribution.map((p) => {
                                const percentage = data.totalSellers > 0 ? (p.count / data.totalSellers) * 100 : 0;
                                return (
                                    <div key={p.plan} className="flex items-center gap-3">
                                        <span className={`text-[11px] font-semibold w-16 shrink-0 ${getPlanColor(p.plan)}`}>
                                            {p.plan}
                                        </span>
                                        <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ${getPlanBarColor(p.plan)}`}
                                                style={{ width: `${Math.max(percentage, 3)}%` }}
                                            />
                                        </div>
                                        <span className="text-[11px] text-muted-foreground w-14 text-right">
                                            {p.count} <span className="text-muted-foreground/40">({percentage.toFixed(0)}%)</span>
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Invoice Status */}
                    <div className="bg-white border border-border rounded-2xl p-4 sm:p-5 shadow-xs">
                        <h3 className="text-sm font-semibold text-foreground mb-4">Invoice Status</h3>
                        <div className="grid grid-cols-2 gap-2.5">
                            {data.invoiceStatusDistribution.map((s) => (
                                <div key={s.status} className={`rounded-xl px-3 py-2.5 border ${getStatusStyle(s.status)}`}>
                                    <span className="text-xs font-medium">{s.status}</span>
                                    <span className="block text-lg font-bold mt-0.5">{s.count.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recent Businesses */}
                <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-xs">
                    <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">Recent Businesses</h3>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Newly registered</p>
                        </div>
                        <a href="/admin/users" className="text-[11px] text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1 transition-colors">
                            View all <ArrowUpRight className="w-3 h-3" />
                        </a>
                    </div>
                    <div className="divide-y divide-border">
                        {data.recentSellers.slice(0, 5).map((seller) => (
                            <div key={seller.id} className="px-3 sm:px-5 py-3 flex items-center gap-2.5 sm:gap-3 hover:bg-muted/40 transition-colors">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-xs font-bold text-violet-600 shrink-0">
                                    {seller.businessName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{seller.businessName}</p>
                                    <p className="text-[11px] text-muted-foreground truncate">{seller.email}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getPlanBadgeStyle(seller.plan)}`}>
                                        {seller.plan}
                                    </span>
                                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                                        {format(new Date(seller.createdAt), 'dd MMM')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Invoices */}
                <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-xs">
                    <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">Recent Invoices</h3>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Latest transactions</p>
                        </div>
                        <a href="/admin/invoices" className="text-[11px] text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1 transition-colors">
                            View all <ArrowUpRight className="w-3 h-3" />
                        </a>
                    </div>
                    <div className="divide-y divide-border">
                        {data.recentInvoices.slice(0, 5).map((inv) => (
                            <div key={inv.id} className="px-3 sm:px-5 py-3 flex items-center gap-2 sm:gap-3 hover:bg-muted/40 transition-colors">
                                <div className={`w-2 h-2 rounded-full shrink-0 ${getStatusDotColor(inv.paymentStatus)}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-foreground">
                                        #{inv.invoiceNumber}
                                        <span className="text-muted-foreground font-normal ml-1 sm:ml-2 hidden sm:inline">{inv.sellerName}</span>
                                    </p>
                                    <p className="text-[11px] text-muted-foreground truncate">
                                        {inv.buyerName || 'No buyer'} · {format(new Date(inv.createdAt), 'dd MMM yyyy')}
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className="text-xs sm:text-sm font-semibold text-foreground/80">
                                        {inv.currency} {inv.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                    <span className={`block text-[10px] font-medium mt-0.5 ${getStatusTextColor(inv.paymentStatus)}`}>
                                        {inv.paymentStatus}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}


// ─── Stat Components ───

function StatCard({
    label, value, icon, bgClass, iconBg, sub
}: {
    label: string; value: string; icon: React.ReactNode; bgClass: string; iconBg: string; sub?: string;
}) {
    return (
        <div className={`relative overflow-hidden rounded-xl sm:rounded-2xl ${bgClass} border border-border/60 p-3 sm:p-4 lg:p-5 shadow-xs`}>
            <div className="flex items-start justify-between mb-2 sm:mb-3">
                <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider leading-tight">{label}</span>
                <span className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl ${iconBg}`}>{icon}</span>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground tracking-tight font-display">{value}</p>
            {sub && <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>}
        </div>
    );
}

function MiniStat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
    return (
        <div className="bg-white border border-border rounded-xl px-2.5 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3 shadow-xs">
            <span className="p-1 sm:p-1.5 rounded-lg bg-muted text-muted-foreground shrink-0">{icon}</span>
            <div className="min-w-0">
                <p className="text-base sm:text-lg font-bold text-foreground font-display">{value.toLocaleString()}</p>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate">{label}</p>
            </div>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-8">
            <div>
                <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
                <div className="h-4 w-72 bg-muted rounded-lg mt-2 animate-pulse" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-28 bg-muted rounded-2xl animate-pulse" />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="h-72 bg-muted rounded-2xl animate-pulse" />
                <div className="h-72 bg-muted rounded-2xl animate-pulse" />
            </div>
        </div>
    );
}


// ─── Helpers ───

function formatCurrency(amount: number) {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount.toFixed(2)}`;
}

function getPlanColor(plan: string) {
    const colors: Record<string, string> = {
        FREE: 'text-gray-500',
        BASIC: 'text-blue-600',
        PRO: 'text-violet-600',
        PREMIUM: 'text-amber-600',
        LIFETIME: 'text-emerald-600',
    };
    return colors[plan] || 'text-gray-500';
}

function getPlanBarColor(plan: string) {
    const colors: Record<string, string> = {
        FREE: 'bg-gray-300',
        BASIC: 'bg-gradient-to-r from-blue-500 to-blue-400',
        PRO: 'bg-gradient-to-r from-violet-500 to-violet-400',
        PREMIUM: 'bg-gradient-to-r from-amber-500 to-amber-400',
        LIFETIME: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
    };
    return colors[plan] || 'bg-gray-300';
}

function getPlanBadgeStyle(plan: string) {
    const styles: Record<string, string> = {
        FREE: 'bg-gray-100 text-gray-500',
        BASIC: 'bg-blue-50 text-blue-600',
        PRO: 'bg-violet-50 text-violet-600',
        PREMIUM: 'bg-amber-50 text-amber-600',
        LIFETIME: 'bg-emerald-50 text-emerald-600',
    };
    return styles[plan] || 'bg-gray-100 text-gray-500';
}

function getStatusStyle(status: string) {
    const styles: Record<string, string> = {
        PAID: 'bg-emerald-50 border-emerald-200 text-emerald-700',
        PENDING: 'bg-amber-50 border-amber-200 text-amber-700',
        DRAFT: 'bg-gray-50 border-gray-200 text-gray-600',
        OVERDUE: 'bg-red-50 border-red-200 text-red-700',
        CANCELLED: 'bg-gray-50 border-gray-200 text-gray-500',
    };
    return styles[status] || 'bg-gray-50 border-gray-200 text-gray-600';
}

function getStatusDotColor(status: string) {
    const colors: Record<string, string> = {
        PAID: 'bg-emerald-500',
        PENDING: 'bg-amber-500',
        DRAFT: 'bg-gray-400',
        OVERDUE: 'bg-red-500',
        CANCELLED: 'bg-gray-400',
    };
    return colors[status] || 'bg-gray-400';
}

function getStatusTextColor(status: string) {
    const colors: Record<string, string> = {
        PAID: 'text-emerald-600',
        PENDING: 'text-amber-600',
        DRAFT: 'text-gray-500',
        OVERDUE: 'text-red-600',
        CANCELLED: 'text-gray-500',
    };
    return colors[status] || 'text-gray-500';
}
