'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2, Sparkles, Zap, Building2, Crown, Infinity as InfinityIcon, AlertCircle } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import { PlanType, PLANS } from '@/lib/constants/plans';
import { createSubscriptionCheckout } from '@/app/actions/subscription';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';


interface PricingClientProps {
    currentPlan: PlanType;
    hasPendingCancellation?: boolean;
    subscriptionEndsAt?: string | null;
}

export default function PricingClient({ currentPlan, hasPendingCancellation, subscriptionEndsAt }: PricingClientProps) {
    const router = useRouter();
    const [loadingPlan, setLoadingPlan] = useState<PlanType | null>(null);

    const handleSelectPlan = async (planKey: PlanType) => {
        try {
            setLoadingPlan(planKey);
            const { url } = await createSubscriptionCheckout(planKey);
            if (url) {
                if (url.startsWith('/')) {
                    router.push(url);
                } else {
                    window.location.href = url;
                }
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Failed to select plan');
            setLoadingPlan(null);
        }
    };

    const getIcon = (name: string) => {
        switch (name) {
            case 'Free': return <Zap className="w-5 h-5 text-neutral-600" />;
            case 'Basic': return <Building2 className="w-5 h-5 text-blue-600" />;
            case 'Pro': return <Sparkles className="w-5 h-5 text-emerald-600" />;
            case 'Premium': return <Crown className="w-5 h-5 text-violet-600" />;
            case 'Lifetime': return <InfinityIcon className="w-5 h-5 text-neutral-900" />;
            default: return <Zap className="w-5 h-5" />;
        }
    };

    const freePlan = PLANS['FREE'];
    const paidPlanKeys: PlanType[] = ['BASIC', 'PRO', 'PREMIUM', 'LIFETIME'];

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-12 overflow-x-hidden">
            <div className="relative z-10 max-w-7xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900"
                    >
                        Plans that scale with you
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-neutral-500 text-lg max-w-2xl mx-auto"
                    >
                        Choose the perfect plan for your business needs. Upgrade or downgrade at any time.
                    </motion.p>
                </div>

                {/* Free Plan - Full Width Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-md"
                >
                    <div className="relative flex flex-col md:flex-row items-center gap-8 p-8 md:p-10">
                        <div className="flex-1 space-y-4 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-600">
                                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                Current Plan
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-neutral-900">Free Forever</h2>
                                <p className="mt-2 text-neutral-500">Essential tools for freelancers and beginners.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3 flex-1">
                            {freePlan.features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm text-neutral-600">
                                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>

                        <Button disabled className="w-full md:w-auto bg-neutral-100 text-neutral-400 border border-neutral-200 h-10 px-6 rounded-lg cursor-not-allowed hover:bg-neutral-100">
                            Active Plan
                        </Button>
                    </div>
                </motion.div>

                {/* Paid Plans - Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {paidPlanKeys.map((key, index) => {
                        const plan = PLANS[key];
                        const isPopular = key === 'PRO';
                        const isLifetime = key === 'LIFETIME';
                        const isCurrent = key === currentPlan;
                        const isCancelling = isCurrent && hasPendingCancellation;

                        return (
                            <motion.div
                                key={key}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + (index * 0.1) }}
                                className={cn(
                                    "relative flex flex-col rounded-2xl border bg-white transition-all duration-300 overflow-hidden group hover:shadow-lg",
                                    isCancelling ? "border-amber-400 ring-1 ring-amber-400 bg-amber-50/10" :
                                        isCurrent ? "border-emerald-500 ring-1 ring-emerald-500" :
                                            isPopular ? "border-emerald-200 hover:border-emerald-300 ring-1 ring-emerald-100/50" :
                                                isLifetime ? "border-neutral-200 hover:border-neutral-300 bg-neutral-50/50" :
                                                    "border-neutral-200 hover:border-neutral-300"
                                )}
                            >
                                {isPopular && !isCurrent && (
                                    <div className="absolute top-0 right-0 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl z-20">
                                        MOST POPULAR
                                    </div>
                                )}

                                {isCancelling && (
                                    <div className="absolute top-0 right-0 bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-bl-xl border-l border-b border-amber-200 z-20 flex items-center gap-1.5">
                                        <AlertCircle className="w-3 h-3" />
                                        CANCELLING
                                    </div>
                                )}

                                {isCurrent && !isCancelling && (
                                    <div className="absolute top-0 right-0 bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-bl-xl border-l border-b border-emerald-200 z-20 flex items-center gap-1.5">
                                        <Check className="w-3 h-3" strokeWidth={3} />
                                        ACTIVE
                                    </div>
                                )}

                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="mb-8">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className={cn(
                                                "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                                                isPopular ? "bg-emerald-100/50" :
                                                    isLifetime ? "bg-neutral-100" : "bg-neutral-50"
                                            )}>
                                                {getIcon(plan.name)}
                                            </div>
                                            <div className="text-right">
                                                <h3 className="text-lg font-bold text-neutral-900">{plan.name}</h3>
                                                <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider mt-1">
                                                    {plan.period === 'lifetime' ? 'One Time' : 'Monthly'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-bold text-neutral-900 tracking-tight">${plan.price}</span>
                                            <span className="text-neutral-500 font-medium">/{plan.period === 'lifetime' ? 'life' : 'mo'}</span>
                                        </div>
                                        <p className="mt-4 text-sm text-neutral-500 leading-relaxed min-h-[40px]">
                                            {plan.period === 'lifetime'
                                                ? 'Pay once and enjoy forever access with all future updates included.'
                                                : 'Perfect for consistent invoicing needs with flexible monthly billing.'}
                                        </p>

                                        {isCancelling && (
                                            <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-100 text-xs">
                                                <p className="font-semibold text-amber-800 mb-1">Access ends on:</p>
                                                <p className="text-amber-700">
                                                    {subscriptionEndsAt
                                                        ? new Date(subscriptionEndsAt).toLocaleDateString('en-US', { dateStyle: 'medium' })
                                                        : 'Period End'
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4 mb-8 flex-1">
                                        <div className="h-px bg-neutral-100" />
                                        {plan.features.map((feature, i) => (
                                            <div key={i} className="flex items-start gap-3 text-sm text-neutral-600 group-hover:text-neutral-900 transition-colors">
                                                <div className={cn(
                                                    "mt-0.5 rounded-full p-0.5 flex-shrink-0 bg-emerald-100 text-emerald-600"
                                                )}>
                                                    <Check className="w-3 h-3" strokeWidth={3} />
                                                </div>
                                                <span className="leading-tight">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <Button
                                        onClick={() => handleSelectPlan(key)}
                                        disabled={loadingPlan !== null || (isCurrent && !hasPendingCancellation)}
                                        className={cn(
                                            "w-full h-12 rounded-lg font-semibold transition-all duration-300",
                                            isCurrent && !hasPendingCancellation
                                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default"
                                                : isCurrent && hasPendingCancellation
                                                    ? "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20"
                                                    : isPopular
                                                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
                                                        : isLifetime
                                                            ? "bg-neutral-900 hover:bg-neutral-800 text-white shadow-lg shadow-neutral-900/20"
                                                            : "bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50"
                                        )}
                                    >
                                        {loadingPlan === key ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : isCurrent && hasPendingCancellation ? (
                                            "Resubscribe"
                                        ) : isCurrent ? (
                                            "Active Plan"
                                        ) : (
                                            `Get ${plan.name}`
                                        )}
                                    </Button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="text-center py-8">
                    <p className="text-neutral-500 text-sm">
                        Enterprise needs? <span className="text-neutral-900 font-medium hover:underline cursor-pointer">Contact Sales</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
