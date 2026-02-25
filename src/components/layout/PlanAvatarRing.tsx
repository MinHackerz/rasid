'use client';

import React from 'react';
import { UserButton } from '@clerk/nextjs';
import { PlanType } from '@/lib/constants/plans';

interface PlanAvatarRingProps {
    plan?: PlanType;
    size?: 'sm' | 'md';
}

/**
 * Wraps the Clerk UserButton with an animated ring
 * that reflects the user's subscription plan.
 *
 * FREE     → plain neutral border
 * BASIC    → soft blue ring with subtle pulse
 * PRO      → rotating blue-violet gradient ring
 * PREMIUM  → spinning gold gradient ring + glow
 * LIFETIME → prismatic rainbow ring + shimmer
 */
export default function PlanAvatarRing({ plan = 'FREE', size = 'md' }: PlanAvatarRingProps) {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const sizeClasses = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
    const innerSize = size === 'sm' ? 'w-[30px] h-[30px]' : 'w-[38px] h-[38px]';

    if (!mounted) {
        return <div className={`${sizeClasses} bg-neutral-100/50 rounded-full animate-pulse flex-shrink-0`} />;
    }

    return (
        <div className={`plan-avatar-ring plan-ring-${plan.toLowerCase()} ${sizeClasses}`}>
            <div className="plan-avatar-ring__border" />
            <div className={`plan-avatar-ring__inner ${innerSize}`}>
                <UserButton
                    appearance={{
                        elements: {
                            avatarBox: "w-full h-full rounded-full"
                        }
                    }}
                />
            </div>
            {/* Plan indicator dot */}
            {plan !== 'FREE' && (
                <div className={`plan-avatar-ring__badge plan-badge-${plan.toLowerCase()}`} />
            )}
        </div>
    );
}
