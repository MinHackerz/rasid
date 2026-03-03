'use client';

import { ReactNode, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    Users,
    Globe2,
    FileText,
    ChevronLeft,
    Menu,
    X,
    Shield,
    Activity,
    Home,
    Link2,
    LogOut,
} from 'lucide-react';
import { useClerk } from '@clerk/nextjs';

const navItems = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard, description: 'Platform metrics & health' },
    { href: '/admin/users', label: 'Users & Businesses', icon: Users, description: 'Manage all accounts' },
    { href: '/admin/invoices', label: 'Invoices', icon: FileText, description: 'All platform invoices' },
    { href: '/admin/activity', label: 'Activity Logs', icon: Activity, description: 'Audit trail & events' },
    { href: '/admin/referrals', label: 'Referrals', icon: Link2, description: 'Manage referral program' },
    { href: '/admin/site', label: 'Site & Marketing', icon: Globe2, description: 'Offers & announcements' },
];

export default function AdminLayoutShell({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { signOut } = useClerk();

    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    const isActive = (href: string) => {
        if (href === '/admin') return pathname === '/admin';
        return pathname.startsWith(href);
    };

    return (
        <div className="min-h-screen bg-background-subtle">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 z-50 h-full w-[260px] bg-white border-r border-border
                    flex flex-col transition-transform duration-300 ease-out
                    lg:translate-x-0
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-5 border-b border-border">
                    <Link href="/admin" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-500/15">
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <span className="text-sm font-bold text-foreground tracking-tight">Rasid Admin</span>
                            <span className="block text-[10px] text-muted-foreground -mt-0.5 font-medium uppercase tracking-wider">
                                Control Center
                            </span>
                        </div>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    <p className="px-3 mb-3 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
                        Navigation
                    </p>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                    group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                                    ${active
                                        ? 'bg-violet-50 text-violet-700 shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                                    }
                                `}
                            >
                                <span
                                    className={`
                                        p-1.5 rounded-lg transition-colors
                                        ${active ? 'bg-violet-100 text-violet-600' : 'text-muted-foreground/70 group-hover:text-foreground/70'}
                                    `}
                                >
                                    <Icon className="w-4 h-4" />
                                </span>
                                <div className="flex flex-col min-w-0">
                                    <span className="leading-tight">{item.label}</span>
                                    <span className={`text-[10px] leading-tight ${active ? 'text-violet-500/60' : 'text-muted-foreground/50'}`}>
                                        {item.description}
                                    </span>
                                </div>
                                {active && (
                                    <div className="ml-auto w-1 h-5 rounded-full bg-gradient-to-b from-violet-500 to-indigo-500 shrink-0" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="px-3 py-4 border-t border-border">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back to Dashboard</span>
                    </Link>
                </div>
            </aside>

            {/* Main area */}
            <div className="lg:ml-[260px] min-h-screen flex flex-col">
                {/* Top bar */}
                <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-xl border-b border-border flex items-center px-4 lg:px-8 gap-4">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground/50">Admin</span>
                        <span className="text-muted-foreground/30">/</span>
                        <span className="text-foreground/80 font-medium capitalize">
                            {pathname === '/admin'
                                ? 'Overview'
                                : pathname.split('/').pop()?.replace(/-/g, ' ') || 'Page'}
                        </span>
                    </div>

                    <div className="ml-auto flex items-center gap-3">
                        <Link
                            href={`${process.env.NEXT_PUBLIC_APP_URL || 'https://rasid.in'}/`}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                            <Home className="w-4 h-4" />
                            <span className="hidden sm:inline">Home</span>
                        </Link>
                        <button
                            onClick={() => signOut({ redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://rasid.in'}/` })}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border text-sm font-medium text-destructive hover:text-destructive-foreground hover:bg-destructive transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Sign Out</span>
                        </button>
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm">
                            <div className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </div>
                            <span className="text-[11px] font-medium tracking-wide">System Online</span>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 lg:p-8">
                    <div className="max-w-[1400px] w-full mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
