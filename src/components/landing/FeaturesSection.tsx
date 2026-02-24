'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck, QrCode, Check, Send, Package, Search,
    TrendingUp, FileText, Camera, Sparkles, ArrowDown,
    MessageCircle, Mail, ChevronRight, AlertTriangle
} from 'lucide-react';
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

                <div className="grid grid-cols-1 md:grid-cols-6 gap-5 max-w-7xl mx-auto">
                    {/* Feature 1: QR Verification (Hero Card) */}
                    <div className="md:col-span-4 min-h-[440px]">
                        <FeatureCard
                            title="Cryptographic QR Verification"
                            description="Every invoice is sealed with a unique QR code. Your customer scans it and instantly sees a verified proof page."
                            dark
                            className="h-full flex flex-col md:flex-row"
                            headerClassName="md:w-[40%] shrink-0"
                        >
                            <div className="flex-1 overflow-hidden flex items-center justify-center p-5 md:p-6">
                                <QRVerificationAnimation />
                            </div>
                        </FeatureCard>
                    </div>

                    {/* Feature 2: Share */}
                    <div className="md:col-span-2 min-h-[440px]">
                        <FeatureCard
                            title="One-Tap Sharing"
                            description="Send verified invoices via WhatsApp or email in a single click."
                            className="h-full flex flex-col"
                        >
                            <div className="flex-1 overflow-hidden flex items-center justify-center px-5 pb-5">
                                <ShareAnimation />
                            </div>
                        </FeatureCard>
                    </div>

                    {/* Feature 3: AI Extraction */}
                    <div className="md:col-span-3 min-h-[400px]">
                        <FeatureCard
                            title="AI-Powered Digitization"
                            description="Snap a photo of any handwritten or printed bill — our AI extracts all details into a clean digital invoice."
                            className="h-full flex flex-col"
                        >
                            <div className="flex-1 overflow-hidden mx-5 mb-5 mt-1 rounded-xl border border-neutral-200 bg-neutral-50/50">
                                <TransformationAnimation />
                            </div>
                        </FeatureCard>
                    </div>

                    {/* Feature 4: Templates */}
                    <div className="md:col-span-3 min-h-[400px]">
                        <FeatureCard
                            title="10+ Professional Templates"
                            description="Pick a template that matches your brand — minimal, modern, or classic."
                            className="h-full flex flex-col"
                        >
                            <div className="flex-1 overflow-hidden flex items-center justify-center px-5 pb-5">
                                <TemplatesAnimation />
                            </div>
                        </FeatureCard>
                    </div>

                    {/* Feature 5: Dashboard + Inventory */}
                    <div className="md:col-span-6 min-h-[370px]">
                        <FeatureCard
                            title="Full Business Control & Smart Inventory"
                            description="Track live revenue, auto-sync stock as invoices generate, and get low-stock alerts — all from one dashboard."
                            dark
                            className="h-full flex flex-col md:flex-row"
                            headerClassName="md:w-[33%] shrink-0"
                        >
                            <div className="flex-1 overflow-hidden p-5 md:p-6 flex items-center justify-center">
                                <DashboardAnimation />
                            </div>
                        </FeatureCard>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ──────────────────────────────────────────────
   Card Wrapper
   ────────────────────────────────────────────── */
function FeatureCard({ title, description, children, className, headerClassName, dark }: {
    title: string;
    description: string;
    children?: React.ReactNode;
    className?: string;
    headerClassName?: string;
    dark?: boolean;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={cn(
                'relative rounded-2xl overflow-hidden border',
                dark
                    ? 'bg-neutral-900 text-white border-neutral-800'
                    : 'bg-white border-neutral-200/80',
                className
            )}
        >
            <div className={cn('p-6 md:p-7 flex flex-col', headerClassName)}>
                <h3 className="text-xl md:text-2xl font-bold font-display mb-2 tracking-tight">{title}</h3>
                <p className={cn('text-sm leading-relaxed', dark ? 'text-neutral-400' : 'text-neutral-500')}>
                    {description}
                </p>
            </div>
            {children}
        </motion.div>
    );
}

