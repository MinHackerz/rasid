'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { Lock } from 'lucide-react';

interface PremiumSectionGuardProps {
    isAllowed: boolean;
    children: React.ReactNode;
    featureName?: string;
}

export function PremiumSectionGuard({
    isAllowed,
    children,
    featureName = "Premium Feature"
}: PremiumSectionGuardProps) {
    if (isAllowed) {
        return <>{children}</>;
    }

    return (
        <div className="relative overflow-hidden rounded-xl border border-neutral-200/50">
            {/* Blurred Content */}
            <div className="filter blur-sm opacity-30 select-none pointer-events-none grayscale">
                {children}
            </div>

            {/* Lock Overlay */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px]">
                <div className="bg-white/95 p-6 rounded-xl shadow-lg border border-neutral-200/60 max-w-xs text-center backdrop-blur-sm">
                    <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Lock className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-base font-bold text-neutral-900 mb-1">{featureName}</h3>
                    <p className="text-neutral-500 text-xs mb-4">
                        Upgrade your plan to access this feature
                    </p>
                    <Link href="/pricing" className="w-full block">
                        <Button className="w-full text-sm" size="sm">
                            Upgrade Plan
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
