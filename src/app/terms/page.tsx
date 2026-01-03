import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Footer } from '@/components/layout/Footer';
import { ArrowLeft, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { Button } from '@/components/ui';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service - Rasid',
    description: 'Read the Terms of Service for using Rasid platform for authentic invoice generation and verification.',
    openGraph: {
        title: 'Terms of Service - Rasid',
        description: 'Read the Terms of Service for using Rasid platform for authentic invoice generation and verification.',
    }
};

export default function TermsPage() {
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
                    <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6 font-display">Terms of Service</h1>
                    <p className="text-lg text-neutral-600">
                        Welcome to Rasid. By using our platform to generate an verify invoices, you agree to these terms designed to ensure trust and authenticity in business transactions.
                    </p>
                    <div className="mt-6 text-sm text-neutral-500">
                        Last Updated: January 2026
                    </div>
                </div>

                <div className="prose prose-neutral prose-lg max-w-none">
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-neutral-600" />
                            </div>
                            <h2 className="text-2xl font-bold m-0">1. Services Provided</h2>
                        </div>
                        <p>
                            Rasid provides a platform for:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-4">
                            <li>Generating digital invoices.</li>
                            <li>Digitizing physical bills using AI OCR.</li>
                            <li>Verifying the authenticity of invoices via cryptographic hashing.</li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold m-0">2. Authenticity & Usage</h2>
                        </div>
                        <p>
                            You agree to use Rasid **only for legitimate business purposes**.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-4">
                            <li>You must not generate fake or fraudulent invoices.</li>
                            <li>You acknowledge that Rasid's "Verified" status confirms the <strong>integrity of the document</strong> (that it hasn't been changed since creation), but does not guarantee the truthfulness of the underlying transaction (e.g., that goods were actually delivered).</li>
                            <li>Misusing the platform to facilitate fraud may result in immediate account termination.</li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold m-0">3. Liability Disclaimer</h2>
                        </div>
                        <p>
                            Rasid is a tool provider, not a financial institution or auditor.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-4">
                            <li>We are not responsible for errors in data entry or OCR extraction. You must verify all details before finalizing an invoice.</li>
                            <li>We are not liable for any disputes between you and your clients regarding payment or delivery of goods.</li>
                            <li>Service availability is targeted at 99.9%, but we do not guarantee uninterrupted access during maintenance or outages.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">4. Account Termination</h2>
                        <p>
                            We reserve the right to suspend or terminate accounts that violate these terms, attempt to reverse-engineer our verification algorithms, or use the platform for illegal activities.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
