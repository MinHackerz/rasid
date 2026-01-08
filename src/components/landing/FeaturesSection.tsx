'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ShieldCheck, BarChart3, Globe, Scan, QrCode, DollarSign, Activity, FileText } from 'lucide-react';
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
                        <h2 className="text-4xl md:text-5xl font-bold font-display mb-6 text-neutral-900">
                            Everything you need to grow
                        </h2>
                        <p className="text-xl text-neutral-500 max-w-2xl mx-auto">
                            Powerful tools to manage your billing, from creation to verification.
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-6 max-w-7xl mx-auto">
                    {/* Feature 1: AI Extraction (Large Card - Left) */}
                    <div className="md:col-span-4 min-h-[400px]">
                        <FeatureCard
                            title="AI-Powered Extraction"
                            description="Watch as our AI magically transforms messy handwritten bills into structured, verifiable digital invoices in an instant."
                            className="h-full bg-white flex flex-col md:flex-row"
                            headerClassName="md:w-[45%] z-20"
                        >
                            <div className="relative w-full md:w-[55%] h-64 md:h-full bg-neutral-50/80 border-t md:border-t-0 md:border-l border-neutral-100 overflow-hidden flex items-center justify-center p-6">
                                <TransformationAnimation />
                            </div>
                        </FeatureCard>
                    </div>

                    {/* Feature 2: Trust (Tall Card - Right) */}
                    <div className="md:col-span-2 min-h-[400px]">
                        <FeatureCard
                            title="Tamper-Proof Trust"
                            description="Every document is sealed with a cryptographic signature."
                            className="h-full bg-neutral-900 text-white flex flex-col"
                            descriptionClassName="text-neutral-400"
                        >
                            <div className="flex-1 relative w-full h-full flex items-center justify-center pb-8 overflow-hidden">
                                <TrustAnimation />
                            </div>
                        </FeatureCard>
                    </div>

                    {/* Feature 3: Analytics (Medium Card - Left) */}
                    <div className="md:col-span-3 min-h-[350px]">
                        <FeatureCard
                            title="Live Business Intelligence"
                            description="Real-time financial command center with live revenue tracking."
                            className="h-full bg-white flex flex-col"
                        >
                            <div className="relative w-full h-full min-h-[250px] overflow-hidden px-6 pb-6 mt-4">
                                <div className="absolute inset-x-6 bottom-6 top-0 rounded-xl border border-neutral-200 shadow-sm overflow-hidden bg-neutral-50/50">
                                    <DashboardAnimation />
                                </div>
                            </div>
                        </FeatureCard>
                    </div>

                    {/* Feature 4: Global (Medium Card - Right) */}
                    <div className="md:col-span-3 min-h-[350px]">
                        <FeatureCard
                            title="Global Scale"
                            description="Generate invoices in any currency, anywhere in the world."
                            className="h-full bg-white flex flex-col overflow-hidden"
                            headerClassName="z-10"
                        >
                            <div className="absolute inset-0 top-0">
                                <WorldMapAnimation />
                            </div>
                        </FeatureCard>
                    </div>

                    {/* Feature 5: Inventory (Full Width) */}
                    <div className="md:col-span-6 min-h-[350px]">
                        <FeatureCard
                            title="Smart Inventory Management"
                            description="Keep track of your products and services. Auto-fill invoices instantly and never lose sight of your stock."
                            className="h-full bg-neutral-900 text-white flex flex-col md:flex-row overflow-hidden"
                            descriptionClassName="text-neutral-400"
                        >
                            <div className="relative w-full h-full flex items-center justify-center p-8">
                                <InventoryAnimation />
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
                <h3 className="text-2xl font-bold font-display mb-4 tracking-tight">{title}</h3>
                <p className={cn("text-lg text-neutral-500 leading-relaxed", descriptionClassName)}>
                    {description}
                </p>
            </div>
            {children}
        </motion.div>
    );
}

// ============================================
// 1. Transformation Animation (Handwriting -> Digital)
// ============================================