/* ──────────────────────────────────────────────
   1. QR Verification — Three-Step Story
   ────────────────────────────────────────────── */
function QRVerificationAnimation() {
    const [step, setStep] = useState(0);

    // Sequential timeline: 0 → 1 → 2 → pause → repeat
    useEffect(() => {
        // Duration each step is visible
        const stepDurations = [2500, 2000, 2500]; // invoice, scanning, verified
        const totalCycle = stepDurations.reduce((a, b) => a + b, 0) + 500; // 500ms gap before restart

        const runCycle = () => {
            setStep(0);

            const t1 = setTimeout(() => setStep(1), stepDurations[0]);
            const t2 = setTimeout(() => setStep(2), stepDurations[0] + stepDurations[1]);
            const t3 = setTimeout(runCycle, totalCycle);

            return [t1, t2, t3];
        };

        const timers = runCycle();
        return () => timers.forEach(clearTimeout);
    }, []);

    const steps = [
        { label: 'Invoice Created', icon: FileText, desc: 'QR code embedded' },
        { label: 'Customer Scans', icon: QrCode, desc: 'No app needed' },
        { label: 'Instantly Verified', icon: ShieldCheck, desc: 'Authentic & untampered' },
    ];

    return (
        <div className="w-full max-w-[340px] flex flex-col gap-5">
            {/* Main display — fixed height prevents layout shift */}
            <div className="w-full bg-neutral-800 rounded-2xl border border-white/10 overflow-hidden relative" style={{ height: 240 }}>
                <AnimatePresence mode="wait">
                    {/* Step 0: Invoice with QR */}
                    {step === 0 && (
                        <motion.div
                            key="invoice"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 p-5 flex items-center justify-center"
                        >
                            <div className="bg-white rounded-xl p-4 shadow-lg w-full max-w-[280px]">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-6 h-6 bg-neutral-900 rounded-md flex items-center justify-center">
                                        <span className="text-[8px] font-bold text-white">R</span>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-neutral-900">Invoice #INV-247</div>
                                        <div className="text-[8px] text-neutral-400">Feb 24, 2026</div>
                                    </div>
                                </div>
                                <div className="space-y-1.5 mb-3">
                                    <div className="flex justify-between text-[9px] p-1.5 bg-neutral-50 rounded">
                                        <span className="text-neutral-500">Design Service</span>
                                        <span className="font-bold text-neutral-900">$500.00</span>
                                    </div>
                                    <div className="flex justify-between text-[9px] p-1.5 bg-neutral-50 rounded">
                                        <span className="text-neutral-500">Hosting</span>
                                        <span className="font-bold text-neutral-900">$120.00</span>
                                    </div>
                                </div>
                                <div className="flex items-end justify-between pt-2 border-t border-neutral-100">
                                    <motion.div
                                        className="w-12 h-12 bg-neutral-50 rounded-lg border border-emerald-200 flex items-center justify-center"
                                        animate={{ borderColor: ['#a7f3d0', '#10b981', '#a7f3d0'] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <QrCode className="w-8 h-8 text-neutral-800" />
                                    </motion.div>
                                    <div className="text-right">
                                        <div className="text-[8px] text-neutral-400 uppercase font-bold">Total</div>
                                        <div className="text-base font-bold text-neutral-900">$620.00</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 1: Scanning QR */}
                    {step === 1 && (
                        <motion.div
                            key="scan"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 p-5 flex flex-col items-center justify-center"
                        >
                            <div className="w-24 h-24 rounded-2xl border-2 border-emerald-500/60 flex items-center justify-center relative overflow-hidden bg-white/5 mb-3">
                                <QrCode className="w-14 h-14 text-white/20" />
                                <motion.div
                                    className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                                    animate={{ top: ['5%', '95%', '5%'] }}
                                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <motion.div className="w-2 h-2 rounded-full bg-emerald-400" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                                <span className="text-sm font-semibold text-emerald-400">Scanning QR Code...</span>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Verified */}
                    {step === 2 && (
                        <motion.div
                            key="verified"
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.35 }}
                            className="absolute inset-0 p-5 flex items-center justify-center"
                        >
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 w-full max-w-[280px]">
                                <div className="flex items-center gap-3 mb-4">
                                    <motion.div
                                        className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 200, delay: 0.15 }}
                                    >
                                        <ShieldCheck className="w-5 h-5 text-white" />
                                    </motion.div>
                                    <div>
                                        <div className="text-sm font-bold text-emerald-400">VERIFIED ✓</div>
                                        <div className="text-[10px] text-neutral-500">Authentic & Untampered</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        ['Invoice', '#INV-247'],
                                        ['Amount', '$620.00'],
                                        ['Issuer', 'Rasid Inc.'],
                                        ['Date', 'Feb 24, 2026'],
                                    ].map(([k, v], i) => (
                                        <motion.div
                                            key={k}
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 + i * 0.08 }}
                                            className="bg-white/5 rounded-lg p-2"
                                        >
                                            <div className="text-[8px] text-neutral-500 uppercase font-bold">{k}</div>
                                            <div className="text-[11px] text-white font-semibold">{v}</div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Step progress bar */}
            <div className="flex items-center justify-between px-1">
                {steps.map((s, i) => (
                    <React.Fragment key={i}>
                        <div className="flex items-center gap-2">
                            <motion.div
                                className={cn(
                                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300',
                                    step === i
                                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                        : step > i
                                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                            : 'bg-transparent border-neutral-700 text-neutral-600'
                                )}
                                animate={{ scale: step === i ? [1, 1.1, 1] : 1 }}
                                transition={{ duration: 0.4 }}
                            >
                                {step > i ? <Check className="w-3.5 h-3.5" /> : <s.icon className="w-3.5 h-3.5" />}
                            </motion.div>
                            <div className="hidden sm:block">
                                <div className={cn('text-[9px] font-bold transition-colors', step >= i ? 'text-emerald-400' : 'text-neutral-600')}>{s.label}</div>
                                <div className="text-[8px] text-neutral-600">{s.desc}</div>
                            </div>
                        </div>
                        {i < 2 && (
                            <motion.div
                                className="flex-1 h-0.5 mx-2 rounded-full bg-neutral-800 overflow-hidden"
                            >
                                <motion.div
                                    className="h-full bg-emerald-500 rounded-full"
                                    animate={{ width: step > i ? '100%' : '0%' }}
                                    transition={{ duration: 0.5 }}
                                />
                            </motion.div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────────
   2. Share Animation — Chat-style delivery
   ────────────────────────────────────────────── */
function ShareAnimation() {
    const [phase, setPhase] = useState<'idle' | 'sending' | 'delivered'>('idle');

    useEffect(() => {
        const loop = () => {
            setPhase('idle');
            const t1 = setTimeout(() => setPhase('sending'), 1500);
            const t2 = setTimeout(() => setPhase('delivered'), 2800);
            const t3 = setTimeout(loop, 5500);
            return [t1, t2, t3];
        };
        const timers = loop();
        return () => timers.forEach(clearTimeout);
    }, []);

    const channels = [
        { name: 'WhatsApp', icon: MessageCircle, color: '#25D366', bg: 'bg-[#25D366]/10' },
        { name: 'Email', icon: Mail, color: '#3b82f6', bg: 'bg-blue-50' },
    ];

    return (
        <div className="w-full max-w-[210px] flex flex-col items-center gap-4">
            {/* Invoice card */}
            <motion.div
                className="w-full bg-neutral-50 rounded-xl border border-neutral-200 p-3.5 shadow-sm"
                animate={{
                    y: phase === 'sending' ? -6 : 0,
                    scale: phase === 'sending' ? 0.97 : 1,
                    opacity: phase === 'sending' ? 0.7 : 1,
                }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
                <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-5 h-5 bg-neutral-900 rounded flex items-center justify-center">
                        <span className="text-[7px] font-bold text-white">R</span>
                    </div>
                    <div className="flex-1">
                        <div className="text-[10px] font-bold text-neutral-800">Invoice #INV-247</div>
                    </div>
                    <span className="text-[10px] font-bold text-neutral-900">$620</span>
                </div>
                <div className="flex items-center gap-1.5 pt-2 border-t border-neutral-100">
                    <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[8px] font-semibold text-emerald-600">QR Verified</span>
                    <Check className="w-3 h-3 text-emerald-600 ml-auto" />
                </div>
            </motion.div>

            {/* Channels */}
            {channels.map((ch, i) => (
                <motion.div
                    key={ch.name}
                    className={cn(
                        'w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border transition-colors duration-300',
                        phase === 'delivered' ? 'border-emerald-200 bg-emerald-50' : 'border-neutral-200 bg-white'
                    )}
                    initial={false}
                    animate={{
                        y: phase === 'sending' ? [0, -3, 0] : 0,
                    }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                >
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', ch.bg)}>
                        <ch.icon className="w-4 h-4" style={{ color: ch.color }} />
                    </div>
                    <div className="flex-1">
                        <div className="text-[11px] font-semibold text-neutral-800">{ch.name}</div>
                        <div className="text-[9px] text-neutral-400">
                            {phase === 'delivered' ? 'Delivered ✓' : phase === 'sending' ? 'Sending...' : 'Ready to send'}
                        </div>
                    </div>
                    <AnimatePresence mode="wait">
                        {phase === 'delivered' ? (
                            <motion.div
                                key="done"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                transition={{ type: 'spring', delay: i * 0.12 }}
                                className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"
                            >
                                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                            </motion.div>
                        ) : phase === 'sending' ? (
                            <motion.div
                                key="spin"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, rotate: 360 }}
                                exit={{ opacity: 0 }}
                                transition={{ rotate: { duration: 1, repeat: Infinity, ease: 'linear' } }}
                                className="w-5 h-5 border-2 border-neutral-200 border-t-neutral-500 rounded-full"
                            />
                        ) : (
                            <motion.div key="arrow" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
                                <ChevronRight className="w-4 h-4 text-neutral-400" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            ))}
        </div>
    );
}

/* ──────────────────────────────────────────────
   3. AI Transformation — Highlighted extraction
   ────────────────────────────────────────────── */
function TransformationAnimation() {
    const [extracting, setExtracting] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(-1);

    useEffect(() => {
        const loop = () => {
            setExtracting(false);
            setHighlightIndex(-1);
            const t1 = setTimeout(() => { setExtracting(true); setHighlightIndex(0); }, 1500);
            const t2 = setTimeout(() => setHighlightIndex(1), 2500);
            const t3 = setTimeout(() => setHighlightIndex(2), 3500);
            const t4 = setTimeout(loop, 6000);
            return [t1, t2, t3, t4];
        };
        const timers = loop();
        return () => timers.forEach(clearTimeout);
    }, []);

    const items = [
        { handwritten: 'Design Work', digital: 'Design Services', amount: '$500.00' },
        { handwritten: 'Hosting', digital: 'Hosting Fee', amount: '$120.00' },
        { handwritten: '$620', digital: 'Total', amount: '$620.00' },
    ];

    return (
        <div className="w-full h-full flex relative select-none">
            {/* Left: Photo */}
            <div className="w-1/2 p-4 flex flex-col border-r border-neutral-200/60">
                <div className="flex items-center gap-1.5 mb-2">
                    <Camera className="w-3 h-3 text-neutral-400" />
                    <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Photo</span>
                </div>
                <div className="flex-1 bg-amber-50/40 rounded-lg border border-amber-100/60 p-3">
                    <div className="font-serif text-xs mb-3 text-neutral-600 font-bold rotate-[-0.5deg]">Invoice #001</div>
                    <div className="space-y-2.5">
                        {items.map((item, i) => (
                            <motion.div
                                key={i}
                                className={cn(
                                    'text-[10px] flex justify-between pb-1 transition-all duration-300 rounded px-1 -mx-1',
                                    i < 2 ? 'border-b border-dashed border-neutral-300/40' : 'pt-2 text-sm font-bold text-red-800',
                                    highlightIndex >= i ? 'bg-blue-100/60 ring-1 ring-blue-300/50' : ''
                                )}
                                style={{ rotate: `${(i % 2 === 0 ? 0.3 : -0.3)}deg` }}
                            >
                                <span className={cn('italic text-neutral-600', i === 2 && 'not-italic text-red-800')}>{item.handwritten}</span>
                                {i < 2 && <span className="font-bold text-neutral-800">{item.amount}</span>}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right: Digital */}
            <div className="w-1/2 p-4 flex flex-col">
                <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3 h-3 text-neutral-400" />
                    <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider">AI Output</span>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                    {items.slice(0, 2).map((item, i) => (
                        <motion.div
                            key={i}
                            className="flex justify-between items-center p-2 rounded-lg border text-[10px]"
                            animate={{
                                opacity: highlightIndex >= i ? 1 : 0.3,
                                borderColor: highlightIndex >= i ? '#d1fae5' : '#f5f5f5',
                                backgroundColor: highlightIndex >= i ? '#f0fdf4' : '#fafafa',
                            }}
                            transition={{ duration: 0.4 }}
                        >
                            <span className="font-medium text-neutral-700">{item.digital}</span>
                            <span className="font-bold text-neutral-900">{item.amount}</span>
                        </motion.div>
                    ))}
                    <motion.div
                        className="mt-auto pt-2 border-t border-neutral-100 flex justify-between items-center"
                        animate={{ opacity: highlightIndex >= 2 ? 1 : 0.3 }}
                        transition={{ duration: 0.4 }}
                    >
                        <span className="text-[8px] font-bold text-neutral-400 uppercase">Total</span>
                        <span className="text-sm font-bold text-neutral-900">$620.00</span>
                    </motion.div>
                    <motion.div
                        className="flex items-center gap-1.5 text-[9px] text-emerald-600 font-semibold"
                        animate={{ opacity: highlightIndex >= 2 ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Check className="w-3 h-3" />
                        QR seal applied
                    </motion.div>
                </div>
            </div>

            {/* Scanning line */}
            {extracting && (
                <motion.div
                    className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10 pointer-events-none"
                    style={{ filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.6))' }}
                    initial={{ left: '0%', opacity: 0 }}
                    animate={{ left: ['0%', '50%'], opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 2, ease: 'easeInOut' }}
                />
            )}
        </div>
    );
}

/* ──────────────────────────────────────────────
   4. Templates — Side-by-side comparison
   ────────────────────────────────────────────── */
function TemplatesAnimation() {
    const [active, setActive] = useState(0);
    const templates = [
        { name: 'Modern', accent: '#1e293b', badge: 'Popular' },
        { name: 'Minimal', accent: '#6366f1', badge: '' },
        { name: 'Classic', accent: '#059669', badge: '' },
        { name: 'Bold', accent: '#dc2626', badge: 'New' },
    ];

    useEffect(() => {
        const interval = setInterval(() => setActive(p => (p + 1) % templates.length), 3000);
        return () => clearInterval(interval);
    }, [templates.length]);

    return (
        <div className="w-full max-w-[240px] flex flex-col items-center gap-4">
            {/* Preview card */}
            <div className="w-full aspect-[3/4] relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={active}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 bg-white rounded-xl border border-neutral-200 shadow-sm p-4 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: templates[active].accent }}>
                                <span className="text-[8px] font-bold text-white">R</span>
                            </div>
                            <div className="flex-1">
                                <div className="h-1.5 rounded-full w-2/3" style={{ backgroundColor: templates[active].accent, opacity: 0.2 }} />
                            </div>
                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: templates[active].accent + '15', color: templates[active].accent }}>
                                {templates[active].name}
                            </span>
                        </div>

                        {/* Body lines */}
                        <div className="space-y-2 flex-1">
                            <div className="h-1.5 bg-neutral-100 rounded-full w-full" />
                            <div className="h-1.5 bg-neutral-100 rounded-full w-3/4" />
                            <div className="mt-4 space-y-2">
                                {[0, 1, 2].map(i => (
                                    <motion.div
                                        key={i}
                                        className="flex justify-between"
                                        initial={{ opacity: 0, x: 4 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 + i * 0.08 }}
                                    >
                                        <div className="h-1.5 bg-neutral-100 rounded-full" style={{ width: `${50 + i * 8}%` }} />
                                        <div className="h-1.5 bg-neutral-100 rounded-full w-8" />
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-auto pt-3 border-t border-neutral-100 flex justify-between items-center">
                            <div className="w-8 h-8 rounded-lg border border-neutral-200 flex items-center justify-center">
                                <QrCode className="w-5 h-5 text-neutral-300" />
                            </div>
                            <div className="h-2.5 rounded-full w-16" style={{ backgroundColor: templates[active].accent }} />
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Template selector */}
            <div className="flex gap-1.5 w-full">
                {templates.map((t, i) => (
                    <button
                        key={i}
                        onClick={() => setActive(i)}
                        className={cn(
                            'flex-1 py-1.5 rounded-lg text-[9px] font-bold border transition-all duration-200',
                            i === active
                                ? 'border-neutral-300 bg-neutral-50 text-neutral-800 shadow-sm'
                                : 'border-transparent text-neutral-400 hover:text-neutral-600'
                        )}
                    >
                        <div className="w-2.5 h-2.5 rounded-full mx-auto mb-0.5" style={{ backgroundColor: t.accent, opacity: i === active ? 1 : 0.3 }} />
                        {t.name}
                    </button>
                ))}
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────────
   5. Dashboard — Revenue + Inventory
   ────────────────────────────────────────────── */
function DashboardAnimation() {
    const [revenue, setRevenue] = useState(24580);

    useEffect(() => {
        const interval = setInterval(() => {
            setRevenue(c => c + Math.floor(Math.random() * 250) + 50);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    const values = [18, 35, 28, 52, 44, 62, 55, 72]; // percentage of chart height
    const inventory = [
        { name: 'Web Design', qty: 12, status: 'ok' as const },
        { name: 'Hosting Plan', qty: 48, status: 'ok' as const },
        { name: 'SEO Audit', qty: 3, status: 'low' as const },
    ];

    // SVG chart dimensions
    const W = 260;
    const H = 100;
    const padX = 4;
    const padTop = 4;
    const padBot = 4;
    const chartW = W - padX * 2;
    const chartH = H - padTop - padBot;

    // Convert values to SVG points
    const points = values.map((v, i) => ({
        x: padX + (i / (values.length - 1)) * chartW,
        y: padTop + chartH - (v / 100) * chartH,
    }));

    // Build smooth cubic bezier path
    const buildPath = (pts: { x: number; y: number }[]) => {
        let d = `M ${pts[0].x},${pts[0].y}`;
        for (let i = 1; i < pts.length; i++) {
            const prev = pts[i - 1];
            const curr = pts[i];
            const cpx1 = prev.x + (curr.x - prev.x) * 0.4;
            const cpx2 = curr.x - (curr.x - prev.x) * 0.4;
            d += ` C ${cpx1},${prev.y} ${cpx2},${curr.y} ${curr.x},${curr.y}`;
        }
        return d;
    };

    const linePath = buildPath(points);
    const areaPath = `${linePath} L ${points[points.length - 1].x},${H} L ${points[0].x},${H} Z`;

    // Horizontal grid lines
    const gridLines = [0.25, 0.5, 0.75].map(frac => padTop + chartH * (1 - frac));

    return (
        <div className="w-full h-full flex gap-3 md:gap-4">
            {/* Revenue */}
            <div className="flex-1 bg-white/[0.04] rounded-xl border border-white/10 p-4 flex flex-col min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Monthly Revenue</span>
                    <span className="text-[9px] font-semibold text-emerald-400 flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" /> +18%
                    </span>
                </div>
                <motion.div
                    key={revenue}
                    initial={{ y: -3, opacity: 0.6 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-lg md:text-xl font-bold text-white tracking-tight mb-3"
                >
                    ${revenue.toLocaleString()}
                </motion.div>

                {/* SVG Chart */}
                <div className="flex-1 min-h-[70px] relative">
                    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="rgba(59,130,246,0.3)" />
                                <stop offset="100%" stopColor="rgba(59,130,246,0)" />
                            </linearGradient>
                        </defs>

                        {/* Grid lines */}
                        {gridLines.map((y, i) => (
                            <line
                                key={i}
                                x1={padX} y1={y} x2={W - padX} y2={y}
                                stroke="rgba(255,255,255,0.06)"
                                strokeWidth="0.5"
                                strokeDasharray="4 3"
                            />
                        ))}

                        {/* Gradient area fill */}
                        <motion.path
                            d={areaPath}
                            fill="url(#areaGrad)"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                        />

                        {/* Line */}
                        <motion.path
                            d={linePath}
                            fill="none"
                            stroke="rgba(59,130,246,0.9)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                        />

                        {/* Data dots */}
                        {points.map((p, i) => (
                            <motion.circle
                                key={i}
                                cx={p.x}
                                cy={p.y}
                                r="3"
                                fill="#1e293b"
                                stroke="rgba(59,130,246,0.9)"
                                strokeWidth="1.5"
                                initial={{ opacity: 0, scale: 0 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 + i * 0.08, duration: 0.3 }}
                            />
                        ))}

                        {/* Highlight last dot */}
                        <motion.circle
                            cx={points[points.length - 1].x}
                            cy={points[points.length - 1].y}
                            r="5"
                            fill="none"
                            stroke="rgba(59,130,246,0.4)"
                            strokeWidth="1"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 1 }}
                        />
                    </svg>
                </div>

                {/* Month labels */}
                <div className="flex justify-between mt-1.5 text-[7px] text-neutral-600 font-medium px-0.5">
                    {months.map(m => <span key={m}>{m}</span>)}
                </div>
            </div>

            {/* Inventory */}
            <div className="w-36 md:w-44 bg-white/[0.04] rounded-xl border border-white/10 p-4 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Stock</span>
                    <Package className="w-3.5 h-3.5 text-neutral-500" />
                </div>
                <div className="space-y-2.5 flex-1">
                    {inventory.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 6 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            className="flex items-center justify-between gap-2"
                        >
                            <div className="min-w-0">
                                <div className="text-[10px] font-medium text-neutral-300 truncate">{item.name}</div>
                                <div className="text-[9px] text-neutral-500">{item.qty} units</div>
                            </div>
                            <span className={cn(
                                'text-[8px] font-bold px-1.5 py-0.5 rounded shrink-0',
                                item.status === 'ok'
                                    ? 'text-emerald-400 bg-emerald-500/10'
                                    : 'text-amber-400 bg-amber-500/10'
                            )}>
                                {item.status === 'ok' ? '● OK' : '⚠ Low'}
                            </span>
                        </motion.div>
                    ))}
                </div>
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    className="pt-2 border-t border-white/5 mt-auto"
                >
                    <div className="flex items-center gap-1 text-[8px] text-blue-400 font-semibold">
                        <Search className="w-3 h-3" />
                        Auto-syncs with invoices
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
