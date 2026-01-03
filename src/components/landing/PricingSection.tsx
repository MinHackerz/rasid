'use client';

import { useState } from 'react';
import { Check, Zap, Crown, Infinity, Sparkles, X, Flame } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PricingTier {
    name: string;
    description: string;
    icon: React.ReactNode;
    monthlyPrice: number;
    annualPrice: number;
    lifetimePrice: number;
    features: string[];
    limitations?: string[];
    highlight?: boolean;
    cta: string;
    popular?: boolean;
    color?: string;
    claimed?: number;
    total?: number;
}

const pricingTiers: PricingTier[] = [
    {
        name: 'Pro',
        description: 'Perfect for small businesses',
        icon: <Zap className="w-5 h-5" />,
        monthlyPrice: 10,
        annualPrice: 8,
        lifetimePrice: 49,
        features: [
            '5,000 invoices/month',
            '1,000 handwritten to digitized invoices',
            '10+ invoice templates',
            '5 business profiles',
            'Cryptographic signature',
            'Email/WhatsApp sending',
            'Setup assistance',
        ],
        cta: 'Get Lifetime Access',
        popular: true,
        claimed: 12,
        total: 20,
    },
    {
        name: 'Premium',
        description: 'For growing businesses',
        icon: <Crown className="w-5 h-5" />,
        monthlyPrice: 20,
        annualPrice: 16,
        lifetimePrice: 89,
        features: [
            '10,000 invoices/month',
            '5,000 handwritten to digitized invoices',
            '10+ invoice templates',
            '10 business profiles',
            'Cryptographic signature',
            'Email/WhatsApp sending',
            'Priority support',
        ],
        cta: 'Get Lifetime Access',
        highlight: true,
        claimed: 7,
        total: 20,
    },
    {
        name: 'Lifetime',
        description: 'For enterprise needs',
        icon: <Infinity className="w-5 h-5" />,
        monthlyPrice: 199,
        annualPrice: 199,
        lifetimePrice: 149,
        features: [
            'Unlimited invoices',
            '1,00,000 handwritten to digitized invoices',
            '10+ invoice templates',
            '100 business profiles',
            'Cryptographic signature',
            'Unlimited email/WhatsApp sending',
            'Lifetime support & updates',
        ],
        cta: 'Get Lifetime Access',
        claimed: 2,
        total: 10,
    },
];

const freeTier = {
    name: 'Free',
    description: 'Perfect for getting started',
    monthlyPrice: 0,
    features: [
        '100 invoices/month',
        '10 handwritten to digitized invoices/month',
        '1 invoice template',
        '1 business profile',
        'PDF download',
        'Basic support',
    ],
    limitations: [
        'No cryptographic signature',
        'No email/WhatsApp sending',
    ],
    cta: 'Start for free',
};

