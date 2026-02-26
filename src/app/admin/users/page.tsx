'use client';

import { useEffect, useState, useTransition, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getAdminUsers, toggleUserStatus, changeUserPlan, type AdminUserRow, type AdminUsersResponse } from '@/app/actions/admin';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
    Search, ChevronLeft, ChevronRight, MoreHorizontal,
    Shield, ShieldOff, Crown, FileText
} from 'lucide-react';

const PLANS = ['', 'FREE', 'BASIC', 'PRO', 'PREMIUM', 'LIFETIME'];

export default function AdminUsersPage() {
    const [data, setData] = useState<AdminUsersResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [planFilter, setPlanFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isPending, startTransition] = useTransition();
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);
    const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    const fetchUsers = useCallback(() => {
        setLoading(true);
        getAdminUsers(page, 20, search, planFilter, statusFilter)
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [page, search, planFilter, statusFilter]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        setPage(1);
    }, [search, planFilter, statusFilter]);

    const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

    const handleToggleDropdown = (userId: string) => {
        if (activeDropdown === userId) {
            setActiveDropdown(null);
            setDropdownPos(null);
            return;
        }
        const btn = buttonRefs.current[userId];
        if (btn) {
            const rect = btn.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + 4,
                right: window.innerWidth - rect.right,
            });
        }
        setActiveDropdown(userId);
    };

    const handleToggleStatus = (userId: string) => {
        startTransition(async () => {
            try {
                const res = await toggleUserStatus(userId);
                toast.success(res.isActive ? 'User activated' : 'User deactivated');
                fetchUsers();
            } catch {
                toast.error('Failed to toggle status');
            }
            setActiveDropdown(null);
            setDropdownPos(null);
        });
    };

    const handleChangePlan = (userId: string, plan: string) => {
        startTransition(async () => {
            try {
                await changeUserPlan(userId, plan);
                toast.success(`Plan changed to ${plan}`);
                fetchUsers();
            } catch {
                toast.error('Failed to change plan');
            }
            setActiveDropdown(null);
            setDropdownPos(null);
        });
    };

    const activeUser = data?.users.find(u => u.id === activeDropdown);

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight font-display">Users &amp; Businesses</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage all registered businesses on the platform.
                    {data && <span className="text-muted-foreground/50"> · {data.total} total</span>}
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <select
                        value={planFilter}
                        onChange={(e) => setPlanFilter(e.target.value)}
                        className="flex-1 sm:flex-none bg-white border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-violet-400 transition-all cursor-pointer sm:min-w-[100px]"
                    >
                        <option value="">All Plans</option>
                        {PLANS.filter(Boolean).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="flex-1 sm:flex-none bg-white border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-violet-400 transition-all cursor-pointer sm:min-w-[100px]"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3 sm:px-5 py-3">Business</th>
                                <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 hidden md:table-cell">Email</th>
                                <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3 sm:px-5 py-3">Plan</th>
                                <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Invoices</th>
                                <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Revenue</th>
                                <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3 sm:px-5 py-3">Status</th>
                                <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Joined</th>
                                <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3 sm:px-5 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                [...Array(8)].map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-5 py-3" colSpan={8}>
                                            <div className="h-5 bg-muted rounded animate-pulse" />
                                        </td>
                                    </tr>
                                ))
                            ) : data?.users.length === 0 ? (
                                <tr>
                                    <td className="px-5 py-12 text-center text-muted-foreground" colSpan={8}>
                                        No businesses found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                data?.users.map((user) => (
                                    <tr key={user.id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-3 sm:px-5 py-3">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-xs font-bold text-violet-600 shrink-0">
                                                    {user.businessName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs sm:text-sm font-medium text-foreground truncate max-w-[120px] sm:max-w-[180px]">{user.businessName}</p>
                                                    <p className="text-[10px] sm:text-[11px] text-muted-foreground md:hidden truncate">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-muted-foreground text-xs hidden md:table-cell">
                                            <span className="truncate block max-w-[200px]">{user.email}</span>
                                        </td>
                                        <td className="px-3 sm:px-5 py-3">
                                            <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full ${getPlanBadgeStyle(user.plan)}`}>
                                                {user.plan}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-muted-foreground hidden lg:table-cell">
                                            <span className="flex items-center gap-1.5">
                                                <FileText className="w-3 h-3 text-muted-foreground/50" />
                                                {user.invoiceCount}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-foreground/70 text-xs font-medium hidden lg:table-cell">
                                            ${user.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                        </td>
                                        <td className="px-3 sm:px-5 py-3">
                                            {user.isActive ? (
                                                <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-[11px] font-medium text-red-500">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-muted-foreground text-xs hidden sm:table-cell">
                                            {format(new Date(user.createdAt), 'dd MMM yyyy')}
                                        </td>
                                        <td className="px-3 sm:px-5 py-3 text-right">
                                            <button
                                                ref={(el) => { buttonRefs.current[user.id] = el; }}
                                                onClick={() => handleToggleDropdown(user.id)}
                                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                            >
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-5 py-3 border-t border-border flex items-center justify-between bg-muted/20">
                        <span className="text-xs text-muted-foreground">
                            Page {page} of {totalPages} · {data?.total} total
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

            {/* Dropdown Portal — rendered outside overflow containers */}
            {activeDropdown && activeUser && dropdownPos && typeof document !== 'undefined' && createPortal(
                <>
                    <div className="fixed inset-0 z-[9998]" onClick={() => { setActiveDropdown(null); setDropdownPos(null); }} />
                    <div
                        className="fixed z-[9999] w-48 bg-white/80 backdrop-blur-xl border border-border rounded-xl shadow-xl overflow-hidden"
                        style={{ top: dropdownPos.top, right: dropdownPos.right }}
                    >
                        <div className="px-3 py-2 border-b border-border bg-muted/30">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Actions</p>
                        </div>
                        <button
                            onClick={() => handleToggleStatus(activeUser.id)}
                            className="w-full text-left px-3 py-2 text-xs text-foreground/70 hover:bg-muted/50 hover:text-foreground flex items-center gap-2 transition-colors"
                        >
                            {activeUser.isActive ? <ShieldOff className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                            {activeUser.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <div className="px-3 py-2 border-t border-border">
                            <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider font-semibold mb-1">Change Plan</p>
                            <div className="space-y-0.5">
                                {['FREE', 'BASIC', 'PRO', 'PREMIUM', 'LIFETIME'].map((plan) => (
                                    <button
                                        key={plan}
                                        onClick={() => handleChangePlan(activeUser.id, plan)}
                                        disabled={activeUser.plan === plan}
                                        className={`w-full text-left px-2 py-1 text-[11px] rounded-md transition-colors flex items-center gap-2 ${activeUser.plan === plan
                                            ? 'text-muted-foreground/40 cursor-not-allowed'
                                            : 'text-foreground/60 hover:bg-muted/50 hover:text-foreground'
                                            }`}
                                    >
                                        <Crown className="w-3 h-3" />
                                        {plan}
                                        {activeUser.plan === plan && <span className="ml-auto text-[9px] text-muted-foreground/40">Current</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </>,
                document.body
            )}
        </div>
    );
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
