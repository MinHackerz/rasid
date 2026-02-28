'use client';

import { useEffect } from 'react';
import { syncReferralToClerk } from '@/app/actions/referrals';

export function ReferralSync() {
    useEffect(() => {
        const syncReferral = async () => {
            const code = localStorage.getItem('referralCode');
            if (code) {
                try {
                    const result = await syncReferralToClerk(code);
                    if (result.success) {
                        // After successful link or if already linked, remove it from local storage
                        localStorage.removeItem('referralCode');
                    }
                } catch (error) {
                    console.error('Failed to sync referral code:', error);
                }
            }
        };

        syncReferral();
    }, []);

    return null;
}
