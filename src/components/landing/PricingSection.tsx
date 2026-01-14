'use client';

import { motion } from 'framer-motion';
import { Check, Zap, Building2, Crown, Sparkles, Infinity as InfinityIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { PlanType, PLANS } from '@/lib/constants/plans';

export function PricingSection() {
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
        <section id="pricing" className="py-24 bg-white relative overflow-hidden">
            <div className="container px-4 md:px-6 mx-auto max-w-7xl relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <h2 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
                        Simple, transparent pricing
                    </h2>
                    <p className="text-lg text-neutral-600">
                        Choose the plan that's right for you. Change or cancel anytime.
                    </p>
                </div>

                {/* Free Plan - Wide Card */}
                <div className="mb-12 rounded-2xl border border-neutral-200 bg-neutral-50 p-1">
                    <div className="flex flex-col md:flex-row items-center gap-8 rounded-xl bg-white p-8 md:p-10 shadow-sm">
                        <div className="md:w-1/3 text-center md:text-left space-y-3">
                            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-700">
                                <Zap className="w-3 h-3 fill-neutral-500 text-neutral-500" />
                                Starter Plan
                            </div>
                            <h3 className="text-2xl font-bold text-neutral-900">Free Forever</h3>
                            <p className="text-neutral-500">Essential features for individuals and freelancers. No credit card required.</p>
                        </div>

                        <div className="md:w-1/3 grid grid-cols-1 sm:grid-cols-2 gap-3 pl-4 md:border-l border-neutral-100">
                            {freePlan.features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-neutral-700">
                                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>

                        <div className="md:w-1/3 flex justify-center md:justify-end">
                            <Link
                                href="/sign-up"
                                className="inline-flex h-12 items-center justify-center rounded-lg bg-neutral-900 px-8 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
                            >
                                Start for Free
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Paid Plans - 4 Column Layout */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 items-start">
                    {paidPlanKeys.map((key) => {
                        const plan = PLANS[key];
                        const isPopular = key === 'PRO';
                        const isLifetime = key === 'LIFETIME';

                        return (
                            <div
                                key={key}
                                className={cn(
                                    "group relative flex flex-col rounded-2xl border bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full overflow-hidden",
                                    isPopular
                                        ? "border-emerald-500 shadow-xl shadow-emerald-500/10 z-10 scale-[1.02] md:scale-105 lg:scale-105"
                                        : isLifetime
                                            ? "border-neutral-900 shadow-xl shadow-neutral-900/10 z-10"
                                            : "border-neutral-200 hover:border-neutral-300 shadow-sm"
                                )}
                            >
                                {isPopular && (
                                    <div className="bg-emerald-500 py-1.5 text-center">
                                        <p className="text-xs font-bold uppercase tracking-wide text-white">
                                            Most Popular
                                        </p>
                                    </div>
                                )}
                                {isLifetime && (
                                    <div className="bg-neutral-900 py-1.5 text-center">
                                        <p className="text-xs font-bold uppercase tracking-wide text-white">
                                            Best Value
                                        </p>
                                    </div>
                                )}

                                <div className={cn("flex flex-col p-6 h-full", (isPopular || isLifetime) ? "pt-8" : "")}>
                                    <div className="mb-6">
                                        <div className={cn(
                                            "mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg",
                                            isPopular ? "bg-emerald-100 text-emerald-600" :
                                                isLifetime ? "bg-neutral-100 text-neutral-900" : "bg-neutral-100 text-neutral-600"
                                        )}>
                                            {getIcon(plan.name)}
                                        </div>
                                        <h3 className="text-xl font-bold text-neutral-900">{plan.name}</h3>
                                        <div className="mt-2 flex items-baseline gap-1">
                                            <span className="text-3xl font-bold text-neutral-900">$</span>
                                            <span className="text-4xl font-bold text-neutral-900 tracking-tight">{plan.price}</span>
                                            <span className="text-sm font-medium text-neutral-500">
                                                /{plan.period === 'lifetime' ? 'life' : 'mo'}
                                            </span>
                                        </div>
                                        <p className="mt-4 text-sm text-neutral-500">
                                            {plan.period === 'lifetime' ? 'One-time payment.' : 'Billed monthly.'}
                                        </p>
                                    </div>

                                    <div className="flex-1 space-y-4 border-t border-neutral-100 pt-6">
                                        {plan.features.map((feature, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <div className="flex-shrink-0 rounded-full bg-emerald-100 p-0.5 text-emerald-600 mt-0.5">
                                                    <Check className="h-3 w-3" strokeWidth={3} />
                                                </div>
                                                <span className="text-sm text-neutral-600 leading-tight group-hover:text-neutral-900 transition-colors">
                                                    {feature}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8">
                                        <Link
                                            href="/sign-up"
                                            className={cn(
                                                "block w-full rounded-lg px-4 py-3 text-center text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]",
                                                isPopular
                                                    ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/25"
                                                    : isLifetime
                                                        ? "bg-neutral-900 text-white hover:bg-neutral-800 shadow-lg shadow-neutral-900/25"
                                                        : "bg-white text-neutral-900 ring-1 ring-inset ring-neutral-200 hover:bg-neutral-50"
                                            )}
                                        >
                                            Choose {plan.name}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
