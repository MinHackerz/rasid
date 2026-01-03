'use client';

import { useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { AlertCircle, ArrowRight, CheckCircle2, Sparkles, Star, Users, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function SignUpPage() {
    const { isLoaded, signUp, setActive } = useSignUp();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Verification state
    const [verifying, setVerifying] = useState(false);
    const [code, setCode] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoaded) return;

        setLoading(true);
        setError('');

        try {
            await signUp.create({
                emailAddress: email,
                password,
            });

            // Prepare for email verification
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            setVerifying(true);
        } catch (err: any) {
            console.error('Signup error:', err);
            setError(err.errors?.[0]?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoaded) return;

        setLoading(true);
        setError('');

        try {
            // Check if already verified/complete
            if (signUp.status === 'complete') {
                if (signUp.createdSessionId) {
                    await setActive({ session: signUp.createdSessionId });
                }
                router.push('/onboarding');
                return;
            }

            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code,
            });

            if (completeSignUp.status === 'complete') {
                await setActive({ session: completeSignUp.createdSessionId });
                router.push('/onboarding');
            } else {
                setError('Verification failed. Use a new code?');
            }
        } catch (err: any) {
            console.error('Verification Error:', err);
            const errorMessage = err.errors?.[0]?.message || '';

            // Handle "already verified" case - proceed to complete signup
            if (errorMessage.toLowerCase().includes('already been verified') ||
                errorMessage.toLowerCase().includes('already verified')) {
                if (signUp.createdSessionId) {
                    await setActive({ session: signUp.createdSessionId });
                    router.push('/onboarding');
                    return;
                }
                // If no session yet, redirect to sign-in
                router.push('/sign-in');
                return;
            }

            setError(errorMessage || 'Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = () => {
        if (!isLoaded) return;
        signUp.authenticateWithRedirect({
            strategy: 'oauth_google',
            redirectUrl: '/sso-callback',
            redirectUrlComplete: '/onboarding',
        });
    };

    // Verification Screen
    if (verifying) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-white to-blue-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md space-y-8 p-8 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50"
                >
                    {/* Verification Icon */}
                    <div className="text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: 0.2 }}
                            className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center mx-auto mb-6"
                        >
                            <Sparkles className="w-10 h-10 text-white" />
                        </motion.div>
                        <h2 className="text-2xl font-bold font-display text-slate-900">Check your inbox</h2>
                        <p className="text-slate-500 mt-2">
                            We sent a 6-digit code to{' '}
                            <span className="font-semibold text-slate-700">{email}</span>
                        </p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-3"
                        >
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleVerification} className="space-y-5">
                        <Input
                            label="Verification Code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="123456"
                            required
                            className="h-14 text-center text-2xl tracking-[0.5em] font-mono"
                        />

                        <Button type="submit" loading={loading} className="w-full h-12 text-base font-semibold" size="lg">
                            Verify & Continue
                        </Button>

                        <p className="text-center text-sm text-slate-500">
                            Didn't receive code?{' '}
                            <button type="button" className="font-semibold text-blue-600 hover:text-blue-500">
                                Resend
                            </button>
                        </p>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Panel - Visual/Branding Side */}
            <div className="hidden lg:flex relative bg-gradient-to-br from-blue-600 via-violet-600 to-purple-700 overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0">
                    {/* Floating Shapes */}
                    <motion.div
                        animate={{
                            y: [0, -30, 0],
                            rotate: [0, 10, 0],
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-32 left-20 w-32 h-32 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20"
                    />
                    <motion.div
                        animate={{
                            y: [0, 20, 0],
                            rotate: [0, -5, 0],
                        }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-48 right-32 w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20"
                    />
                    <motion.div
                        animate={{
                            y: [0, -15, 0],
                            x: [0, 10, 0],
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-40 left-40 w-40 h-40 rounded-full bg-white/5 backdrop-blur-sm border border-white/10"
                    />

                    {/* Gradient Orbs */}
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-yellow-400/20 rounded-full blur-[150px]" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-500/20 rounded-full blur-[120px]" />

                    {/* Grid Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden">
                            <Image
                                src="/logos/Rasid_Logo.png"
                                alt="Rasid Logo"
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="text-2xl font-bold text-white font-display tracking-tight">Rasid</span>
                    </Link>

                    {/* Main Message */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                        >
                            <h1 className="text-4xl lg:text-5xl font-bold text-white font-display leading-tight mb-6">
                                Start your journey to<br />
                                <span className="text-yellow-300">
                                    smarter invoicing.
                                </span>
                            </h1>
                            <p className="text-lg text-white/80 max-w-md leading-relaxed">
                                Join thousands of businesses transforming their billing operations with AI-powered automation.
                            </p>
                        </motion.div>

                        {/* Benefits List */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                            className="space-y-4"
                        >
                            {[
                                "AI extracts data from any bill in seconds",
                                "Cryptographic signatures ensure trust",
                                "Real-time analytics & insights",
                                "No credit card required"
                            ].map((benefit, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
                                    className="flex items-center gap-3 text-white/90"
                                >
                                    <CheckCircle2 className="w-5 h-5 text-yellow-300 flex-shrink-0" />
                                    <span>{benefit}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Stats Row */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                        className="grid grid-cols-3 gap-4"
                    >
                        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Users className="w-4 h-4 text-yellow-300" />
                            </div>
                            <p className="text-2xl font-bold text-white">10K+</p>
                            <p className="text-xs text-white/60">Active Users</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Star className="w-4 h-4 text-yellow-300" />
                            </div>
                            <p className="text-2xl font-bold text-white">4.9/5</p>
                            <p className="text-xs text-white/60">User Rating</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <TrendingUp className="w-4 h-4 text-yellow-300" />
                            </div>
                            <p className="text-2xl font-bold text-white">50M+</p>
                            <p className="text-xs text-white/60">Invoices Processed</p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Panel - Sign Up Form */}
            <div className="flex items-center justify-center p-6 sm:p-12 bg-white relative">
                {/* Subtle Background Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000002_1px,transparent_1px),linear-gradient(to_bottom,#00000002_1px,transparent_1px)] bg-[size:32px_32px]" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-md space-y-8 relative z-10"
                >
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl overflow-hidden">
                                <Image
                                    src="/logos/Rasid_Logo.png"
                                    alt="Rasid Logo"
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span className="text-xl font-bold font-display">Rasid</span>
                        </Link>
                    </div>

                    <div id="clerk-captcha"></div>

                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold font-display text-slate-900 tracking-tight">Create your free account</h2>
                        <p className="text-slate-500 mt-2">
                            Already have an account?{' '}
                            <Link href="/sign-in" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-3"
                        >
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    {/* Google Sign Up */}
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 gap-3 font-medium bg-white hover:bg-slate-50 border border-neutral-900 text-slate-700 transition-all shadow-none"
                        onClick={handleGoogleSignUp}
                        loading={!isLoaded}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26-1.19-.58z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Continue with Google
                    </Button>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-8">
                        <div className="h-px bg-slate-200 flex-1" />
                        <span className="text-xs uppercase text-slate-400 font-medium">or sign up with email</span>
                        <div className="h-px bg-slate-200 flex-1" />
                    </div>

                    {/* Email Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Work Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@company.com"
                            autoComplete="email"
                            className="h-12"
                        />

                        <Input
                            label="Create Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            autoComplete="new-password"
                            className="h-12"
                            hint="Minimum 8 characters"
                        />

                        <Button type="submit" loading={loading} className="w-full h-12 text-base font-semibold group bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-900 shadow-none" size="lg">
                            Create Free Account
                            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </form>

                    {/* Footer */}
                    <p className="text-xs text-center text-slate-400 pt-4">
                        By creating an account, you agree to our{' '}
                        <a href="#" className="text-slate-600 hover:underline">Terms of Service</a>
                        {' '}and{' '}
                        <a href="#" className="text-slate-600 hover:underline">Privacy Policy</a>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
