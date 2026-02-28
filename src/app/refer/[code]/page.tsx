import { getPublicReferral, trackReferralClick } from '@/app/actions/referrals';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Gift, ArrowRight, Sparkles, Shield, Check } from 'lucide-react';

export default async function ReferralPage({ params }: { params: { code: string } }) {
    const { code } = await params;
    const referral = await getPublicReferral(code);

    if (!referral) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex items-center justify-center p-4">
                <div className="bg-white border border-border rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-50 flex items-center justify-center">
                        <Shield className="w-8 h-8 text-red-400" />
                    </div>
                    <h1 className="text-xl font-bold text-foreground font-display mb-2">Invalid Referral</h1>
                    <p className="text-sm text-muted-foreground mb-6">
                        This referral code is invalid, expired, or has reached its maximum usage.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-violet-500/20"
                    >
                        Go to Homepage
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        );
    }

    // Track the click server-side
    await trackReferralClick(code);

    const rewardLabel =
        referral.rewardType === 'discount'
            ? 'Discount'
            : referral.rewardType === 'credit'
                ? 'Account Credit'
                : 'Commission';

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
            {/* Decorative blurs */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-200/40 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200/40 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 py-12 sm:py-20">
                {/* Logo */}
                <div className="flex items-center gap-2.5 mb-8">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-violet-500/20">
                        <Image
                            src="/logos/Rasid_Logo.png"
                            alt="Rasid Logo"
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-foreground font-display">Rasid</span>
                </div>

                {/* Main card */}
                <div className="bg-white/80 backdrop-blur-xl border border-border/60 rounded-3xl shadow-2xl shadow-violet-500/5 w-full max-w-lg overflow-hidden">
                    {/* Gradient header */}
                    <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 px-6 py-8 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
                        <div className="relative">
                            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                                <Gift className="w-7 h-7 text-white" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white font-display tracking-tight">
                                You&apos;ve Been Invited!
                            </h1>
                            <p className="text-violet-100 text-sm mt-2">
                                <span className="font-semibold text-white">{referral.referrerName}</span> has
                                invited you to join Rasid
                            </p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-8 space-y-6">
                        {/* Reward badge */}
                        {referral.rewardValue && (
                            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/60 rounded-2xl px-5 py-4 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                                    <Sparkles className="w-6 h-6 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">{rewardLabel}</p>
                                    <p className="text-2xl font-bold text-amber-900 font-display">{referral.rewardValue}</p>
                                </div>
                            </div>
                        )}

                        {referral.description && (
                            <p className="text-sm text-muted-foreground leading-relaxed">{referral.description}</p>
                        )}

                        {/* Benefits */}
                        <div className="space-y-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">What you get</p>
                            {['Free invoicing to get started', 'Automated payment reminders', 'Professional PDF templates', 'API access for integration'].map((item) => (
                                <div key={item} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                        <Check className="w-3 h-3 text-emerald-600" />
                                    </div>
                                    <span className="text-sm text-foreground/80">{item}</span>
                                </div>
                            ))}
                        </div>

                        {/* CTA */}
                        <div className="space-y-3 pt-2">
                            <Link
                                href={`/sign-up?ref=${referral.code}&redirect_url=${encodeURIComponent('/refer/' + referral.code)}`}
                                className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5"
                            >
                                Get Started Free
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <p className="text-center text-[11px] text-muted-foreground">
                                No credit card required · Free plan available
                            </p>
                        </div>
                    </div>
                </div>

                {/* Referral code badge */}
                <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Referral code:</span>
                    <span className="font-mono font-bold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-lg border border-violet-200/60">
                        {referral.code}
                    </span>
                </div>
            </div>
        </div>
    );
}