export function PricingSection() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual' | 'lifetime'>('lifetime');

    return (
        <section id="pricing" className="py-24 bg-white relative overflow-hidden">
            <div className="container-app relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-5xl md:text-6xl font-bold font-display text-neutral-900 mb-4 tracking-tight">
                        Pay Once, Use Forever
                    </h1>
                    <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-8">
                        Get lifetime access to all Rasid features at a fraction of the regular price. Limited time offer - no recurring fees ever.
                    </p>

                    {/* Sale Banner */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold mb-8">
                        <Flame className="w-4 h-4" />
                        <span>BLACK FRIDAY SALE — UP TO 75% OFF</span>
                    </div>

                    {/* Billing Toggle */}
                    <div className="inline-flex items-center gap-2 px-1 py-1 bg-neutral-100 rounded-lg">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={cn(
                                "px-6 py-2.5 text-sm font-semibold rounded-md transition-all duration-200",
                                billingCycle === 'monthly'
                                    ? "bg-white text-neutral-900 shadow-sm"
                                    : "text-neutral-600 hover:text-neutral-900"
                            )}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle('annual')}
                            className={cn(
                                "px-6 py-2.5 text-sm font-semibold rounded-md transition-all duration-200 relative",
                                billingCycle === 'annual'
                                    ? "bg-white text-neutral-900 shadow-sm"
                                    : "text-neutral-600 hover:text-neutral-900"
                            )}
                        >
                            Yearly
                            <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-emerald-500 text-white rounded-full">
                                Save 20%
                            </span>
                        </button>
                        <button
                            onClick={() => setBillingCycle('lifetime')}
                            className={cn(
                                "px-6 py-2.5 text-sm font-semibold rounded-md transition-all duration-200 relative",
                                billingCycle === 'lifetime'
                                    ? "bg-neutral-900 text-white shadow-sm"
                                    : "text-neutral-600 hover:text-neutral-900"
                            )}
                        >
                            Lifetime
                            <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-orange-500 text-white rounded-full">
                                Best Value
                            </span>
                        </button>
                    </div>
                </motion.div>

                {/* Pricing Cards - Paid Plans */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {pricingTiers.map((tier, index) => {
                        const isLifetimeView = billingCycle === 'lifetime';
                        const price = isLifetimeView 
                            ? tier.lifetimePrice 
                            : billingCycle === 'annual' 
                                ? tier.annualPrice 
                                : tier.monthlyPrice;
                        
                        const originalPrice = isLifetimeView ? tier.monthlyPrice : null;
                        const left = tier.total && tier.claimed ? tier.total - tier.claimed : null;

                        return (
                            <motion.div
                                key={tier.name}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className={cn(
                                    "relative bg-white rounded-2xl border-2 transition-all duration-300 h-full flex flex-col overflow-hidden",
                                    tier.popular
                                        ? "border-neutral-900 shadow-xl"
                                        : "border-neutral-200 shadow-lg hover:shadow-xl"
                                )}
                            >
                                {/* Popular Badge */}
                                {tier.popular && (
                                    <div className="absolute top-4 right-4">
                                        <span className="px-3 py-1 text-xs font-bold bg-neutral-900 text-white rounded-full">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                {/* Header */}
                                <div className="p-6 pb-4 border-b border-neutral-100">
                                    <h3 className="text-2xl font-bold text-neutral-900 mb-2">{tier.name}</h3>
                                    <p className="text-sm text-neutral-500 mb-4">{tier.description}</p>

                                    {/* Price */}
                                    <div className="mb-3">
                                        {isLifetimeView ? (
                                            <div>
                                                <div className="flex items-baseline gap-2 mb-1">
                                                    <span className="text-4xl font-bold text-neutral-900">${tier.lifetimePrice}</span>
                                                    <span className="text-lg font-semibold text-neutral-400 line-through">${tier.monthlyPrice}</span>
                                                    <span className="text-sm font-semibold text-neutral-600">lifetime</span>
                                                </div>
                                                {left !== null && (
                                                    <p className="text-xs text-neutral-500 mt-2">
                                                        {tier.claimed}/{tier.total} claimed • {left} left
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <div>
                                                <span className="text-4xl font-bold text-neutral-900">${price}</span>
                                                <span className="text-base font-medium text-neutral-500">/month</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Features */}
                                <div className="p-6 flex-1">
                                    <ul className="space-y-3">
                                        {tier.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-3">
                                                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                                                <span className="text-sm text-neutral-700 leading-relaxed">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* CTA */}
                                <div className="p-6 pt-0">
                                    <Link
                                        href="/sign-up"
                                        className={cn(
                                            "block w-full text-center px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200",
                                            tier.popular
                                                ? "bg-neutral-900 text-white hover:bg-neutral-800 shadow-lg hover:shadow-xl"
                                                : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
                                        )}
                                    >
                                        {tier.cta}
                                    </Link>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Free Plan */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="max-w-md mx-auto bg-gradient-to-br from-neutral-50 to-white border-2 border-neutral-200 rounded-2xl p-8"
                >
                    <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-neutral-900 mb-2">{freeTier.name}</h3>
                        <div className="mb-4">
                            <span className="text-4xl font-bold text-neutral-900">$0</span>
                            <span className="text-base text-neutral-500 ml-2">free forever – the most generous free plan on the market</span>
                        </div>
                    </div>

                    <ul className="space-y-3 mb-6">
                        {freeTier.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                                <span className="text-sm text-neutral-700 leading-relaxed">{feature}</span>
                            </li>
                        ))}
                        {freeTier.limitations?.map((limitation, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                                <X className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                                <span className="text-sm text-neutral-400 leading-relaxed">{limitation}</span>
                            </li>
                        ))}
                    </ul>

                    <Link
                        href="/sign-up"
                        className="block w-full text-center px-6 py-3 rounded-xl font-semibold text-sm bg-neutral-100 text-neutral-900 hover:bg-neutral-200 transition-all duration-200"
                    >
                        {freeTier.cta}
                    </Link>
                </motion.div>

                {/* FAQ Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="mt-20 max-w-4xl mx-auto"
                >
                    <h2 className="text-3xl font-bold text-neutral-900 mb-8 text-center">Frequently asked questions</h2>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-neutral-900 mb-2">How does billing work?</h3>
                            <p className="text-neutral-600">Monthly plans are billed every month, yearly plans give you 20% off, and lifetime plans are a one-time payment with no recurring charges.</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Can I change my plan anytime?</h3>
                            <p className="text-neutral-600">Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate any charges.</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-neutral-900 mb-2">What's included in lifetime access?</h3>
                            <p className="text-neutral-600">Lifetime plans include all current features plus all future updates and new features. You'll never pay another subscription fee.</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Is there a money-back guarantee?</h3>
                            <p className="text-neutral-600">Yes! We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, we'll refund your payment completely.</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Do you offer discounts for startups?</h3>
                            <p className="text-neutral-600">Yes! We offer special discounts for early-stage startups and non-profits. Contact us with your details for a custom quote.</p>
                        </div>
                    </div>
                </motion.div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="mt-16 text-center"
                >
                    <h2 className="text-2xl font-bold text-neutral-900 mb-4">Ready to streamline your invoicing?</h2>
                    <p className="text-neutral-600 mb-6">Join thousands of businesses that trust Rasid for their invoicing needs.</p>
                    <Link
                        href="/sign-up"
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        Start for free
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
