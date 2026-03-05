// Plan-based referral reward configuration
// Reward amounts differ by the referred user's subscribed plan tier

export const PLAN_REFERRAL_REWARDS: Record<string, { commission: string; credit: string; discount: string }> = {
    BASIC: { commission: '10%', credit: '$5', discount: '10% off' },
    PRO: { commission: '15%', credit: '$10', discount: '15% off' },
    PREMIUM: { commission: '20%', credit: '$20', discount: '20% off' },
    LIFETIME: { commission: '25%', credit: '$50', discount: '25% off' },
};
