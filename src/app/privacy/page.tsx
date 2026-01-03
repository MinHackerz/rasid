import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Footer } from '@/components/layout/Footer';
import { ArrowLeft, Shield, Lock, Eye, Server } from 'lucide-react';
import { Button } from '@/components/ui';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy - Rasid',
    description: 'Learn how Rasid protects your invoice data, privacy, and business information with advanced security and cryptography.',
    openGraph: {
        title: 'Privacy Policy - Rasid',
        description: 'Learn how Rasid protects your invoice data, privacy, and business information with advanced security and cryptography.',
    }
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Simple Header */}
            <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-neutral-100 z-50">
                <div className="container-app h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg overflow-hidden">
                            <Image src="/logos/Rasid_Logo.png" alt="Rasid" width={32} height={32} className="object-cover" />
                        </div>
                        <span className="font-bold text-lg text-neutral-900">Rasid</span>
                    </Link>
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="pt-32 pb-20 container-app max-w-4xl">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6 font-display">Privacy Policy</h1>
                    <p className="text-lg text-neutral-600">
                        At Rasid, we take your financial privacy and data security seriously. This policy outlines how we handle your invoice data, personal information, and business records with the highest standards of cryptographic security.
                    </p>
                    <div className="mt-6 text-sm text-neutral-500">
                        Last Updated: January 2024
                    </div>
                </div>

                <div className="prose prose-neutral prose-lg max-w-none">
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-bold m-0">1. Data Collection & Usage</h2>
                        </div>
                        <p>
                            We collect information necessary to provide our invoicing and verification services. This includes:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-4">
                            <li><strong>Business Information:</strong> Name, address, tax ID, and contact details used for invoice generation.</li>
                            <li><strong>Invoice Data:</strong> Details of items, prices, and customers entered into our system or extracted via our AI OCR technology.</li>
                            <li><strong>Usage Data:</strong> Information about how you interact with our platform to improve service performance.</li>
                        </ul>
                        <p className="mt-4">
                            <strong>We do not sell your data.</strong> Your business data is yours. We use it solely to generate, store, and verify your documents.
                        </p>
                    </section>

                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                                <Lock className="w-5 h-5 text-emerald-600" />
                            </div>
                            <h2 className="text-2xl font-bold m-0">2. Verification & Cryptography</h2>
                        </div>
                        <p>
                            Rasid's core feature is <strong>authentic verification</strong>. To achieve this:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-4">
                            <li>We generate a unique cryptographic hash for every invoice.</li>
                            <li>This hash is stored publicly to allow verification via QR code.</li>
                            <li>While the hash is public, the <strong>specific content</strong> of your invoice is only accessible to those who possess the original link or QR code. Typical public verification only confirms the validity of the hash, not the full private details unless intended.</li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center">
                                <Eye className="w-5 h-5 text-violet-600" />
                            </div>
                            <h2 className="text-2xl font-bold m-0">3. AI Processing</h2>
                        </div>
                        <p>
                            Our <strong>AI OCR (Optical Character Recognition)</strong> features allow you to digitize paper invoices. When you upload a document:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-4">
                            <li>The image is processed temporarily by our secure AI engine to extract text.</li>
                            <li>We do not use your specific invoice content to train public AI models in a way that would expose your private data.</li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                                <Server className="w-5 h-5 text-amber-600" />
                            </div>
                            <h2 className="text-2xl font-bold m-0">4. Data Retention</h2>
                        </div>
                        <p>
                            You have full control over your data.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-4">
                            <li><strong>Future Validation:</strong> Invoice data is kept securely stored to enable the future validation of each invoice. This ensures that any stakeholder (clients, auditors) can verify the authenticity of a document at any time via its unique QR code or link.</li>
                            <li><strong>Immutability:</strong> To maintain the trust and integrity of the verification system, <strong>generated invoices cannot be deleted or altered once issued</strong>. This permanent record is essential to guarantee that a verification attempt will always return the correct status for any issued document.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">5. Contact Us</h2>
                        <p>
                            If you have questions about your data privacy or security, please contact our Data Protection Officer at <strong>privacy@rasid.in</strong>.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
