'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import {
    LayoutDashboard,
    FileText,
    Upload,
    Users,
    Settings,
    LogOut,
    X,
    HelpCircle,
    Package,
    Code2,
    CreditCard
} from 'lucide-react';
import { BusinessSwitcher } from './BusinessSwitcher';
import { useClerk } from "@clerk/nextjs";
import { PlanType } from '@/lib/constants/plans';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Invoices', href: '/dashboard/invoices', icon: FileText },
    { name: 'Inventory', href: '/dashboard/inventory', icon: Package },
    { name: 'Upload & Convert', href: '/dashboard/upload', icon: Upload },
    { name: 'Buyers', href: '/dashboard/buyers', icon: Users },
    { name: 'Subscription', href: '/dashboard/subscription', icon: CreditCard },
    { name: 'API Platform', href: '/dashboard/developer', icon: Code2 },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

interface MobileSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    businessName?: string | null;
    businesses?: { id: string; businessName: string | null }[];
    role?: 'OWNER' | 'ADMIN' | 'VIEWER';
    plan?: PlanType;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({
    isOpen,
    onClose,
    businessName = 'My Business',
    businesses = [],
    role,
    plan = 'FREE'
}) => {
    const pathname = usePathname();
    const { signOut } = useClerk();

    // Close on route change
    useEffect(() => {
        onClose();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    // Prevent scrolling when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    if (typeof document === 'undefined') return null;

    return createPortal(
        <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Sidebar Panel */}
            <div className="fixed inset-y-0 left-0 w-72 bg-background border-r border-border shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col">
                <div className="h-16 px-6 flex items-center justify-end border-b border-border/50">
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 flex flex-col">
                    <BusinessSwitcher currentBusinessName={businessName} businesses={businesses} plan={plan} />

                    <nav className="flex-1 px-4 space-y-1 mt-4">
                        <p className="px-3 py-2 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">
                            Main Menu
                        </p>
                        {navigation.map((item) => {
                            // Hide API Platform, Subscription, and Settings for non-owners
                            if (item.name === 'API Platform' && role !== 'OWNER') return null;
                            if (item.name === 'Subscription' && role !== 'OWNER') return null;
                            if (item.name === 'Settings' && role !== 'OWNER') return null;

                            const isActive = pathname === item.href ||
                                (pathname.startsWith(item.href + '/') && item.href !== '/dashboard');

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl group relative overflow-hidden',
                                        'transition-all duration-200',
                                        isActive
                                            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                                            : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground'
                                    )}
                                >
                                    <item.icon className={cn(
                                        'w-[18px] h-[18px] transition-colors',
                                        isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary'
                                    )} />
                                    <span className="relative z-10">{item.name}</span>
                                </Link>
                            );
                        })}
                        <Link
                            href="/help"
                            className={cn(
                                'flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl group relative overflow-hidden',
                                'transition-all duration-200',
                                pathname === '/help'
                                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                                    : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground'
                            )}
                        >
                            <HelpCircle className={cn(
                                'w-[18px] h-[18px] transition-colors',
                                pathname === '/help' ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary'
                            )} />
                            <span className="relative z-10">Help</span>
                        </Link>
                    </nav>

                    <div className="p-4 border-t border-border/50 bg-muted/5 mt-auto">
                        <button
                            onClick={() => signOut({ redirectUrl: '/' })}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 text-left"
                        >
                            <LogOut className="w-[18px] h-[18px]" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
