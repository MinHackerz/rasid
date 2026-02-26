'use client';

import Link from 'next/link';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import Image from 'next/image';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  LayoutDashboard,
  Menu,
  X,
  Camera,
  QrCode,
  Send,
  FileText,
  Lock,
  Package,
  Sparkles,
} from 'lucide-react';
import React, { useEffect } from 'react';
import { Button } from '@/components/ui';
import { useUser } from '@clerk/nextjs';
import { PlanAvatarRing } from '@/components/layout';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { Footer } from '@/components/layout/Footer';
import { PlanType } from '@/lib/constants/plans';
import { getSubscriptionDetails } from '@/app/actions/subscription';
import { getPublicSiteConfig, checkIsAdmin, type SiteConfigDTO } from '@/app/actions/admin';
import FestiveTheme from '@/components/landing/FestiveTheme';

/* ─────────── Animated Counter ─────────── */
function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  const [display, setDisplay] = React.useState(0);

  useEffect(() => {
    const controls = animate(count, target, { duration: 2, ease: 'easeOut' });
    const unsub = rounded.on('change', (v) => setDisplay(v));
    return () => { controls.stop(); unsub(); };
  }, [count, target, rounded]);

  return <span>{display.toLocaleString()}{suffix}</span>;
}

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = React.useState<{
    plan: PlanType;
    hasPendingCancellation: boolean;
    subscriptionEndsAt: string | null;
  } | null>(null);

  const [siteConfig, setSiteConfig] = React.useState<SiteConfigDTO | null>(null);
  const [isAdminRole, setIsAdminRole] = React.useState(false);
  React.useEffect(() => {
    if (isSignedIn) {
      getSubscriptionDetails().then(details => {
        if (details) {
          setSubscriptionDetails(details);
        }
      });
      checkIsAdmin().then(setIsAdminRole);
    }
  }, [isSignedIn]);

  React.useEffect(() => {
    getPublicSiteConfig()
      .then(config => setSiteConfig(config))
      .catch(() => {
        // Fail silently on header offer config – site should still work without it
      });
  }, []);

  // Check if occasion theme should be active based on date range
  const isThemeActive = React.useMemo(() => {
    if (!siteConfig?.themeEnabled) return false;
    const now = new Date();
    if (siteConfig.themeStartDate && new Date(siteConfig.themeStartDate) > now) return false;
    if (siteConfig.themeEndDate && new Date(siteConfig.themeEndDate) < now) return false;
    return true;
  }, [siteConfig]);

  const hasOfferBar = siteConfig?.offerEnabled && !!siteConfig.offerText;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Occasion / Festive Theme (admin-configurable) */}
      {isThemeActive && siteConfig && (
        <FestiveTheme
          themeName={siteConfig.themeName}
          themeEmojis={siteConfig.themeEmojis}
          themeColors={siteConfig.themeColors}
          themeIntensity={siteConfig.themeIntensity}
        />
      )}
      {/* Header Offer Bar (admin-configurable) */}
      {hasOfferBar && (() => {
        let classes = '';
        if (siteConfig.offerStyle === 'violet') classes = 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_8px_32px_-4px_rgba(139,92,246,0.3)] border-violet-500/50';
        else if (siteConfig.offerStyle === 'emerald') classes = 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_8px_32px_-4px_rgba(16,185,129,0.3)] border-emerald-400/50';
        else if (siteConfig.offerStyle === 'rose') classes = 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-[0_8px_32px_-4px_rgba(244,63,94,0.3)] border-rose-400/50';
        else if (siteConfig.offerStyle === 'dark') classes = 'bg-slate-900 text-white shadow-[0_8px_32px_-4px_rgba(15,23,42,0.4)] border-slate-700 hover:bg-slate-800';
        else if (siteConfig.offerStyle === 'custom') classes = 'text-white border-black/10 dark:border-white/20 hover:brightness-110 shadow-lg';
        else classes = 'bg-white/5 backdrop-blur-xl text-slate-700 dark:text-slate-200 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.1)] border-white/10 hover:bg-white/10 hover:shadow-[0_8px_32px_-4px_rgba(0,0,0,0.15)] ring-1 ring-white/5 hover:ring-white/20';
        let animClass = 'animate-in slide-in-from-top-4 fade-in duration-700';
        if (siteConfig.offerAnimation === 'fade') animClass = 'animate-in fade-in zoom-in-95 duration-1000';
        else if (siteConfig.offerAnimation === 'bounce') animClass = 'animate-bounce';
        else if (siteConfig.offerAnimation === 'pulse') animClass = 'animate-pulse';

        return (
          <div className={`fixed top-0 inset-x-0 z-50 flex justify-center px-4 ${animClass}`}>
            <div className="mt-3 group cursor-pointer">
              <div
                className={`relative inline-flex items-center gap-3 rounded-full text-xs sm:text-sm px-1 py-1 pr-6 overflow-hidden transition-all ${siteConfig.offerBorder ? 'border-[0.5px] shadow-sm' : 'border-transparent'} ${classes}`}
                style={siteConfig.offerStyle === 'custom' ? { backgroundColor: siteConfig.offerBgColor || '#8b5cf6' } : undefined}
              >
                {siteConfig.offerStyle === 'glass' && <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />}

                {siteConfig.offerBadge && (
                  <span className={`relative z-10 flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-sm ${siteConfig.offerStyle === 'glass' ? 'bg-gradient-to-r from-violet-600 to-indigo-600' : 'bg-black/20'}`}>
                    <Sparkles className="w-3 h-3 mr-1" />
                    {siteConfig.offerBadge}
                  </span>
                )}

                <div className="relative z-10 flex items-center font-medium">
                  {siteConfig.offerHref ? (
                    <Link href={siteConfig.offerHref} className="flex items-center gap-1.5 transition-colors">
                      {siteConfig.offerText}
                      <ArrowRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ) : (
                    <span>{siteConfig.offerText}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Navigation */}
      <nav className={`fixed ${hasOfferBar ? 'top-12 sm:top-14 xl:top-[60px]' : 'top-4'} transition-all duration-300 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto md:min-w-[700px] z-40 bg-white/90 backdrop-blur-md rounded-full border border-white/20 px-4`}>
        <div className="h-14 flex items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
              <Image
                src="/logos/Rasid_Logo.png"
                alt="Rasid Logo"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xl font-bold font-display tracking-tight text-slate-900">Rasid</span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-sm font-semibold text-slate-600">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
            <Link href="#about" className="hover:text-primary transition-colors">About</Link>
            <Link href="/help" className="hover:text-primary transition-colors">Help</Link>
          </div>
          <div className="hidden md:flex items-center gap-4">
            {!isLoaded ? (
              <div className="w-24 h-9 bg-slate-100 rounded-lg animate-pulse" />
            ) : isSignedIn ? (
              <div className="flex items-center gap-4">
                {isAdminRole && (
                  <Link href="/admin">
                    <Button size="sm" variant="outline" className="font-semibold gap-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors">
                      <Zap className="w-4 h-4" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard">
                  <Button size="sm" className="font-semibold gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
                <PlanAvatarRing plan={subscriptionDetails?.plan} size="sm" />
              </div>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="outline" size="sm" className="font-semibold border border-neutral-900 shadow-none">Sign In</Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm" className="px-6 font-bold border border-neutral-900 shadow-none">Get Started</Button>
                </Link>
              </>
            )}
          </div>
          <div className="md:hidden flex items-center">
            <button
              className="p-2 text-slate-600 hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10 h-screen w-screen"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="absolute top-[120%] left-0 w-full md:hidden origin-top z-auto"
            >
              <div
                className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-neutral-100 p-2 overflow-hidden"
                style={{ backgroundColor: '#ffffff' }}
              >
                <div className="flex flex-col gap-1">
                  <Link href="#features" className="flex items-center justify-between p-4 rounded-2xl hover:bg-neutral-50 text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Features
                    <ArrowRight className="w-4 h-4 text-neutral-300" />
                  </Link>
                  <Link href="#pricing" className="flex items-center justify-between p-4 rounded-2xl hover:bg-neutral-50 text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Pricing
                    <ArrowRight className="w-4 h-4 text-neutral-300" />
                  </Link>
                  <Link href="#about" className="flex items-center justify-between p-4 rounded-2xl hover:bg-neutral-50 text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    About
                    <ArrowRight className="w-4 h-4 text-neutral-300" />
                  </Link>
                  <Link href="/help" className="flex items-center justify-between p-4 rounded-2xl hover:bg-neutral-50 text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Help
                    <ArrowRight className="w-4 h-4 text-neutral-300" />
                  </Link>
                </div>

                <div className="mt-2 p-2 bg-neutral-50 rounded-[1.5rem]">
                  {!isLoaded ? (
                    <div className="w-full h-10 bg-slate-200 rounded-xl animate-pulse" />
                  ) : isSignedIn ? (
                    <div className="flex flex-col gap-2">
                      {isAdminRole && (
                        <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                          <Button className="w-full h-12 rounded-xl font-bold text-base shadow-sm justify-center bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20">
                            <Zap className="w-4 h-4 mr-2" />
                            Admin Panel
                          </Button>
                        </Link>
                      )}
                      <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full h-12 rounded-xl font-bold text-base shadow-sm justify-center">
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          Go to Dashboard
                        </Button>
                      </Link>
                      <div className="flex items-center gap-3 p-3 bg-white border border-neutral-100 rounded-xl">
                        <PlanAvatarRing plan={subscriptionDetails?.plan} size="sm" />
                        <span className="text-sm font-medium text-neutral-600">Account Settings</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full h-12 rounded-xl font-semibold border-neutral-200 bg-white hover:bg-neutral-50 shadow-sm justify-center text-neutral-900">Sign In</Button>
                      </Link>
                      <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full h-12 rounded-xl font-bold shadow-md shadow-neutral-900/10 justify-center">Get Started</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </nav>

      {/* ═══════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════ */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
        <div className="absolute inset-0 z-0">
          {/* Premium Background Orbs */}
          <div className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] bg-gradient-to-br from-blue-100/60 to-violet-100/40 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-20%] right-[5%] w-[700px] h-[700px] bg-gradient-to-tl from-indigo-100/50 to-sky-100/30 blur-[140px] rounded-full" />
          <div className="absolute top-[30%] right-[30%] w-[400px] h-[400px] bg-emerald-50/40 blur-[100px] rounded-full" />

          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        <div className="container-app relative z-10 text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Occasion Theme Banner (now inside the hero section) */}
            {isThemeActive && siteConfig?.themeName && (
              <div className="flex justify-center mb-6 z-20 relative animate-in fade-in slide-in-from-bottom-2 duration-1000">
                <div
                  className="px-6 py-2.5 rounded-full flex items-center gap-3 backdrop-blur-xl border border-white/40 overflow-hidden relative shadow-sm"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 100%)',
                    boxShadow: (() => {
                      let glowColor = 'rgba(0,0,0,0.1)';
                      try {
                        const colors = siteConfig.themeColors ? JSON.parse(siteConfig.themeColors) : [];
                        if (colors[0]) glowColor = `${colors[0]}50`;
                      } catch { }
                      return `0 8px 32px -4px ${glowColor}, inset 0 1px 0 0 rgba(255,255,255,0.5)`;
                    })(),
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
                  {(() => {
                    const emojis = siteConfig.themeEmojis?.split(',').map(e => e.trim()).filter(Boolean) || [];
                    return (
                      <>
                        {emojis[0] && <span className="text-xl drop-shadow-md animate-pulse">{emojis[0]}</span>}
                        <span className="font-bold tracking-wide text-foreground leading-none drop-shadow-sm mix-blend-hard-light whitespace-nowrap">
                          Happy {siteConfig.themeName}!
                        </span>
                        {emojis[emojis.length - 1] && <span className="text-xl drop-shadow-md animate-pulse">{emojis[emojis.length - 1]}</span>}
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-xs font-semibold text-emerald-700 mb-8 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Cryptographically Verified Invoices</span>
            </div>

            {/* Headline — leads with verification */}
            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold font-display tracking-tight mb-8 leading-[1.08] text-slate-900">
              Every invoice{' '}
              <span className="relative inline-block">
                <span className="relative z-10">verified</span>
                <motion.span
                  className="absolute bottom-1 left-0 right-0 h-3 md:h-4 bg-gradient-to-r from-emerald-200/70 to-teal-200/70 -z-0 rounded-sm"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
                  style={{ originX: 0 }}
                />
              </span>{' '}with <br className="hidden sm:block" />
              <span
                style={{
                  background: 'linear-gradient(to right, #047857, #0d9488)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >one scan.</span>
            </h1>

            {/* Sub-headline — QR verification front and center */}
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed font-light text-slate-500">
              Rasid seals every invoice with a cryptographic QR code while <span className="text-slate-700 font-medium">intelligently automating your stock inventory</span>.
              Customers scan to verify authenticity instantly — no fakes, no doubts, no out-of-stock surprises.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              {isSignedIn ? (
                <Link href="/dashboard">
                  <Button size="lg" className="h-14 px-8 text-base font-semibold transition-all hover:scale-105 bg-primary hover:bg-primary/90 text-white border-0 shadow-xl shadow-slate-900/10">
                    Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              ) : (
                <Link href="/sign-up">
                  <Button size="lg" className="h-14 px-8 text-base font-semibold transition-all hover:scale-105 bg-primary hover:bg-primary/90 text-white border-0 shadow-xl shadow-slate-900/10">
                    Start Free — No Card Needed <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              )}

              <Link href="#demo">
                <Button variant="outline" size="lg" className="h-14 px-8 text-base border-slate-200 hover:bg-slate-50 text-slate-700 bg-white/50 backdrop-blur-sm">
                  See How Verification Works
                </Button>
              </Link>
            </div>

            {/* Quick credibility line */}
            <p className="mt-6 text-sm text-slate-400 flex items-center justify-center gap-2">
              <Lock className="w-3.5 h-3.5" />
              Free plan available · No credit card required · Setup in 60 seconds
            </p>
          </motion.div>

          {/* Hero Video */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-20 relative mx-auto max-w-5xl"
            id="demo"
          >
            <div className="relative rounded-2xl border border-neutral-200 bg-white shadow-2xl shadow-neutral-200/50 overflow-hidden">
              {/* 16:9 aspect ratio container */}
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src="https://www.loom.com/embed/11b161ef8f3b4502ae2c02d2c917509c?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true"
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; fullscreen"
                  className="absolute inset-0 w-full h-full"
                  style={{ border: 'none' }}
                  loading="lazy"
                />
              </div>
            </div>
            {/* Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-purple-500/10 blur-3xl -z-10 opacity-60" />
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SOCIAL PROOF STRIP
          ═══════════════════════════════════════════ */}
      <section className="py-14 bg-slate-50 border-y border-slate-100">
        <div className="container-app">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-4xl mx-auto text-center"
          >
            {[
              { value: 100, suffix: '%', label: 'Tamper-Proof Guarantee' },
              { value: 1000, suffix: '+', label: 'Invoices Verified' },
              { value: 10, suffix: '+', label: 'Invoice Templates' },
              { value: 50, suffix: '+', label: 'Currencies Supported' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <p className="text-3xl md:text-4xl font-bold font-display text-slate-900 tracking-tight">
                  <AnimatedNumber target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-sm text-slate-500 mt-1 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS — 3 Steps
          ═══════════════════════════════════════════ */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Faint background accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-indigo-50/50 to-transparent blur-[80px] rounded-full pointer-events-none" />

        <div className="container-app relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold mb-4 border border-emerald-100">
              Simple as 1 – 2 – 3
            </span>
            <h2 className="text-4xl md:text-5xl font-bold font-display text-slate-900 mb-5 tracking-tight">
              How Rasid works
            </h2>
            <p className="text-lg text-slate-500">
              Create a professional invoice, seal it with cryptographic proof, and let anyone verify it instantly.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-24 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-blue-200 via-emerald-200 to-teal-200" />

            {[
              {
                step: '01',
                icon: FileText,
                color: 'from-blue-500 to-blue-600',
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-100',
                title: 'Create Your Invoice',
                desc: 'Fill in the details or pick a template. Clean, professional invoices ready in seconds — no design skills needed.',
              },
              {
                step: '02',
                icon: QrCode,
                color: 'from-emerald-500 to-emerald-600',
                bgColor: 'bg-emerald-50',
                borderColor: 'border-emerald-100',
                title: 'Sealed with a Unique QR',
                desc: 'Every invoice is automatically signed with a cryptographic QR code — a tamper-proof digital seal only Rasid can issue.',
              },
              {
                step: '03',
                icon: ShieldCheck,
                color: 'from-teal-500 to-teal-600',
                bgColor: 'bg-teal-50',
                borderColor: 'border-teal-100',
                title: 'Instant Verification',
                desc: 'Your customer scans the QR — no app needed — and instantly sees the full invoice details, verified as authentic.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative group"
              >
                <div
                  className={`relative rounded-3xl border ${item.borderColor} ${item.bgColor} p-8 h-full transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1`}
                >
                  {/* Step number */}
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                      <item.icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-5xl font-bold font-display text-slate-200 select-none">
                      {item.step}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold font-display text-slate-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURES SECTION (existing)
          ═══════════════════════════════════════════ */}
      <FeaturesSection />

      {/* ═══════════════════════════════════════════
          WHY RASID — Scannable benefit cards
          ═══════════════════════════════════════════ */}
      <section id="about" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-violet-50/40 to-transparent blur-[100px] pointer-events-none" />

        <div className="container-app relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
              Why Rasid?
            </span>
            <h2 className="text-3xl md:text-5xl font-bold font-display text-neutral-900 mb-6 tracking-tight">
              Born from a real problem,<br className="hidden md:block" /> built for real businesses
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Every feature exists because a real business owner asked for it.
              Here&apos;s what makes Rasid different.
            </p>
          </motion.div>

          {/* Origin story - brief */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto mb-16"
          >
            <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 md:p-10 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full" />
              <p className="text-lg md:text-xl leading-relaxed text-slate-300 relative z-10">
                &ldquo;Every time a vendor handed me a bill, I wondered — <em className="text-white font-medium">is this even real?</em> No way to verify, no proof of authenticity. That frustration is exactly why I built Rasid — an invoice platform where every single document is cryptographically sealed and verifiable by anyone, instantly.&rdquo;
              </p>
              <p className="mt-4 text-sm font-semibold text-slate-400 relative z-10">— Founder, Rasid</p>
            </div>
          </motion.div>

          {/* Benefit Grid — verification & trust first, AI extraction as bonus */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: QrCode,
                iconColor: 'text-emerald-600',
                iconBg: 'bg-emerald-50',
                title: 'Cryptographic QR Seal',
                desc: 'Every invoice is signed with a unique QR code that acts as a digital tamper-proof seal. If anything changes, the verification fails.',
              },
              {
                icon: ShieldCheck,
                iconColor: 'text-teal-600',
                iconBg: 'bg-teal-50',
                title: 'Scan-to-Verify, No App',
                desc: 'Your customer points their phone camera at the QR code — a verification page opens instantly. No downloads, no signup needed.',
              },
              {
                icon: Send,
                iconColor: 'text-violet-600',
                iconBg: 'bg-violet-50',
                title: 'Share via WhatsApp or Email',
                desc: 'Send verified invoices directly to your customer in one click. They receive it clean, professional, and ready to verify.',
              },
              {
                icon: FileText,
                iconColor: 'text-blue-600',
                iconBg: 'bg-blue-50',
                title: '10+ Professional Templates',
                desc: 'From minimal to classic — pick a template that represents your brand. Your invoices look great before the QR even seals them.',
              },
              {
                icon: Package,
                iconColor: 'text-sky-600',
                iconBg: 'bg-sky-50',
                title: 'Smart Inventory Sync',
                desc: 'Stock counts update instantly as each verified invoice is generated. Receive low-stock alerts and never unexpectedly run out of products again.',
              },
              {
                icon: Camera,
                iconColor: 'text-amber-600',
                iconBg: 'bg-amber-50',
                title: 'Bonus: AI Digitization',
                desc: 'Got old handwritten bills? Upload a photo and our AI extracts all details into a digital invoice — optional but powerful.',
              },
            ].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group"
              >
                <div className="relative h-full rounded-2xl border border-neutral-100 bg-white p-7 transition-all duration-300 hover:shadow-lg hover:border-neutral-200 hover:-translate-y-1">
                  <div className={`w-12 h-12 rounded-xl ${benefit.iconBg} flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110`}>
                    <benefit.icon className={`w-6 h-6 ${benefit.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2 font-display">{benefit.title}</h3>
                  <p className="text-neutral-500 leading-relaxed text-[0.95rem]">{benefit.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Target audience callout */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-3xl mx-auto mt-16 text-center"
          >
            <div className="inline-flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-slate-500">
              <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700">🏪 Retail Stores</span>
              <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700">💼 Freelancers</span>
              <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700">🚀 Startups</span>
              <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700">🏢 Small Businesses</span>
            </div>
            <p className="mt-4 text-slate-500">
              Built specifically for people who don&apos;t have time for complicated software — but deserve professional tools.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PRICING SECTION (existing)
          ═══════════════════════════════════════════ */}
      <PricingSection
        currentPlan={subscriptionDetails?.plan}
        hasPendingCancellation={subscriptionDetails?.hasPendingCancellation}
        subscriptionEndsAt={subscriptionDetails?.subscriptionEndsAt}
        isLoggedIn={isSignedIn}
      />

      {/* ═══════════════════════════════════════════
          CTA SECTION
          ═══════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="container-app">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 px-6 py-16 md:px-16 md:py-20 text-center">
            {/* Background effects */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/15 blur-[100px] rounded-full"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-violet-500/15 blur-[100px] rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full"></div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative z-10"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-white/70 mb-6 backdrop-blur-sm">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Get started in under 60 seconds</span>
              </div>

              <h2 className="text-3xl md:text-5xl font-bold text-white font-display mb-6 tracking-tight">
                Your invoices deserve to be<br className="hidden md:block" />
                trusted, not questioned.
              </h2>
              <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
                Every Rasid invoice carries a cryptographic QR seal that anyone can verify in seconds. No more &ldquo;is this real?&rdquo; — just instant, undeniable proof.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {isSignedIn ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="h-14 px-10 text-base font-bold bg-white text-slate-900 hover:bg-slate-100 shadow-xl">
                      Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/sign-up">
                    <Button size="lg" className="h-14 px-10 text-base font-bold bg-white text-slate-900 hover:bg-slate-100 shadow-xl">
                      Start Your Free Trial <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                )}
              </div>

              <p className="mt-6 text-sm text-slate-500 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Free plan available — no credit card needed
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