function TransformationAnimation() {
    return (
        <div className="relative w-full max-w-[280px] aspect-[3/4] select-none">
            {/* 1. Underlying Layer: Handwritten (Messy) */}
            <div className="absolute inset-0 bg-[#fdfbf7] border border-neutral-200 rounded-sm shadow-sm p-6 flex flex-col rotate-1 origin-center">
                {/* Visual Anchor */}
                <div className="absolute inset-0 bg-amber-50/30" />
                <div className="relative z-10 opacity-60">
                    <div className="font-serif text-2xl mb-6 text-neutral-800 rotate-[-2deg] font-bold" style={{ fontFamily: 'Times New Roman, serif' }}>Invoice #001</div>
                    <div className="space-y-6 text-sm">
                        <div className="flex justify-between border-b border-neutral-300 border-dashed pb-1">
                            <span className="italic">Design Work</span>
                            <span className="font-bold">$500</span>
                        </div>
                        <div className="flex justify-between border-b border-neutral-300 border-dashed pb-1">
                            <span className="italic">Hosting</span>
                            <span className="font-bold">$120</span>
                        </div>
                        <div className="mt-8 text-right pr-2 text-xl rotate-[-2deg] text-red-800 font-bold border-2 border-red-800/50 inline-block self-end p-1 rounded transform translate-x-2">
                            $620.00
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Top Layer: Digital invoice (Perfectly superimposed, clips in) */}
            <motion.div
                className="absolute inset-0 bg-white border border-neutral-200 rounded-sm shadow-xl z-20 overflow-hidden flex flex-col"
                animate={{
                    clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)', 'inset(0 0% 0 0)', 'inset(0 100% 0 0)']
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.4, 0.8, 1]
                }}
            >
                <div className="p-6 flex flex-col h-full relative">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center text-white font-bold">R</div>
                            <div className="flex flex-col leading-none">
                                <span className="font-bold text-xs uppercase tracking-wider text-neutral-900">Rasid</span>
                                <span className="text-[9px] text-neutral-400">Platform</span>
                            </div>
                        </div>
                        <div className="text-[10px] bg-neutral-100 px-2 py-1 rounded text-neutral-500 font-mono">INV-01</div>
                    </div>

                    {/* Structured Items */}
                    <div className="space-y-3 flex-1">
                        <div className="flex justify-between items-center p-2 rounded bg-neutral-50 border border-neutral-100">
                            <span className="text-xs font-medium text-neutral-700">Design Services</span>
                            <span className="text-sm font-bold text-neutral-900">$500.00</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded bg-neutral-50 border border-neutral-100">
                            <span className="text-xs font-medium text-neutral-700">Server Costs</span>
                            <span className="text-sm font-bold text-neutral-900">$120.00</span>
                        </div>
                    </div>

                    {/* Footer / Total */}
                    <div className="mt-auto pt-4 border-t border-neutral-100 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase">Total</span>
                        <span className="font-bold text-lg text-neutral-900">$620.00</span>
                    </div>

                    {/* QR Code Stamp */}
                    <motion.div
                        className="absolute bottom-16 right-6"
                        initial={{ scale: 0, opacity: 0, rotate: 10 }}
                        animate={{ scale: [0, 1, 1], opacity: [0, 1, 1], rotate: [10, 0, 0] }}
                        transition={{ duration: 0.4, delay: 2.2, repeat: Infinity, repeatDelay: 5.6 }}
                    >
                        <div className="bg-white p-1 border-2 border-emerald-500 rounded-xl shadow-lg">
                            <QrCode className="w-10 h-10 text-emerald-600" />
                        </div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-black text-white bg-emerald-500 px-1.5 rounded-full tracking-wider shadow-sm">
                            VERIFIED
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* 3. The Scanning Beam */}
            <motion.div
                className="absolute inset-y-[-10%] w-1 bg-blue-500 z-30"
                style={{ filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.6))' }}
                animate={{ left: ['0%', '100%', '100%', '0%'], opacity: [1, 1, 0, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", times: [0, 0.4, 0.45, 1] }}
            >
                <div className="absolute top-1/2 -translate-y-1/2 -left-16 w-32 h-full bg-gradient-to-r from-blue-500/10 to-transparent blur-lg" />
            </motion.div>
        </div>
    );
}

// ============================================
// 2. Trust Animation (Shield)
// ============================================
function TrustAnimation() {
    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute w-40 h-40 bg-emerald-500/10 blur-[60px] rounded-full" />
            <motion.div
                animate={{
                    y: [0, -10, 0],
                    rotateY: [0, 180, 360],
                }}
                transition={{
                    y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                    rotateY: { duration: 8, repeat: Infinity, ease: "linear" }
                }}
                className="relative w-32 h-32 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl flex items-center justify-center shadow-2xl border border-white/10 z-10"
            >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
                <ShieldCheck className="w-16 h-16 text-white drop-shadow-md" />
            </motion.div>

            {/* Particles */}
            {[...Array(3)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1.5 h-1.5 bg-emerald-400 rounded-full"
                    animate={{
                        y: [-20, -60],
                        x: [-20, 20],
                        opacity: [1, 0]
                    }}
                    transition={{
                        duration: 2 + i,
                        repeat: Infinity,
                        delay: i * 0.7,
                        ease: "easeOut"
                    }}
                />
            ))}
        </div>
    );
}

