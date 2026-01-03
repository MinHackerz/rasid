'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight, CheckCircle2, ShieldCheck, Zap, Globe, BarChart3, LayoutDashboard, Menu, X } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui';
import { useUser, UserButton } from '@clerk/nextjs';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { Footer } from '@/components/layout/Footer';

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      {/* Navigation */}
      <nav className="fixed top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto md:min-w-[700px] z-50 bg-white/90 backdrop-blur-md rounded-full border border-white/20 shadow-lg shadow-black/5 px-4">
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
          </div>
          <div className="hidden md:flex items-center gap-4">
            {!isLoaded ? (
              <div className="w-24 h-9 bg-slate-100 rounded-lg animate-pulse" />
            ) : isSignedIn ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button size="sm" className="font-semibold gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <UserButton afterSignOutUrl="/" />
                </div>
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
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop Dimmer */}
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
                </div>

                <div className="mt-2 p-2 bg-neutral-50 rounded-[1.5rem]">
                  {!isLoaded ? (
                    <div className="w-full h-10 bg-slate-200 rounded-xl animate-pulse" />
                  ) : isSignedIn ? (
                    <div className="flex flex-col gap-2">
                      <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full h-12 rounded-xl font-bold text-base shadow-sm justify-center">
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          Go to Dashboard
                        </Button>
                      </Link>
                      <div className="flex items-center gap-3 p-3 bg-white border border-neutral-100 rounded-xl">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                          <UserButton afterSignOutUrl="/" />
                        </div>
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

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
        <div className="absolute inset-0 z-0">
          {/* Premium Light-Theme Background Effects */}
          <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-blue-50/50 blur-[130px] rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-violet-50/50 blur-[150px] rounded-full" />

          {/* Subtle Grid Pattern for Structure */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        <div className="container-app relative z-10 text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-xs font-semibold text-primary mb-8 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span>Zero Manual Entry. Full Cryptographic Trust.</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-display tracking-tight mb-8 leading-[1.1] text-slate-900">
              The Smartest way to <br />
              <span className="text-slate-900">Bill, Track, and Trust.</span>
            </h1>

            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed font-light text-slate-600">
              Transform your billing with AI OCR that eliminates manual entry and cryptographic signatures that ensure 100% tamper-proof trust. The modern standard for secure, automated financial operations.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              {isSignedIn ? (
                <Link href="/dashboard">
                  <Button size="lg" className="h-14 px-8 text-base font-semibold transition-all hover:scale-105 bg-primary hover:bg-primary/90 text-white border-0">
                    Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              ) : (
                <Link href="/sign-up">
                  <Button size="lg" className="h-14 px-8 text-base font-semibold transition-all hover:scale-105 bg-primary hover:bg-primary/90 text-white border-0">
                    Start Your Free Trial <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              )}

              <Link href="#demo">
                <Button variant="outline" size="lg" className="h-14 px-8 text-base border-slate-200 hover:bg-slate-50 text-slate-700 bg-white/50 backdrop-blur-sm">
                  Watch Product Demo
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Hero Video - Loom Demo */}
          <motion.div
            initial={{ opacity: 0, y: 40, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-20 relative mx-auto max-w-5xl perspective-1000"
          >
            <div className="relative rounded-2xl border border-neutral-200 bg-white shadow-2xl shadow-neutral-200/50 overflow-hidden">
              {/* Loom Video Embed */}
              <div className="aspect-video w-full">
                <iframe
                  src="https://www.loom.com/embed/11b161ef8f3b4502ae2c02d2c917509c?sid=auto&hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true"
                  frameBorder="0"
                  allowFullScreen
                  className="w-full h-full"
                  allow="autoplay; fullscreen"
                />
              </div>
            </div>

            {/* Decorative glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-purple-500/10 blur-3xl -z-10 opacity-60" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* About Section */}
      <section id="about" className="py-24 bg-white">
        <div className="container-app">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
                Why Rasid?
              </span>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-neutral-900 mb-6">
                Born from a real problem, built for real businesses
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="prose prose-lg max-w-none text-neutral-600 leading-relaxed"
            >
              <p className="text-xl mb-6">
                Have you ever received an invoice and wondered — <em>"Is this even real?"</em>
              </p>

              <p className="mb-6">
                That's exactly where I was. Every time a vendor handed me a bill, there was no way to verify if it was genuine or tampered with. No signature could truly prove authenticity. No phone call could confirm details instantly. It was frustrating, and I knew there had to be a better way.
              </p>

              <p className="mb-6">
                That's why I built <strong>Rasid</strong>.
              </p>

              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 md:p-8 my-8">
                <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                  Instant Verification with Every Invoice
                </h3>
                <p className="text-neutral-600 mb-0">
                  Every invoice generated through Rasid comes with a <strong>unique QR code</strong> embedded right into it. Your customers can simply scan it with their phone — no app needed — and <em>instantly verify</em> that the invoice is authentic, untampered, and issued by you. No more trust issues. No more "let me call and check" moments.
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 md:p-8 my-8">
                <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-blue-600" />
                  AI-Powered Digitization of Manual Invoices
                </h3>
                <p className="text-neutral-600 mb-0">
                  Got a pile of handwritten invoices or old receipts? No problem. Just <strong>upload a photo</strong> of any manual invoice, and our AI will instantly extract all the details — vendor name, items, amounts, dates — everything. <em>Verify it, save it to your records, or share it with your customer</em> right away. No more lost paperwork. Your invoice history is always at your fingertips, ready whenever you need it.
                </p>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 md:p-8 my-8">
                <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                  <Zap className="w-6 h-6 text-primary" />
                  Share Instantly via WhatsApp or Email
                </h3>
                <p className="text-neutral-600 mb-0">
                  No more digging through drawers or folders looking for that physical copy. With Rasid, you can <strong>instantly share any invoice</strong> directly to your customer's WhatsApp number or email ID with a single click. They receive it immediately — clean, professional, and ready for their records.
                </p>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 md:p-8 my-8">
                <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                  <Globe className="w-6 h-6 text-primary" />
                  Work from Anywhere, in Any Currency
                </h3>
                <p className="text-neutral-600 mb-0">
                  Whether you're at home, at your shop, or traveling — Rasid works wherever you are. It's completely cloud-based, so you have full flexibility. And yes, it supports <strong>multiple currencies</strong>, so you can bill clients across the globe without any hassle.
                </p>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 md:p-8 my-8">
                <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-primary" />
                  10+ Beautiful Invoice Templates
                </h3>
                <p className="text-neutral-600 mb-0">
                  Your invoice represents your brand. That's why Rasid offers <strong>10+ professionally designed templates</strong> — from minimal and modern to classic and detailed. Just pick the one that fits your style, and you're ready to go. No design skills needed.
                </p>
              </div>

              <p className="text-lg mt-8 mb-4">
                Rasid was built with a clear focus: <strong>small and mid-sized businesses, retail stores, freelancers, and startups</strong> — the people who don't have time for complicated software but deserve professional tools to run their business efficiently.
              </p>

              <p className="text-lg text-neutral-800 font-medium">
                If you've ever struggled with invoice authenticity, lost track of receipts, or wished for a simpler way to manage your billing — <em>Rasid is built for you.</em>
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container-app">
          <div className="relative rounded-3xl overflow-hidden bg-primary px-6 py-16 md:px-16 md:py-20 text-center">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/20 blur-[100px] rounded-full"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent/40 blur-[100px] rounded-full"></div>

            <h2 className="text-3xl md:text-5xl font-bold text-white font-display mb-6 relative z-10">
              Ready to modernize your business?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-10 max-w-2xl mx-auto relative z-10">
              Join thousands of businesses trusting Rasid for their financial operations. Start your 14-day free trial today.
            </p>
            <div className="relative z-10">
              {isSignedIn ? (
                <Link href="/dashboard">
                  <Button size="lg" variant="secondary" className="h-14 px-10 text-base font-bold">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/sign-up">
                  <Button size="lg" variant="secondary" className="h-14 px-10 text-base font-bold">
                    Get Started Now
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
