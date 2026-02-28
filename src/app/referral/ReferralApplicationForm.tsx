'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    submitReferralApplication,
    getUserApplicationStatus,
    type UserApplicationStatus,
} from '@/app/actions/referrals';
import Link from 'next/link';
import {
    Send,
    Clock,
    CheckCircle2,
    XCircle,
    ExternalLink,
    Copy,
    Check,
    Loader2,
    Gift,
    ArrowRight,
} from 'lucide-react';

export function ReferralApplicationForm({
    userId,
    userName,
    userEmail,
}: {
    userId: string;
    userName: string;
    userEmail: string;
}) {
    const [appStatus, setAppStatus] = useState<UserApplicationStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedPortal, setCopiedPortal] = useState(false);

    const [reason, setReason] = useState('');
    const [preferredReward, setPreferredReward] = useState('commission');
    const [socialLinks, setSocialLinks] = useState('');

    const loadStatus = useCallback(async () => {
        try {
            const status = await getUserApplicationStatus(userId);
            setAppStatus(status);
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadStatus();
    }, [loadStatus]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess(false);

        const result = await submitReferralApplication(userId, userName, userEmail, {
            reason,
            preferredReward,
            socialLinks,
        });

        if (result.success) {
            setSuccess(true);
            loadStatus();
        } else {
            setError(result.error || 'Failed to submit application.');
        }
        setSubmitting(false);
    };

    const handleCopyCode = () => {
        if (!appStatus?.referralCode) return;
        const url = `${window.location.origin}/refer/${appStatus.referralCode}`;
        navigator.clipboard.writeText(url);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    const handleCopyPortal = () => {
        if (!appStatus?.portalToken) return;
        const url = `${window.location.origin}/referrer/${appStatus.portalToken}`;
        navigator.clipboard.writeText(url);
        setCopiedPortal(true);
        setTimeout(() => setCopiedPortal(false), 2000);
    };

    if (loading) {
        return (
            <div className="bg-white/80 backdrop-blur-sm border border-border/60 rounded-3xl p-12 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-violet-500 mx-auto" />
            </div>
        );
    }

    // ─── APPROVED STATE ───
    if (appStatus?.status === 'approved') {
        return (
            <div className="bg-gradient-to-br from-emerald-50 via-white to-violet-50 border border-emerald-200/60 rounded-3xl p-8 sm:p-12 shadow-xs">
                <div className="text-center max-w-lg mx-auto">
                    <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-emerald-100 flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground font-display mb-2">
                        You&apos;re a Referrer! 🎉
                    </h2>
                    <p className="text-sm text-muted-foreground mb-6">
                        {appStatus.adminNote || 'Your application has been approved. Start sharing your referral link!'}
                    </p>

                    {appStatus.referralCode && (
                        <div className="bg-white border border-border rounded-2xl p-5 mb-6 space-y-4">
                            <div>
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Your Referral Code</p>
                                <p className="text-2xl font-bold font-mono text-violet-600 tracking-widest">{appStatus.referralCode}</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <button
                                    onClick={handleCopyCode}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-violet-500/15"
                                >
                                    {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copiedCode ? 'Copied!' : 'Copy Referral Link'}
                                </button>
                                {appStatus.portalToken && (
                                    <Link
                                        href={`/referrer/${appStatus.portalToken}`}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-border text-foreground text-sm font-semibold rounded-xl hover:bg-muted transition-all"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Referrer Portal
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ─── PENDING STATE ───
    if (appStatus?.status === 'pending') {
        return (
            <div className="bg-gradient-to-br from-amber-50 via-white to-violet-50 border border-amber-200/60 rounded-3xl p-8 sm:p-12 shadow-xs">
                <div className="text-center max-w-lg mx-auto">
                    <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-amber-100 flex items-center justify-center">
                        <Clock className="w-8 h-8 text-amber-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground font-display mb-2">
                        Application Under Review
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        Your referral application is being reviewed by our team. We&apos;ll notify you once it&apos;s approved.
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100/60 text-amber-700 text-xs font-bold rounded-full border border-amber-200/50">
                        <Clock className="w-3.5 h-3.5" />
                        Pending Review
                    </div>
                </div>
            </div>
        );
    }

    // ─── REJECTED + FORM STATE ───
    return (
        <div className="bg-white/80 backdrop-blur-sm border border-border/60 rounded-3xl p-8 sm:p-12 shadow-xs">
            <div className="max-w-lg mx-auto">
                <div className="text-center mb-8">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-violet-100 flex items-center justify-center">
                        <Gift className="w-7 h-7 text-violet-600" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground font-display mb-2">
                        Apply to Become a Referrer
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Fill out the form below and our team will review your application.
                    </p>
                </div>

                {appStatus?.status === 'rejected' && (
                    <div className="bg-red-50 border border-red-200/60 rounded-xl p-4 mb-6 flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-red-700">Previous application was not approved</p>
                            {appStatus.adminNote && (
                                <p className="text-xs text-red-600 mt-1">{appStatus.adminNote}</p>
                            )}
                            <p className="text-xs text-red-500 mt-1">You can reapply below.</p>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="bg-emerald-50 border border-emerald-200/60 rounded-xl p-4 mb-6 flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-emerald-700">Application submitted!</p>
                            <p className="text-xs text-emerald-600 mt-1">Our team will review your application shortly.</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
                        {error}
                    </div>
                )}

                {!success && (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Pre-filled info */}
                        <div className="bg-muted/30 rounded-xl p-4 border border-border/40">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Your Details</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-sm">
                                    {userName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">{userName}</p>
                                    <p className="text-xs text-muted-foreground">{userEmail}</p>
                                </div>
                            </div>
                        </div>

                        {/* Preferred Reward */}
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-2">
                                Preferred Reward Type
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { value: 'commission', label: 'Commission', emoji: '💰', desc: 'Per-referral %' },
                                    { value: 'credit', label: 'Credit', emoji: '💳', desc: 'Account credit' },
                                    { value: 'discount', label: 'Discount', emoji: '🏷️', desc: '% off plans' },
                                ].map((opt) => {
                                    const isSelected = preferredReward === opt.value;
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setPreferredReward(opt.value)}
                                            className={`relative flex flex-col items-center gap-1.5 p-3.5 rounded-xl text-center transition-all duration-200 cursor-pointer ${isSelected
                                                ? 'bg-gradient-to-br from-violet-50 to-indigo-50 scale-[1.04] shadow-lg shadow-violet-500/20 ring-2 ring-violet-500/40'
                                                : 'bg-white hover:bg-muted/30 opacity-60 hover:opacity-90 shadow-sm'
                                                }`}
                                        >
                                            {/* Checkmark badge */}
                                            {isSelected && (
                                                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-violet-600 rounded-full flex items-center justify-center shadow-md shadow-violet-500/30">
                                                    <Check className="w-3 h-3 text-white" />
                                                </span>
                                            )}
                                            <span className={`text-2xl transition-transform duration-200 ${isSelected ? 'scale-110' : ''}`}>{opt.emoji}</span>
                                            <span className={`text-xs font-bold transition-colors ${isSelected ? 'text-violet-700' : 'text-muted-foreground'}`}>
                                                {opt.label}
                                            </span>
                                            <span className={`text-[10px] transition-colors ${isSelected ? 'text-violet-500/70' : 'text-muted-foreground/50'}`}>{opt.desc}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Reason */}
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                                Why do you want to become a referrer? <span className="text-muted-foreground/50">(optional)</span>
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Tell us about your audience, network, or how you plan to promote Rasid..."
                                rows={3}
                                className="w-full px-3.5 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all resize-none"
                            />
                        </div>

                        {/* Social Links */}
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                                Social or Website Links <span className="text-muted-foreground/50">(optional)</span>
                            </label>
                            <input
                                type="text"
                                value={socialLinks}
                                onChange={(e) => setSocialLinks(e.target.value)}
                                placeholder="https://twitter.com/you, https://yoursite.com"
                                className="w-full px-3.5 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-violet-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:shadow-xl hover:-translate-y-0.5"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Submit Application
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
