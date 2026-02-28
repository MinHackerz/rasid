// Plan-based referral reward configuration
// Reward amounts differ by the referred user's subscribed plan tier

export const PLAN_REFERRAL_REWARDS: Record<string, { commission: string; credit: string; discount: string }> = {
    FREE: { commission: '5%', credit: '₹100', discount: '5% off' },
    BASIC: { commission: '10%', credit: '₹500', discount: '10% off' },
    PRO: { commission: '15%', credit: '₹1,000', discount: '15% off' },
    PREMIUM: { commission: '20%', credit: '₹2,000', discount: '20% off' },
    LIFETIME: { commission: '25%', credit: '₹5,000', discount: '25% off' },
};
