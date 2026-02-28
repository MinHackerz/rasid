import Link from 'next/link';
import Image from 'next/image';
import { Gift, Users, TrendingUp, Sparkles, ArrowRight, Check, Star } from 'lucide-react';
import { currentUser } from '@clerk/nextjs/server';
import { PLAN_REFERRAL_REWARDS } from '@/lib/constants/referral-rewards';
import { ReferralApplicationForm } from './ReferralApplicationForm';

import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Referral Program | Rasid',
    description: 'Earn rewards by referring friends and businesses to Rasid. Get commissions, account credits, or discounts for every successful referral based on the plan they subscribe to.',
    keywords: ['rasid referral', 'referral program', 'earn rewards', 'invoice platform referral', 'referral commission', 'rasid affiliate'],
    openGraph: {
        title: 'Referral Program — Earn Rewards with Rasid',
        description: 'Refer businesses to Rasid and earn commissions, credits, or discounts. Up to 25% commission per referral!',
        type: 'website',
        images: [{ url: '/api/og?page=referral', width: 1200, height: 630, alt: 'Rasid Referral Program' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Referral Program — Earn Rewards with Rasid',
        description: 'Refer businesses to Rasid and earn commissions, credits, or discounts. Up to 25% commission per referral!',
        images: ['/api/og?page=referral'],
    },
    alternates: {
        canonical: '/referral',
    },
};

export default async function ReferralProgramPage() {
    const user = await currentUser();
    const isLoggedIn = !!user;

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
            {/* Decorative */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-200/30 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="relative z-10 bg-white/60 backdrop-blur-md border-b border-border/40">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 rounded-lg overflow-hidden shadow-md shadow-violet-500/15 group-hover:scale-105 transition-transform">
                            <Image
                                src="/logos/Rasid_Logo.png"
                                alt="Rasid Logo"
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-foreground font-display">Rasid</span>
                    </Link>
                    {isLoggedIn ? (
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-full transition-all shadow-md shadow-violet-500/20 hover:shadow-lg"
                        >
                            Dashboard
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    ) : (
                        <Link
                            href="/sign-up?redirect_url=/referral"
                            className="flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-full transition-all shadow-md shadow-violet-500/20 hover:shadow-lg"
                        >
                            Get Started
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    )}
                </div>
            </header>

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 sm:py-24">
                {/* Hero */}
                <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-100/80 text-violet-700 text-xs font-bold rounded-full mb-6 uppercase tracking-wider border border-violet-200/50">
                        <Sparkles className="w-3.5 h-3.5" />
                        Referral Program
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground font-display tracking-tight leading-tight mb-6">
                        Share Rasid,{' '}
                        <span className="text-violet-600">
                            Earn Rewards
                        </span>
                    </h1>
                    <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                        Invite businesses to join Rasid and earn exclusive rewards for every successful referral.
                        It&apos;s simple, free, and rewarding.
                    </p>
                </div>

                {/* How it works */}
                <div className="mb-16 sm:mb-24">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground font-display mb-12">
                        How It Works
                    </h2>
                    <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
                        {[
                            {
                                step: '01',
                                icon: Gift,
                                title: 'Apply to Become a Referrer',
                                description: 'Sign in and submit an application. Once approved, you\'ll receive a unique referral code and access to your referrer portal.',
                                color: 'violet',
                            },
                            {
                                step: '02',
                                icon: Users,
                                title: 'Share & Invite',
                                description: 'Share your referral link via email, social media, or any channel. When someone signs up, you get credited.',
                                color: 'indigo',
                            },
                            {
                                step: '03',
                                icon: TrendingUp,
                                title: 'Earn Rewards',
                                description: 'Earn commissions, credits, or discounts for every successful referral. Rewards vary by plan tier.',
                                color: 'emerald',
                            },
                        ].map((item) => (
                            <div
                                key={item.step}
                                className="group relative bg-white/80 backdrop-blur-sm border border-border/60 rounded-2xl p-6 sm:p-8 shadow-xs hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="flex items-center justify-between mb-5">
                                    <span className="text-4xl font-bold text-muted-foreground/10 font-display">{item.step}</span>
                                    <div className={`p-3 rounded-xl ${item.color === 'violet' ? 'bg-violet-100 text-violet-600' :
                                        item.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' :
                                            'bg-emerald-100 text-emerald-600'
                                        }`}>
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-foreground font-display mb-2">{item.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Plan-based rewards */}
                <div className="bg-white/80 backdrop-blur-sm border border-border/60 rounded-3xl p-8 sm:p-12 shadow-xs mb-16 sm:mb-24">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground font-display mb-3">
                            Rewards by Plan
                        </h2>
                        <p className="text-muted-foreground text-sm">Higher your referred user&apos;s plan, higher your rewards</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b-2 border-violet-100">
                                    <th className="text-left px-4 py-3 font-bold text-foreground text-xs uppercase tracking-wider">Plan</th>
                                    <th className="text-center px-4 py-3 font-bold text-violet-600 text-xs uppercase tracking-wider">Commission</th>
                                    <th className="text-center px-4 py-3 font-bold text-emerald-600 text-xs uppercase tracking-wider">Credit</th>
                                    <th className="text-center px-4 py-3 font-bold text-blue-600 text-xs uppercase tracking-wider">Discount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(PLAN_REFERRAL_REWARDS).map(([plan, rewards]) => (
                                    <tr key={plan} className="border-b border-border/40 hover:bg-violet-50/30 transition-colors">
                                        <td className="px-4 py-3.5">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${plan === 'FREE' ? 'bg-gray-100 text-gray-600' :
                                                plan === 'BASIC' ? 'bg-blue-50 text-blue-600' :
                                                    plan === 'PRO' ? 'bg-violet-50 text-violet-600' :
                                                        plan === 'PREMIUM' ? 'bg-amber-50 text-amber-700' :
                                                            'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200'
                                                }`}>
                                                {plan === 'LIFETIME' && <Star className="w-3 h-3" />}
                                                {plan}
                                            </span>
                                        </td>
                                        <td className="text-center px-4 py-3.5 font-semibold text-foreground">{rewards.commission}</td>
                                        <td className="text-center px-4 py-3.5 font-semibold text-foreground">{rewards.credit}</td>
                                        <td className="text-center px-4 py-3.5 font-semibold text-foreground">{rewards.discount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Benefits */}
                <div className="mb-16 sm:mb-24">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground font-display mb-12">
                        Why Refer Rasid?
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
                        {[
                            'No limit on how many people you can refer',
                            'Rewards applied automatically to your account',
                            'Track your referral performance in real-time',
                            'Both you and your referral get rewarded',
                            'Referral codes never expire (unless set)',
                            'Easy sharing via link — no complex setup',
                        ].map((benefit) => (
                            <div key={benefit} className="flex items-center gap-3 p-4 bg-white/60 rounded-xl border border-border/40">
                                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                </div>
                                <span className="text-sm text-foreground/80">{benefit}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA / Application Section */}
                {isLoggedIn ? (
                    <ReferralApplicationForm
                        userId={user.id}
                        userName={user.fullName || user.firstName || 'User'}
                        userEmail={user.emailAddresses[0]?.emailAddress || ''}
                    />
                ) : (
                    <div className="text-center bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 rounded-3xl p-10 sm:p-16 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
                        <div className="relative">
                            <Star className="w-8 h-8 text-white/80 mx-auto mb-4" />
                            <h2 className="text-2xl sm:text-3xl font-bold text-white font-display mb-3">
                                Ready to Start Earning?
                            </h2>
                            <p className="text-violet-100 text-sm sm:text-base max-w-lg mx-auto mb-8">
                                Sign up for Rasid and apply to become a referrer. Start sharing and earn rewards with every successful referral.
                            </p>
                            <Link
                                href="/sign-up?redirect_url=/referral"
                                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-violet-700 text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                            >
                                Create Your Account
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
