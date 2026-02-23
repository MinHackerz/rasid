'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, QrCode, FileText, Check, Send, Smartphone, ArrowRight, Package, Search, TrendingUp, DollarSign, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FeaturesSection() {
    return (
        <section id="features" className="py-24 bg-neutral-50/50 overflow-hidden">
            <div className="container-app">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold mb-5 border border-emerald-100">
                            Built for Trust
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold font-display mb-6 text-neutral-900">
                            Features that make every<br className="hidden md:block" /> invoice bulletproof
                        </h2>
                        <p className="text-xl text-neutral-500 max-w-2xl mx-auto">
                            From cryptographic verification to instant sharing — everything you need to bill with confidence.
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-6 max-w-7xl mx-auto">
                    {/* Feature 1: QR Verification - HERO (Large Card - Left) */}
                    <div className="md:col-span-4 min-h-[420px]">
                        <FeatureCard
                            title="Cryptographic QR Verification"
                            description="Every invoice is sealed with a unique QR code. Your customer scans it — no app needed — and instantly sees a verified proof page confirming the invoice is authentic and untampered."
                            className="h-full bg-neutral-900 text-white flex flex-col md:flex-row"
                            descriptionClassName="text-neutral-400"
                            headerClassName="md:w-[45%] z-20"
                        >
                            <div className="relative w-full md:w-[55%] h-72 md:h-full border-t md:border-t-0 md:border-l border-white/10 overflow-hidden flex items-center justify-center">
                                <QRVerificationAnimation />
                            </div>
                        </FeatureCard>
                    </div>

                    {/* Feature 2: Instant Share (Tall Card - Right) */}
                    <div className="md:col-span-2 min-h-[420px]">
                        <FeatureCard
                            title="One-Tap Sharing"
                            description="Send verified invoices via WhatsApp or email in a single click."
                            className="h-full bg-white flex flex-col"
                        >
                            <div className="flex-1 relative w-full h-full flex items-center justify-center pb-8 overflow-hidden">
                                <ShareAnimation />
                            </div>
                        </FeatureCard>
                    </div>

                    {/* Feature 3: AI Extraction (Medium Card - Left) */}
                    <div className="md:col-span-3 min-h-[380px]">
                        <FeatureCard
                            title="AI-Powered Digitization"
                            description="Upload a photo of any handwritten bill — our AI extracts all details into a clean digital invoice."
                            className="h-full bg-white flex flex-col"
                        >
                            <div className="relative w-full h-full min-h-[240px] overflow-hidden px-6 pb-6 mt-2">
                                <div className="absolute inset-x-6 bottom-6 top-0 rounded-xl border border-neutral-200 shadow-sm overflow-hidden bg-neutral-50/50">
                                    <TransformationAnimation />
                                </div>
                            </div>
                        </FeatureCard>
                    </div>

                    {/* Feature 4: Templates (Medium Card - Right) */}
                    <div className="md:col-span-3 min-h-[380px]">
                        <FeatureCard
                            title="10+ Professional Templates"
                            description="Pick a template that matches your brand — minimal, modern, or classic."
                            className="h-full bg-white flex flex-col overflow-hidden"
                        >
                            <div className="relative flex-1 w-full overflow-hidden px-6 pb-6 mt-2">
                                <TemplatesAnimation />
                            </div>
                        </FeatureCard>
                    </div>

                    {/* Feature 5: Dashboard + Inventory (Full Width) */}
                    <div className="md:col-span-6 min-h-[350px]">
                        <FeatureCard
                            title="Full Business Control"
                            description="Live revenue tracking, smart inventory management, and customer insights — all in one dashboard."
                            className="h-full bg-neutral-900 text-white flex flex-col md:flex-row overflow-hidden"
                            descriptionClassName="text-neutral-400"
                            headerClassName="md:w-[35%] z-20"
                        >
                            <div className="relative w-full md:w-[65%] h-72 md:h-full flex items-center justify-center p-6 border-t md:border-t-0 md:border-l border-white/10">
                                <DashboardAnimation />
                            </div>
                        </FeatureCard>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ============================================
// Feature Card Wrapper
// ============================================
function FeatureCard({
    title,
    description,
    children,
    className,
    headerClassName,
    descriptionClassName
}: {
    title: string;
    description: string;
    children?: React.ReactNode;
    className?: string;
    headerClassName?: string;
    descriptionClassName?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={cn(
                "relative rounded-3xl border border-neutral-200 overflow-hidden group transition-all duration-500",
                className
            )}
        >
            <div className={cn("relative p-8 flex flex-col pointer-events-none", headerClassName)}>
                <h3 className="text-2xl font-bold font-display mb-3 tracking-tight">{title}</h3>
                <p className={cn("text-[0.95rem] text-neutral-500 leading-relaxed", descriptionClassName)}>
                    {description}
                </p>
            </div>
            {children}
        </motion.div>
    );
}

// ============================================
// 1. QR Verification Animation (HERO)
//    Shows: Invoice → QR Scan → Verified Page
// ============================================
function QRVerificationAnimation() {
    const [phase, setPhase] = useState<'invoice' | 'scanning' | 'verified'>('invoice');

    useEffect(() => {
        const cycle = () => {
            setPhase('invoice');
            const t1 = setTimeout(() => setPhase('scanning'), 2000);
            const t2 = setTimeout(() => setPhase('verified'), 3500);
            const t3 = setTimeout(() => setPhase('invoice'), 6500);
            return [t1, t2, t3];
        };

        let timers = cycle();
        const interval = setInterval(() => {
            timers = cycle();
        }, 6500);

        return () => {
            clearInterval(interval);
            timers.forEach(clearTimeout);
        };
    }, []);

    return (
        <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Ambient glow */}
            <div className="absolute w-48 h-48 bg-emerald-500/10 blur-[60px] rounded-full" />

            <div className="relative flex items-center gap-4 md:gap-6 z-10">
                {/* Invoice Card (left side) */}
                <motion.div
                    className="relative w-36 md:w-44"
                    animate={{
                        scale: phase === 'scanning' ? 0.95 : 1,
                        opacity: phase === 'verified' ? 0.5 : 1,
                    }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="bg-white rounded-xl p-4 shadow-2xl border border-white/10">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-5 h-5 bg-neutral-900 rounded flex items-center justify-center">
                                <span className="text-[8px] font-bold text-white">R</span>
                            </div>
                            <span className="text-[9px] font-bold text-neutral-900 uppercase tracking-wider">Invoice</span>
                            <span className="ml-auto text-[8px] text-neutral-400 font-mono">#INV-247</span>
                        </div>
                        <div className="space-y-2 mb-3">
                            <div className="flex justify-between items-center p-1.5 bg-neutral-50 rounded text-[9px]">
                                <span className="text-neutral-600">Design Service</span>
                                <span className="font-bold text-neutral-900">$500</span>
                            </div>
                            <div className="flex justify-between items-center p-1.5 bg-neutral-50 rounded text-[9px]">
                                <span className="text-neutral-600">Hosting</span>
                                <span className="font-bold text-neutral-900">$120</span>
                            </div>
                        </div>
                        <div className="border-t border-neutral-100 pt-2 flex justify-between items-center">
                            <span className="text-[8px] font-bold text-neutral-400 uppercase">Total</span>
                            <span className="text-sm font-bold text-neutral-900">$620</span>
                        </div>
                        {/* QR Code on invoice */}
                        <motion.div
                            className="mt-3 mx-auto w-16 h-16 bg-neutral-50 rounded-lg border-2 border-emerald-500/50 flex items-center justify-center"
                            animate={{
                                borderColor: phase === 'scanning'
                                    ? ['rgba(16,185,129,0.5)', 'rgba(16,185,129,1)', 'rgba(16,185,129,0.5)']
                                    : 'rgba(16,185,129,0.5)',
                            }}
                            transition={{ duration: 1, repeat: phase === 'scanning' ? Infinity : 0 }}
                        >
                            <QrCode className="w-10 h-10 text-neutral-800" />
                        </motion.div>
                    </div>
                </motion.div>

                {/* Arrow / Scan indicator */}
                <div className="flex flex-col items-center gap-2">
                    <motion.div
                        animate={{
                            opacity: phase === 'scanning' ? [0.4, 1, 0.4] : 0.3,
                            scale: phase === 'scanning' ? [1, 1.1, 1] : 1,
                        }}
                        transition={{ duration: 1.2, repeat: phase === 'scanning' ? Infinity : 0 }}
                    >
                        <Smartphone className="w-5 h-5 text-emerald-400" />
                    </motion.div>
                    <motion.div
                        className="flex flex-col gap-0.5"
                        animate={{ opacity: phase === 'scanning' ? 1 : 0.3 }}
                    >
                        {[0, 1, 2].map(i => (
                            <motion.div
                                key={i}
                                className="w-1 h-1 rounded-full bg-emerald-400"
                                animate={{
                                    opacity: phase === 'scanning' ? [0.3, 1, 0.3] : 0.3,
                                }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                            />
                        ))}
                    </motion.div>
                </div>

                {/* Verification Result (right side) */}
                <motion.div
                    className="relative w-36 md:w-44"
                    animate={{
                        opacity: phase === 'verified' ? 1 : 0.3,
                        scale: phase === 'verified' ? 1 : 0.95,
                        y: phase === 'verified' ? 0 : 5,
                    }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                    <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-4 shadow-2xl border border-emerald-500/30">
                        {/* Verified badge */}
                        <motion.div
                            className="flex items-center gap-2 mb-4"
                            animate={{
                                scale: phase === 'verified' ? [1, 1.05, 1] : 1,
                            }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-white">VERIFIED</div>
                                <div className="text-[9px] text-emerald-200">Authentic Invoice</div>
                            </div>
                        </motion.div>

                        <div className="space-y-2 text-[9px]">
                            <div className="flex justify-between text-emerald-100">
                                <span>Issuer</span>
                                <span className="font-semibold text-white">Rasid Inc.</span>
                            </div>
                            <div className="flex justify-between text-emerald-100">
                                <span>Amount</span>
                                <span className="font-semibold text-white">$620.00</span>
                            </div>
                            <div className="flex justify-between text-emerald-100">
                                <span>Date</span>
                                <span className="font-semibold text-white">Feb 22, 2026</span>
                            </div>
                            <div className="flex justify-between text-emerald-100">
                                <span>Status</span>
                                <span className="font-semibold text-white flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Untampered
                                </span>
                            </div>
                        </div>

                        {/* Checkmark pulse */}
                        <AnimatePresence>
                            {phase === 'verified' && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    className="absolute -top-2 -right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg"
                                >
                                    <Check className="w-4 h-4 text-emerald-600" strokeWidth={3} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>

            {/* Phase label */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={phase}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-[10px] font-semibold text-neutral-500 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm"
                    >
                        {phase === 'invoice' && '📄 Invoice with QR ready'}
                        {phase === 'scanning' && '📱 Customer scanning QR...'}
                        {phase === 'verified' && '✅ Verified as authentic!'}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

// ============================================
// 2. Share Animation (WhatsApp / Email)
// ============================================
function ShareAnimation() {
    const [sending, setSending] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setSending(true);
            setTimeout(() => setSending(false), 2000);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const channels = [
        { name: 'WhatsApp', color: 'bg-emerald-500', icon: '💬' },
        { name: 'Email', color: 'bg-blue-500', icon: '📧' },
    ];

    return (
        <div className="relative w-full flex flex-col items-center gap-4 px-6">
            {/* Mini Invoice Preview */}
            <motion.div
                className="w-32 h-24 bg-neutral-50 rounded-xl border border-neutral-200 p-3 shadow-sm"
                animate={{ y: sending ? -5 : 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-4 h-4 bg-neutral-900 rounded flex items-center justify-center">
                        <span className="text-[6px] font-bold text-white">R</span>
                    </div>
                    <div className="w-12 h-1.5 bg-neutral-200 rounded-full" />
                </div>
                <div className="space-y-1.5">
                    <div className="w-full h-1.5 bg-neutral-100 rounded-full" />
                    <div className="w-3/4 h-1.5 bg-neutral-100 rounded-full" />
                    <div className="flex justify-between items-center pt-1">
                        <div className="w-6 h-6 bg-neutral-100 rounded border border-neutral-200 flex items-center justify-center">
                            <QrCode className="w-4 h-4 text-neutral-400" />
                        </div>
                        <div className="w-10 h-2 bg-neutral-900 rounded-full" />
                    </div>
                </div>
            </motion.div>

            {/* Send Arrow */}
            <AnimatePresence>
                {sending && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                    >
                        <Send className="w-5 h-5 text-neutral-400" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Channels */}
            <div className="flex gap-3 w-full justify-center">
                {channels.map((ch, i) => (
                    <motion.div
                        key={i}
                        className="flex items-center gap-2 px-4 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200 shadow-sm"
                        animate={{
                            scale: sending ? [1, 1.05, 1] : 1,
                            borderColor: sending ? ['rgb(229 231 235)', 'rgb(16 185 129)', 'rgb(229 231 235)'] : 'rgb(229 231 235)',
                        }}
                        transition={{ duration: 0.6, delay: i * 0.15 }}
                    >
                        <span className="text-sm">{ch.icon}</span>
                        <span className="text-[11px] font-semibold text-neutral-700">{ch.name}</span>
                        {sending && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center"
                            >
                                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                            </motion.div>
                        )}
                    </motion.div>
                ))}
            </div>
            <p className="text-[10px] text-neutral-400 font-medium">Delivered with verification QR intact</p>
        </div>
    );
}

// ============================================
// 3. AI Transformation Animation (Photo → Digital)
// ============================================
function TransformationAnimation() {
    return (
        <div className="w-full h-full flex items-stretch relative select-none">
            {/* Left: "Photo" of messy bill */}
            <div className="w-1/2 bg-amber-50/60 p-4 flex flex-col border-r border-neutral-100 relative">
                <div className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-2">📷 Uploaded Photo</div>
                <div className="flex-1 bg-[#fdfbf6] rounded-lg border border-amber-200/60 p-3 relative">
                    <div className="font-serif text-sm mb-3 text-neutral-700 rotate-[-1deg] font-bold" style={{ fontFamily: 'Times New Roman, serif' }}>
                        Invoice #001
                    </div>
                    <div className="space-y-3 text-[10px]">
                        <div className="flex justify-between border-b border-neutral-300/50 border-dashed pb-1 rotate-[0.5deg]">
                            <span className="italic text-neutral-600">Design Work</span>
                            <span className="font-bold text-neutral-800">$500</span>
                        </div>
                        <div className="flex justify-between border-b border-neutral-300/50 border-dashed pb-1 rotate-[-0.5deg]">
                            <span className="italic text-neutral-600">Hosting</span>
                            <span className="font-bold text-neutral-800">$120</span>
                        </div>
                        <div className="text-right text-sm font-bold text-red-800 rotate-[-1deg] mt-4">
                            $620
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Clean Digital Output */}
            <div className="w-1/2 bg-white p-4 flex flex-col">
                <div className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider mb-2">✨ AI Output</div>
                <div className="flex-1 flex flex-col">
                    <div className="space-y-2 flex-1">
                        {[
                            { label: 'Design Services', value: '$500.00', delay: 0.3 },
                            { label: 'Hosting Fee', value: '$120.00', delay: 0.6 },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: item.delay, duration: 0.4 }}
                                className="flex justify-between items-center p-2 bg-neutral-50 rounded-lg border border-neutral-100 text-[10px]"
                            >
                                <span className="font-medium text-neutral-700">{item.label}</span>
                                <span className="font-bold text-neutral-900">{item.value}</span>
                            </motion.div>
                        ))}
                    </div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.9 }}
                        className="mt-auto pt-2 border-t border-neutral-100 flex justify-between items-center text-[10px]"
                    >
                        <span className="font-bold text-neutral-400 uppercase text-[8px]">Total</span>
                        <span className="font-bold text-neutral-900 text-sm">$620.00</span>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 1.2 }}
                        className="mt-2 flex items-center gap-1.5 text-[9px] text-emerald-600 font-semibold"
                    >
                        <Check className="w-3 h-3" />
                        QR seal applied
                    </motion.div>
                </div>
            </div>

            {/* Scanning beam (sweeps across the photo side) */}
            <motion.div
                className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-30 pointer-events-none"
                style={{ filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.5))' }}
                animate={{ left: ['0%', '50%', '50%', '0%'], opacity: [1, 1, 0, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", times: [0, 0.35, 0.4, 1] }}
            >
                <div className="absolute top-0 bottom-0 -left-8 w-16 bg-gradient-to-r from-blue-500/5 to-transparent" />
            </motion.div>
        </div>
    );
}

// ============================================
// 4. Templates Animation (stacked cards)
// ============================================
function TemplatesAnimation() {
    const [activeIndex, setActiveIndex] = useState(0);
    const templates = [
        { name: 'Modern', accent: '#1e293b', bg: 'bg-white' },
        { name: 'Minimal', accent: '#6366f1', bg: 'bg-white' },
        { name: 'Classic', accent: '#059669', bg: 'bg-white' },
        { name: 'Bold', accent: '#dc2626', bg: 'bg-white' },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % templates.length);
        }, 2500);
        return () => clearInterval(interval);
    }, [templates.length]);

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative w-48 h-56">
                {templates.map((template, i) => {
                    const isActive = i === activeIndex;
                    const offset = ((i - activeIndex + templates.length) % templates.length);

                    return (
                        <motion.div
                            key={i}
                            className="absolute inset-0 bg-white rounded-xl border border-neutral-200 shadow-lg p-4 flex flex-col"
                            animate={{
                                scale: 1 - offset * 0.05,
                                y: offset * 8,
                                x: offset * 4,
                                zIndex: templates.length - offset,
                                opacity: offset > 2 ? 0 : 1 - offset * 0.15,
                            }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                        >
                            {/* Template header bar */}
                            <div className="flex items-center gap-2 mb-3">
                                <div
                                    className="w-5 h-5 rounded flex items-center justify-center"
                                    style={{ backgroundColor: template.accent }}
                                >
                                    <span className="text-[7px] font-bold text-white">R</span>
                                </div>
                                <div className="flex-1">
                                    <div className="h-1.5 rounded-full" style={{ backgroundColor: template.accent, width: '60%', opacity: 0.3 }} />
                                </div>
                                <div className="text-[7px] font-bold text-neutral-400">{template.name}</div>
                            </div>

                            {/* Mock content lines */}
                            <div className="space-y-2 flex-1">
                                <div className="h-1.5 bg-neutral-100 rounded-full w-full" />
                                <div className="h-1.5 bg-neutral-100 rounded-full w-4/5" />
                                <div className="mt-3 space-y-1.5">
                                    <div className="flex justify-between">
                                        <div className="h-1.5 bg-neutral-100 rounded-full w-20" />
                                        <div className="h-1.5 bg-neutral-100 rounded-full w-8" />
                                    </div>
                                    <div className="flex justify-between">
                                        <div className="h-1.5 bg-neutral-100 rounded-full w-16" />
                                        <div className="h-1.5 bg-neutral-100 rounded-full w-8" />
                                    </div>
                                </div>
                            </div>

                            {/* Bottom with accent color bar */}
                            <div className="mt-auto pt-3 border-t border-neutral-100 flex justify-between items-center">
                                <div className="w-8 h-8 rounded border border-neutral-200 flex items-center justify-center">
                                    <QrCode className="w-5 h-5 text-neutral-300" />
                                </div>
                                <div
                                    className="h-2 rounded-full w-14"
                                    style={{ backgroundColor: template.accent }}
                                />
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Template indicator dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {templates.map((_, i) => (
                    <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        animate={{
                            backgroundColor: i === activeIndex ? '#1e293b' : '#d4d4d8',
                            scale: i === activeIndex ? 1.3 : 1,
                        }}
                        transition={{ duration: 0.3 }}
                    />
                ))}
            </div>
        </div>
    );
}

// ============================================
// 5. Dashboard Animation (Revenue + Inventory)
// ============================================
function DashboardAnimation() {
    const [revenue, setRevenue] = useState(24580);

    useEffect(() => {
        const interval = setInterval(() => {
            setRevenue(c => c + Math.floor(Math.random() * 300) + 50);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    const barData = [35, 52, 40, 68, 55, 75, 62, 80];

    const inventory = [
        { name: 'Web Design', qty: 12, trend: 'up' },
        { name: 'Hosting', qty: 48, trend: 'up' },
        { name: 'SEO Audit', qty: 5, trend: 'down' },
    ];

    return (
        <div className="w-full h-full flex gap-4">
            {/* Revenue Panel */}
            <div className="flex-1 bg-neutral-800/50 rounded-xl border border-white/10 p-4 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                    <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Revenue</div>
                    <div className="flex items-center gap-1 text-[9px] font-semibold text-emerald-400">
                        <TrendingUp className="w-3 h-3" /> +18%
                    </div>
                </div>
                <div className="text-xl font-bold text-white tracking-tight mb-4">
                    ${revenue.toLocaleString()}
                </div>

                {/* Bar Chart */}
                <div className="flex-1 flex items-end gap-1.5">
                    {barData.map((height, i) => (
                        <motion.div
                            key={i}
                            className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-sm"
                            initial={{ height: 0 }}
                            whileInView={{ height: `${height}%` }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.6, ease: 'easeOut' }}
                        />
                    ))}
                </div>
            </div>

            {/* Inventory Panel */}
            <div className="w-40 md:w-48 bg-neutral-800/50 rounded-xl border border-white/10 p-4 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                    <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Inventory</div>
                    <Package className="w-3.5 h-3.5 text-neutral-500" />
                </div>

                <div className="space-y-2.5 flex-1">
                    {inventory.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 + i * 0.15 }}
                            className="flex items-center justify-between"
                        >
                            <div>
                                <div className="text-[10px] font-medium text-neutral-300">{item.name}</div>
                                <div className="text-[9px] text-neutral-500">{item.qty} units</div>
                            </div>
                            <div className={cn(
                                "text-[9px] font-bold px-1.5 py-0.5 rounded",
                                item.trend === 'up' ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
                            )}>
                                {item.trend === 'up' ? '↑' : '↓'}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Quick action */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 }}
                    className="mt-auto pt-2 border-t border-white/5"
                >
                    <div className="flex items-center gap-1 text-[9px] text-blue-400 font-semibold cursor-default">
                        <Search className="w-3 h-3" />
                        Auto-fill to invoice
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
