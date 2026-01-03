'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bell, Plus, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui';
import { UserButton } from "@clerk/nextjs";
import { MobileSidebar } from './MobileSidebar';

interface HeaderProps {
    title?: string;
    showSearch?: boolean;
    action?: React.ReactNode;
    businessName?: string;
    businesses?: { id: string; businessName: string | null }[];
}

const Header: React.FC<HeaderProps> = ({ title, showSearch = false, action, businessName, businesses }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            <header
                className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-border/50 transition-all duration-300"
            >
                <div className="h-full px-6 lg:px-10 flex items-center justify-between">
                    {/* Left */}
                    <div className="flex items-center gap-4 lg:gap-6">
                        {/* Mobile Menu Trigger */}
                        <button
                            type="button"
                            className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-lg"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        {title && (
                            <h1 className="text-xl font-bold text-foreground font-display tracking-tight">
                                {title}
                            </h1>
                        )}

                        {showSearch && (
                            <div className="relative hidden md:block group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                                <input
                                    type="search"
                                    placeholder="Search invoices, clients..."
                                    className="w-80 pl-10 pr-4 py-2.5 text-sm bg-background border border-border/50 rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:bg-background transition-all duration-200"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                    <span className="text-[10px] font-medium text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded border border-border/50">⌘ K</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-3">
                        <Link
                            href="/help"
                            className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                        >
                            <span>Help</span>
                        </Link>
                        {action || (
                            <Link href="/dashboard/invoices/new">
                                <Button size="sm" className="gap-2 shadow-sm font-semibold rounded-lg">
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden sm:inline">New Invoice</span>
                                </Button>
                            </Link>
                        )}

                        {/* User Avatar */}
                        <div className="ml-2 w-10 h-10 rounded-full overflow-hidden border-2 border-neutral-200 flex items-center justify-center bg-neutral-100">
                            <UserButton
                                appearance={{
                                    elements: {
                                        avatarBox: "w-full h-full rounded-full"
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </header>

            <MobileSidebar
                isOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                businessName={businessName}
                businesses={businesses}
            />
        </>
    );
};

export default Header;
