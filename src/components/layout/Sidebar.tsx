'use client';

import React from 'react';
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
    Package,
} from 'lucide-react';
import { BusinessSwitcher } from './BusinessSwitcher';
import { useClerk } from "@clerk/nextjs";

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Invoices', href: '/dashboard/invoices', icon: FileText },
    { name: 'Inventory', href: '/dashboard/inventory', icon: Package },
    { name: 'Upload & Convert', href: '/dashboard/upload', icon: Upload },
    { name: 'Buyers', href: '/dashboard/buyers', icon: Users },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

interface SidebarProps {
    businessName?: string;
    businesses?: { id: string; businessName: string }[];
}

const Sidebar: React.FC<SidebarProps> = ({ businessName = 'My Business', businesses = [] }) => {
    const pathname = usePathname();
    const { signOut } = useClerk();

    return (
        <aside
            className="fixed left-0 top-0 h-full w-64 bg-background border-r border-border z-40 hidden lg:flex flex-col transition-all duration-300"
            style={{ backgroundColor: '#ffffff', opacity: 1 }}
        >
            {/* Logo */}
            <div className="h-16 px-6 flex items-center border-b border-border/50">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform overflow-hidden">
                        <Image
                            src="/logos/Rasid_Logo.png"
                            alt="Rasid Logo"
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground font-display">Rasid</span>
                </Link>
            </div>

            {/* Business Selector */}
            <BusinessSwitcher currentBusinessName={businessName} businesses={businesses} />

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                <p className="px-3 py-2 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">
                    Main Menu
                </p>
                {navigation.map((item) => {
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
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-border/50 bg-muted/5">
                <button
                    onClick={() => signOut({ redirectUrl: '/' })}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 text-left"
                >
                    <LogOut className="w-[18px] h-[18px]" />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
