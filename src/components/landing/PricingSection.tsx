'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap, Building2, Crown, Sparkles, Infinity as InfinityIcon, Loader2, AlertCircle, Star } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { PlanType, PLANS } from '@/lib/constants/plans';
import { Button } from '@/components/ui';
import { triggerBillingToggleConfetti } from '@/lib/confetti';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
    const pathname = usePathname();
    const [loadingPlan, setLoadingPlan] = useState<PlanType | null>(null);
    const [isAnnual, setIsAnnual] = useState(true);

    const handleToggleBilling = (nextIsAnnual: boolean) => {
        setIsAnnual(nextIsAnnual);
        triggerBillingToggleConfetti(nextIsAnnual ? 'annual' : 'monthly');
    };

    const getIcon = (name: string) => {
        switch (name) {
            case 'Free': return <Zap className="w-5 h-5 text-neutral-600" />;
            case 'Basic': return <Building2 className="w-5 h-5 text-blue-600" />;
            case 'Pro': return <Sparkles className="w-5 h-5 text-emerald-600" />;
            case 'Premium': return <Crown className="w-5 h-5 text-violet-600" />;
            case 'Lifetime': return <InfinityIcon className="w-5 h-5 text-amber-600" />;
            default: return <Zap className="w-5 h-5" />;
        }
    };

    const handleSelectPlan = async (planKey: PlanType) => {
        if (!isLoggedIn) {
            router.push(`/sign-up?redirect_url=${encodeURIComponent(pathname)}`);
            return;
        }

        try {
            setLoadingPlan(planKey);
            const billingInterval = planKey === 'LIFETIME' ? 'monthly' : (isAnnual ? 'annual' : 'monthly');
            const { url } = await createSubscriptionCheckout(planKey, billingInterval);
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
    const lifetimePlan = PLANS['LIFETIME'];
    const subscriptionPlanKeys: PlanType[] = ['BASIC', 'PRO', 'PREMIUM'];

    return (
        <section id="pricing" className="py-24 bg-gray-50/50 relative">
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
                                <Link href={`/sign-up?redirect_url=${encodeURIComponent(pathname)}`}>
                                    <Button className="w-full md:w-auto bg-neutral-900 text-white hover:bg-neutral-800 h-10 px-8 rounded-lg font-semibold shadow-lg shadow-neutral-900/10">
                                        Start for Free
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Lifetime Plan - Promoted Full Width */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="relative max-w-5xl mx-auto group/lifetime"
                >
                    {/* Pulsing outer glow */}
                    <div className="lifetime-glow absolute -inset-[4px] rounded-[22px] bg-amber-400/50 blur-lg pointer-events-none" />

                    {/* Animated amber border */}
                    <div className="lifetime-border relative rounded-2xl p-[2px]">

                        <div className="relative rounded-[14px] bg-white overflow-hidden">
                            {/* Subtle warm inner tint */}
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/70 via-transparent to-orange-50/30 pointer-events-none" />

                            {/* Floating amber particles */}
                            <motion.div
                                className="absolute top-6 right-20 w-2 h-2 rounded-full bg-amber-400/50 pointer-events-none"
                                animate={{ y: [0, -10, 0], opacity: [0.4, 0.9, 0.4], scale: [1, 1.2, 1] }}
                                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                            />
                            <motion.div
                                className="absolute top-16 right-8 w-1.5 h-1.5 rounded-full bg-amber-300/60 pointer-events-none"
                                animate={{ y: [0, -7, 0], opacity: [0.3, 0.8, 0.3], scale: [1, 1.3, 1] }}
                                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
                            />
                            <motion.div
                                className="absolute bottom-10 right-16 w-1 h-1 rounded-full bg-amber-500/50 pointer-events-none"
                                animate={{ y: [0, -6, 0], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
                            />
                            <motion.div
                                className="absolute top-10 left-8 w-1.5 h-1.5 rounded-full bg-amber-300/40 pointer-events-none"
                                animate={{ y: [0, -8, 0], opacity: [0.2, 0.6, 0.2] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                            />

                            {/* Best Value Badge */}
                            <motion.div
                                className="absolute top-0 left-1/2 -translate-x-1/2 z-20"
                                initial={{ y: -40, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                            >
                                <div className="bg-amber-500 text-white text-xs font-semibold px-5 py-1.5 rounded-b-xl flex items-center gap-1.5 tracking-wide">
                                    <Star className="w-3 h-3 fill-white" />
                                    BEST VALUE
                                </div>
                            </motion.div>

                            {isLoggedIn && currentPlan === 'LIFETIME' && (
                                <div className="absolute top-0 right-0 bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-bl-xl border-l border-b border-emerald-200 z-20 flex items-center gap-1.5">
                                    <Check className="w-3 h-3" strokeWidth={3} />
                                    ACTIVE
                                </div>
                            )}

                            <div className="relative flex flex-col md:flex-row items-center gap-8 p-8 md:p-10 pt-14">
                                <div className="flex-1 space-y-4 text-center md:text-left">
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-100/80 px-3 py-1 text-sm font-medium text-amber-700">
                                            <InfinityIcon className="w-3.5 h-3.5" />
                                            One-Time Payment
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mt-3">
                                            Lifetime Access
                                        </h2>
                                        <p className="mt-2 text-neutral-600">
                                            Pay once and enjoy <span className="font-semibold text-amber-700">forever access</span> with all future updates included. No recurring bills, ever.
                                        </p>
                                    </motion.div>

                                    <div className="flex items-baseline gap-2 justify-center md:justify-start">
                                        <motion.span
                                            className="text-5xl font-bold text-neutral-900 tracking-tight"
                                            initial={{ scale: 0.9 }}
                                            whileInView={{ scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                                        >
                                            ${lifetimePlan.price}
                                        </motion.span>
                                        <span className="text-neutral-500 font-medium">/lifetime</span>
                                        <span className="ml-2 text-lg text-neutral-400 line-through">$480/yr</span>
                                    </div>

                                    <p className="text-sm text-amber-700 font-medium">
                                        💡 Equivalent to just {Math.ceil(lifetimePlan.price / 12)} $/month over a year — cheaper than any plan!
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3 flex-1">
                                    {lifetimePlan.features.slice(0, 10).map((feature, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.3 + i * 0.04 }}
                                            className="flex items-center gap-3 text-sm text-neutral-700"
                                        >
                                            <div className="rounded-full p-0.5 bg-amber-100 text-amber-600 flex-shrink-0">
                                                <Check className="w-3 h-3" strokeWidth={3} />
                                            </div>
                                            <span>{feature}</span>
                                        </motion.div>
                                    ))}
                                    {lifetimePlan.features.length > 10 && (
                                        <div className="flex items-center gap-3 text-sm text-amber-600 font-medium">
                                            <span>+{lifetimePlan.features.length - 10} more features</span>
                                        </div>
                                    )}
                                </div>

                                <div className="w-full md:w-auto flex flex-col gap-2">
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                                        <Button
                                            onClick={() => handleSelectPlan('LIFETIME')}
                                            disabled={loadingPlan !== null || (isLoggedIn && currentPlan === 'LIFETIME' && !hasPendingCancellation)}
                                            className={cn(
                                                "w-full md:w-auto h-12 px-10 rounded-xl font-bold text-base transition-all duration-300",
                                                isLoggedIn && currentPlan === 'LIFETIME' && !hasPendingCancellation
                                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default"
                                                    : "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 text-white shadow-xl shadow-orange-500/30 hover:shadow-orange-500/40"
                                            )}
                                        >
                                            {loadingPlan === 'LIFETIME' ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : isLoggedIn && currentPlan === 'LIFETIME' && !hasPendingCancellation ? (
                                                "Active Plan"
                                            ) : (
                                                "Get Lifetime Access →"
                                            )}
                                        </Button>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Monthly / Annual Toggle */}
                <div className="flex flex-col items-center gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.01, boxShadow: '0 12px 30px rgba(15,23,42,0.06)' }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 24 }}
                        className="relative inline-flex bg-white rounded-full p-1 border border-neutral-200/80 shadow-sm"
                    >
                        {/* Monthly */}
                        <motion.button
                            type="button"
                            aria-pressed={!isAnnual}
                            onClick={() => handleToggleBilling(false)}
                            whileTap={{ scale: 0.97 }}
                            className="relative flex-1 flex items-center justify-center px-5 py-2 text-sm font-medium rounded-full"
                        >
                            {!isAnnual && (
                                <motion.div
                                    layoutId="billingToggleThumb"
                                    className="absolute inset-0 rounded-full bg-white shadow-[0_10px_25px_rgba(15,23,42,0.10)] overflow-hidden"
                                    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                                >
                                    <motion.div
                                        key="monthly-highlight"
                                        initial={{ opacity: 0.35, scaleX: 0.6 }}
                                        animate={{ opacity: 0, scaleX: 1.4 }}
                                        transition={{ duration: 0.35, ease: 'easeOut' }}
                                        className="absolute inset-0 bg-gradient-to-r from-white via-slate-50 to-white/0 origin-left"
                                    />
                                </motion.div>
                            )}
                            <motion.span
                                className="relative z-10"
                                animate={{
                                    color: !isAnnual ? '#111827' : '#9ca3af',
                                    opacity: !isAnnual ? 1 : 0.8,
                                    scale: !isAnnual ? 1 : 0.97,
                                }}
                                transition={{ duration: 0.18 }}
                            >
                                Monthly
                            </motion.span>
                        </motion.button>

                        {/* Annual */}
                        <motion.button
                            type="button"
                            aria-pressed={isAnnual}
                            onClick={() => handleToggleBilling(true)}
                            whileTap={{ scale: 0.97 }}
                            className="relative flex-1 flex items-center justify-center px-5 py-2 text-sm font-medium rounded-full"
                        >
                            {isAnnual && (
                                <motion.div
                                    layoutId="billingToggleThumb"
                                    className="absolute inset-0 rounded-full bg-white shadow-[0_10px_25px_rgba(15,23,42,0.10)] overflow-hidden"
                                    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                                >
                                    <motion.div
                                        key="annual-highlight"
                                        initial={{ opacity: 0.35, scaleX: 0.6 }}
                                        animate={{ opacity: 0, scaleX: 1.4 }}
                                        transition={{ duration: 0.35, ease: 'easeOut' }}
                                        className="absolute inset-0 bg-gradient-to-l from-white via-slate-50 to-white/0 origin-right"
                                    />
                                </motion.div>
                            )}
                            <motion.span
                                className="relative z-10"
                                animate={{
                                    color: isAnnual ? '#111827' : '#9ca3af',
                                    opacity: isAnnual ? 1 : 0.8,
                                    scale: isAnnual ? 1 : 0.97,
                                }}
                                transition={{ duration: 0.18 }}
                            >
                                Annual
                            </motion.span>
                        </motion.button>
                    </motion.div>

                    {/* Animated savings badge */}
                    <AnimatePresence mode="wait">
                        {isAnnual ? (
                            <motion.div
                                key="annual-badge"
                                initial={{ opacity: 0, scale: 0.8, y: -6 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: -6 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full shadow-sm"
                            >
                                <motion.span
                                    animate={{ rotate: [0, 15, -10, 0] }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                >
                                    🎉
                                </motion.span>
                                You save 20% — billed annually
                            </motion.div>
                        ) : (
                            <motion.div
                                key="monthly-badge"
                                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -4 }}
                                transition={{ duration: 0.2 }}
                                className="text-xs text-neutral-400 font-medium"
                            >
                                Switch to Annual to save 20%
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Subscription Plans - 3 Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {subscriptionPlanKeys.map((key, index) => {
                        const plan = PLANS[key];
                        const isPopular = key === 'PRO';
                        const isCurrent = isLoggedIn && key === currentPlan;
                        const isCancelling = isCurrent && hasPendingCancellation;
                        const displayPrice = isAnnual && plan.annualPrice ? plan.annualPrice : plan.price;
                        const monthlySavings = isAnnual && plan.annualPrice ? plan.price - plan.annualPrice : 0;

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
                                                isPopular ? "bg-emerald-100/50" : "bg-neutral-50"
                                            )}>
                                                {getIcon(plan.name)}
                                            </div>
                                            <div className="text-right">
                                                <h3 className="text-lg font-bold text-neutral-900">{plan.name}</h3>
                                                <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider mt-1">
                                                    {isAnnual ? 'Billed Annually' : 'Monthly'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-baseline gap-1">
                                            <AnimatePresence mode="wait">
                                                <motion.span
                                                    key={displayPrice}
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    transition={{ duration: 0.25 }}
                                                    className="text-4xl font-bold text-neutral-900 tracking-tight"
                                                >
                                                    ${displayPrice}
                                                </motion.span>
                                            </AnimatePresence>
                                            <span className="text-neutral-500 font-medium">/mo</span>
                                        </div>

                                        {isAnnual && monthlySavings > 0 && (
                                            <motion.p
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="mt-1.5 text-sm text-emerald-600 font-medium"
                                            >
                                                Save ${monthlySavings * 12}/year
                                            </motion.p>
                                        )}

                                        <p className="mt-4 text-sm text-neutral-500 leading-relaxed min-h-[40px]">
                                            Perfect for consistent invoicing needs with flexible billing.
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
                                                <div className="mt-0.5 rounded-full p-0.5 flex-shrink-0 bg-emerald-100 text-emerald-600">
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
                        Enterprise needs? <a href="mailto:menajul99mhq@gmail.com" className="text-neutral-900 font-medium hover:underline cursor-pointer">Contact Sales</a>
                    </p>
                </div>
            </div>

            {/* Animation keyframes */}
            <style jsx global>{`
                @keyframes lifetime-glow-pulse {
                    0%, 100% { opacity: 0.4; transform: scale(1); }
                    50% { opacity: 0.75; transform: scale(1.01); }
                }
                @keyframes lifetime-border-sweep {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .lifetime-glow {
                    animation: lifetime-glow-pulse 3.5s ease-in-out infinite;
                }
                .lifetime-border {
                    background: linear-gradient(135deg, #fbbf24, #f59e0b, #d97706, #fbbf24, #fde68a, #f59e0b);
                    background-size: 300% 300%;
                    animation: lifetime-border-sweep 5s ease infinite;
                }
            `}</style>
        </section>
    );
}
