'use client';

import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { AlertCircle, ArrowRight, Shield, Zap, LockKeyhole } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function SignInPage() {
    const { isLoaded, signIn, setActive } = useSignIn();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoaded) return;

        setLoading(true);
        setError('');

        try {
            const result = await signIn.create({
                identifier: email,
                password,
            });

            if (result.status === 'complete') {
                await setActive({ session: result.createdSessionId });
                router.push('/dashboard');
            } else {
                setError('Authentication failed. Please check your credentials.');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.errors?.[0]?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = () => {
        if (!isLoaded) return;
        signIn.authenticateWithRedirect({
            strategy: 'oauth_google',
            redirectUrl: '/sso-callback',
            redirectUrlComplete: '/dashboard',
        });
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Panel - Visual/Branding Side */}
            <div className="hidden lg:flex relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0">
                    {/* Gradient Orbs */}
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-20 -left-20 w-96 h-96 bg-blue-500/30 rounded-full blur-[100px]"
                    />
                    <motion.div
                        animate={{
                            scale: [1.2, 1, 1.2],
                            opacity: [0.4, 0.6, 0.4],
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-20 -right-20 w-[500px] h-[500px] bg-violet-500/25 rounded-full blur-[120px]"
                    />
                    <motion.div
                        animate={{
                            y: [0, -20, 0],
                            opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/20 rounded-full blur-[80px]"
                    />

                    {/* Grid Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center overflow-hidden p-1">
                            <Image
                                src="/logos/Rasid_Logo.png"
                                alt="Rasid Logo"
                                width={48}
                                height={48}
                                className="w-full h-full object-contain"
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
                                Welcome back to<br />
                                <span className="text-white">
                                    effortless billing.
                                </span>
                            </h1>
                            <p className="text-lg text-slate-400 max-w-md leading-relaxed">
                                Access your invoices, track payments, and manage your business—all from one powerful dashboard.
                            </p>
                        </motion.div>

                        {/* Feature Pills */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                            className="flex flex-wrap gap-3"
                        >
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300">
                                <Shield className="w-4 h-4 text-emerald-400" />
                                Bank-grade Security
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300">
                                <Zap className="w-4 h-4 text-yellow-400" />
                                AI-Powered
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300">
                                <LockKeyhole className="w-4 h-4 text-blue-400" />
                                Encrypted Data
                            </div>
                        </motion.div>
                    </div>

                    {/* Testimonial / Social Proof */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                        className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
                    >
                        <p className="text-slate-300 italic mb-4">
                            "Rasid transformed how we handle invoicing. What used to take hours now takes minutes."
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-semibold text-sm">
                                AM
                            </div>
                            <div>
                                <p className="text-white font-medium text-sm">Ahmed M.</p>
                                <p className="text-slate-500 text-xs">CEO, TechFlow Solutions</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Panel - Sign In Form */}
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
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
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
                        <h2 className="text-3xl font-bold font-display text-slate-900 tracking-tight">Sign in to your account</h2>
                        <p className="text-slate-500 mt-2">
                            Don't have an account?{' '}
                            <Link href="/sign-up" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                                Create one free
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

                    {/* Google Sign In */}
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 gap-3 font-medium bg-white hover:bg-slate-50 border border-neutral-900 text-slate-700 transition-all shadow-none"
                        onClick={handleGoogleSignIn}
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
                        <span className="text-xs uppercase text-slate-400 font-medium">or sign in with email</span>
                        <div className="h-px bg-slate-200 flex-1" />
                    </div>

                    {/* Email Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@company.com"
                            autoComplete="email"
                            className="h-12"
                        />

                        <div className="space-y-2">
                            <Input
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                autoComplete="current-password"
                                className="h-12"
                            />
                            <div className="flex justify-end">
                                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors">
                                    Forgot password?
                                </a>
                            </div>
                        </div>

                        <Button type="submit" loading={loading} className="w-full h-12 text-base font-semibold group bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-900 shadow-none" size="lg">
                            Sign in
                            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </form>

                    {/* Footer */}
                    <p className="text-xs text-center text-slate-400 pt-4">
                        By signing in, you agree to our{' '}
                        <a href="#" className="text-slate-600 hover:underline">Terms of Service</a>
                        {' '}and{' '}
                        <a href="#" className="text-slate-600 hover:underline">Privacy Policy</a>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
