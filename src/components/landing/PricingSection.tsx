'use client';

import { motion } from 'framer-motion';
import { Check, Zap, Building2, Crown, Sparkles, Infinity as InfinityIcon, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { PlanType, PLANS } from '@/lib/constants/plans';
import { Button } from '@/components/ui';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSubscriptionCheckout } from '@/app/actions/subscription';
import { toast } from 'sonner';

interface PricingSectionProps {
    currentPlan?: PlanType;
    hasPendingCancellation?: boolean;
    subscriptionEndsAt?: string | null;
    isLoggedIn?: boolean;
}

export function PricingSection({
    currentPlan = undefined,
    hasPendingCancellation = false,
    subscriptionEndsAt = null,
    isLoggedIn = false
}: PricingSectionProps) {
    const router = useRouter();
    const [loadingPlan, setLoadingPlan] = useState<PlanType | null>(null);

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

    const handleSelectPlan = async (planKey: PlanType) => {
        if (!isLoggedIn) {
            router.push('/sign-up');
            return;
        }

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

    const freePlan = PLANS['FREE'];
    const paidPlanKeys: PlanType[] = ['BASIC', 'PRO', 'PREMIUM', 'LIFETIME'];

    return (
        <section id="pricing" className="py-24 bg-gray-50/50 relative overflow-hidden">
            <div className="container px-4 md:px-6 mx-auto max-w-7xl relative z-10 space-y-12">
                <div className="text-center max-w-3xl mx-auto space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900">
                        Plans that scale with you
                    </h2>
                    <p className="text-lg text-neutral-500">
                        Choose the perfect plan for your business needs. Upgrade or downgrade at any time.
                    </p>
                </div>

                {/* Free Plan - Full Width Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-md max-w-5xl mx-auto"
                >
                    <div className="relative flex flex-col md:flex-row items-center gap-8 p-8 md:p-10">
                        <div className="flex-1 space-y-4 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-600">
                                {isLoggedIn && currentPlan === 'FREE' ? (
                                    <>
                                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                        Current Plan
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-3 h-3 fill-neutral-500 text-neutral-500" />
                                        Starter Plan
                                    </>
                                )}
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

                        <div className="w-full md:w-auto">
                            {isLoggedIn && currentPlan === 'FREE' ? (
                                <Button disabled className="w-full md:w-auto bg-neutral-100 text-neutral-400 border border-neutral-200 h-10 px-6 rounded-lg cursor-not-allowed hover:bg-neutral-100">
                                    Active Plan
                                </Button>
                            ) : (
                                <Link href="/sign-up">
                                    <Button className="w-full md:w-auto bg-neutral-900 text-white hover:bg-neutral-800 h-10 px-8 rounded-lg font-semibold shadow-lg shadow-neutral-900/10">
                                        Start for Free
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Paid Plans - Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {paidPlanKeys.map((key, index) => {
                        const plan = PLANS[key];
                        const isPopular = key === 'PRO';
                        const isLifetime = key === 'LIFETIME';
                        const isCurrent = isLoggedIn && key === currentPlan;
                        const isCancelling = isCurrent && hasPendingCancellation;

                        return (
                            <motion.div
                                key={key}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
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
        </section>
    );
}
