'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useUser, UserButton } from '@clerk/nextjs';
import { LayoutDashboard } from 'lucide-react';

export function ApiDocsHeader() {
    const { isSignedIn, isLoaded } = useUser();

    return (
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                        <Image
                            src="/logos/Rasid_Logo.png"
                            alt="Rasid Logo"
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <span className="font-bold text-xl text-slate-900 tracking-tight">Rasid</span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mr-2 hidden sm:block">
                        Back to Home
                    </Link>
                    {!isLoaded ? (
                        <div className="w-24 h-9 bg-slate-100 rounded-lg animate-pulse" />
                    ) : isSignedIn ? (
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                                <LayoutDashboard className="w-4 h-4" />
                                Dashboard
                            </Link>
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                <UserButton afterSignOutUrl="/" />
                            </div>
                        </div>
                    ) : (
                        <>
                            <Link href="/sign-in" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Sign In
                            </Link>
                            <Link href="/sign-up" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