// ============================================
// 3. Live Dashboard Animation
// ============================================
function DashboardAnimation() {
    const [count, setCount] = useState(12420);

    useEffect(() => {
        const interval = setInterval(() => {
            setCount(c => c + Math.floor(Math.random() * 200));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const recentSales = [
        { name: 'Acme Corp', amount: '+$500', color: 'text-emerald-600' },
        { name: 'Global Tech', amount: '+$1,200', color: 'text-emerald-600' },
        { name: 'Studio', amount: '+$350', color: 'text-emerald-600' },
        { name: 'AWS', amount: '-$120', color: 'text-red-500' },
    ];

    return (
        <div className="w-full h-full bg-white flex flex-col">
            {/* Header */}
            <div className="h-8 border-b border-neutral-100 flex items-center px-3 justify-between bg-neutral-50/50">
                <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-neutral-200" />
                    <div className="w-2 h-2 rounded-full bg-neutral-200" />
                </div>
                <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Live Revenue</div>
            </div>

            <div className="flex-1 flex flex-col p-4 relative">
                {/* Total Balance */}
                <div className="mb-4">
                    <p className="text-[10px] text-neutral-400 font-medium uppercase mb-0.5">Total Balance</p>
                    <p className="text-2xl font-bold text-neutral-900 tracking-tight flex items-baseline gap-2">
                        ${count.toLocaleString()}
                        <span className="text-xs font-medium text-emerald-500 bg-emerald-50 px-1 rounded">+12%</span>
                    </p>
                </div>

                {/* Animated Chart Area */}
                <div className="h-16 w-full relative mb-4">
                    <svg className="w-full h-full text-blue-500 overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
                                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <motion.path
                            d="M0,40 L0,25 C20,20 40,30 60,15 C80,5 100,20 100,10 L100,40 Z"
                            fill="url(#gradient)"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        />
                        <motion.path
                            d="M0,25 C20,20 40,30 60,15 C80,5 100,20 100,10"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, ease: "easeOut" }}
                        />
                    </svg>
                </div>

                {/* Live Feed */}
                <div className="mt-auto space-y-2">
                    {recentSales.map((sale, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.2 }}
                            className="flex items-center justify-between text-xs py-1 border-b border-neutral-50 last:border-0"
                        >
                            <span className="text-neutral-600 font-medium">{sale.name}</span>
                            <span className={cn("font-bold", sale.color)}>{sale.amount}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ============================================
// 4. World Map Animation (Real Dotted Map)
// ============================================
function WorldMapAnimation() {
    // Simplified coordinates approximating world continents on a 100x100 grid
    const mapDots = [
        // North America
        { x: 15, y: 15 }, { x: 18, y: 12 }, { x: 22, y: 14 }, { x: 28, y: 12 }, // Canada/Alaska
        { x: 15, y: 22 }, { x: 20, y: 22 }, { x: 25, y: 20 }, { x: 30, y: 25 }, // US
        { x: 20, y: 30 }, { x: 25, y: 32 }, // Mexico

        // South America
        { x: 30, y: 45 }, { x: 35, y: 45 }, { x: 40, y: 50 }, // North SA
        { x: 32, y: 55 }, { x: 38, y: 60 }, { x: 35, y: 65 }, // South SA

        // Europe
        { x: 52, y: 15 }, { x: 55, y: 12 }, { x: 58, y: 18 }, { x: 62, y: 15 }, // Northern
        { x: 50, y: 22 }, { x: 55, y: 25 }, { x: 60, y: 22 }, // Central

        // Africa
        { x: 50, y: 35 }, { x: 55, y: 35 }, { x: 60, y: 38 }, // North
        { x: 48, y: 42 }, { x: 55, y: 45 }, { x: 62, y: 45 }, // Central
        { x: 52, y: 55 }, { x: 58, y: 60 }, { x: 60, y: 65 }, // South

        // Asia
        { x: 70, y: 15 }, { x: 75, y: 12 }, { x: 80, y: 15 }, { x: 85, y: 12 }, // Russia/North
        { x: 68, y: 25 }, { x: 75, y: 25 }, { x: 82, y: 22 }, { x: 88, y: 20 }, // Central/China
        { x: 70, y: 35 }, { x: 75, y: 32 }, { x: 80, y: 35 }, // India/SE Asia
        { x: 92, y: 25 }, { x: 93, y: 30 }, // Japan

        // Australia
        { x: 85, y: 60 }, { x: 90, y: 58 }, { x: 92, y: 65 }, { x: 82, y: 62 }
    ];

    const activeNodes = [
        { x: 25, y: 25, currency: '$' },  // US
        { x: 55, y: 22, currency: '€' },  // Europe
        { x: 80, y: 35, currency: '₹' },  // India
        { x: 92, y: 25, currency: '¥' },  // Japan
        { x: 55, y: 12, currency: '£' },  // UK
        { x: 90, y: 58, currency: '$' },  // Australia
    ];

    return (
        <div className="w-full h-full relative flex items-center justify-center pt-24">
            {/* World Map Dots */}
            <div className="w-full h-full max-w-[350px] max-h-[180px] relative">
                {mapDots.map((dot, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-neutral-500 rounded-full"
                        style={{
                            left: `${dot.x}%`,
                            top: `${dot.y}%`,
                        }}
                    />
                ))}

                {/* Random background dots for filler/ocean feel */}
                <BackgroundDots />

                {/* Connecting Arcs */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-40">
                    <motion.path
                        d="M112,56 Q247,-10 360,67" // US to Europe
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        animate={{ strokeDashoffset: [0, -8] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.path
                        d="M247,49 Q360,10 414,56" // Europe to Japan
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        animate={{ strokeDashoffset: [0, -8] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 1 }}
                    />
                </svg>

                {/* Active Currency Nodes */}
                {activeNodes.map((node, i) => (
                    <div
                        key={i}
                        className="absolute"
                        style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    >
                        {/* Pulsing Dot */}
                        <motion.div
                            className="absolute -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_bg-blue-500] z-10"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                        />

                        {/* Currency Bubble */}
                        <motion.div
                            className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-blue-600 bg-white px-1.5 py-0.5 rounded shadow-sm z-20"
                            animate={{ y: [0, -8, 0], opacity: [0, 1, 0] }}
                            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5 }}
                        >
                            {node.currency}
                        </motion.div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Fixed Hydration (Client only random background dots)
function BackgroundDots() {
    const [dots, setDots] = useState<{ x: number, y: number }[]>([]);
    useEffect(() => {
        setDots(Array.from({ length: 20 }).map(() => ({
            x: Math.random() * 100,
            y: Math.random() * 100
        })));
    }, []);
    return (
        <>
            {dots.map((dot, i) => (
                <div
                    key={`ocean-${i}`}
                    className="absolute w-1 h-1 bg-neutral-100 rounded-full"
                    style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
                />
            ))}
        </>
    );
}

// ============================================
// 5. Inventory Animation
// ============================================
function InventoryAnimation() {
    return (
        <div className="relative w-full max-w-2xl h-48 bg-neutral-800/50 rounded-xl border border-white/10 p-6 flex items-center justify-around overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />

            {/* Stock Items */}
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className="relative w-32 h-32 bg-neutral-800 rounded-lg border border-white/10 flex flex-col items-center justify-center gap-3 shadow-xl z-10"
                >
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="space-y-1 text-center">
                        <div className="w-16 h-2 bg-white/20 rounded-full mx-auto" />
                        <div className="w-10 h-1.5 bg-white/10 rounded-full mx-auto" />
                    </div>
                    <div className="absolute -top-3 -right-3 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full">
                        IN STOCK
                    </div>
                </motion.div>
            ))}

            {/* Moving Scanner Line */}
            <motion.div
                className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent skew-x-12 z-20"
                animate={{ left: ['-20%', '120%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
        </div>
    );
}
