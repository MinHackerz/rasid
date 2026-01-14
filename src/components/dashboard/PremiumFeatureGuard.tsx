'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { Lock } from 'lucide-react';

interface PremiumFeatureGuardProps {
    isAllowed: boolean;
    children: React.ReactNode;
    featureName?: string;
    description?: string;
    blurAmount?: string;
}

export function PremiumFeatureGuard({
    isAllowed,
    children,
    featureName = "Premium Feature",
    description = "Upgrade your plan to access this feature.",
    blurAmount = "blur-[6px]"
}: PremiumFeatureGuardProps) {
    if (isAllowed) {
        return <>{children}</>;
    }

    return (
        <div className="relative w-full h-full min-h-[400px] overflow-hidden rounded-xl border border-neutral-200/50">
            {/* Blurred Content */}
            <div className={`w-full h-full p-6 select-none pointer-events-none opacity-60 filter ${blurAmount} grayscale`}>
                {children}
                {/* Mock content fill if children are empty/loading to ensure blur effect visible */}
                <div className="space-y-4 mt-8">
                    <div className="h-8 bg-neutral-200 rounded w-1/3" />
                    <div className="h-32 bg-neutral-100 rounded w-full" />
                    <div className="h-8 bg-neutral-200 rounded w-1/4" />
                    <div className="grid grid-cols-3 gap-4">
                        <div className="h-24 bg-neutral-100 rounded" />
                        <div className="h-24 bg-neutral-100 rounded" />
                        <div className="h-24 bg-neutral-100 rounded" />
                    </div>
                </div>
            </div>

            {/* Lock Overlay */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px]">
                <div className="bg-white/90 p-8 rounded-2xl shadow-xl border border-neutral-200/60 max-w-sm text-center backdrop-blur-md">
                    <div className="w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-neutral-900/20">
                        <Lock className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">{featureName}</h3>
                    <p className="text-neutral-500 text-sm mb-6 leading-relaxed">
                        {description}
                    </p>
                    <Link href="/pricing" className="w-full">
                        <Button className="w-full shadow-lg hover:shadow-xl transition-all" variant="primary">
                            Upgrade to Unlock
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
