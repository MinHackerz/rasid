import { verifyInvoice } from '@/lib/verification';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CheckCircle2, XCircle, AlertTriangle, Shield, Lock, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Verify Invoice - Rasid',
    description: 'Verify the authenticity of digital invoices securely using Rasid\'s cryptographic verification system.',
};

interface PageProps {
    params: Promise<{ hash: string }>;
}

export default async function VerifyPage({ params }: PageProps) {
    const { hash } = await params;
    const result = await verifyInvoice(hash);

    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-6">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl overflow-hidden">
                            <Image
                                src="/logos/Rasid_Logo.png"
                                alt="Rasid Logo"
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="text-lg font-bold text-neutral-900">Rasid</span>
                    </Link>
                </div>

                {/* Main Verification Card */}
                <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden relative">
                    {/* Status Header */}
                    <div className={`p-5 text-center ${result.status === 'VALID'
                        ? 'bg-emerald-50'
                        : result.status === 'NOT_FOUND'
                            ? 'bg-neutral-50'
                            : 'bg-red-50'
                        }`}>
                        {result.status === 'VALID' && (
                            <>
                                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 mb-3">
                                    <ShieldCheck className="w-7 h-7 text-emerald-600" />
                                </div>
                                <h1 className="text-lg font-bold text-emerald-900">Invoice Verified</h1>
                                <p className="text-emerald-700 text-sm mt-1">Authentic and unmodified</p>
                            </>
                        )}

                        {result.status === 'NOT_FOUND' && (
                            <>
                                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-neutral-200 mb-3">
                                    <XCircle className="w-7 h-7 text-neutral-500" />
                                </div>
                                <h1 className="text-lg font-bold text-neutral-900">Not Found</h1>
                                <p className="text-neutral-600 text-sm mt-1">No invoice with this code</p>
                            </>
                        )}

                        {result.status === 'TAMPERED' && (
                            <>
                                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mb-3">
                                    <AlertTriangle className="w-7 h-7 text-red-600" />
                                </div>
                                <h1 className="text-lg font-bold text-red-900">Verification Failed</h1>
                                <p className="text-red-700 text-sm mt-1">May have been tampered</p>
                            </>
                        )}
                    </div>

                    {/* Invoice Details */}
                    {result.invoice && (
                        <div className="p-4 border-t border-neutral-100">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between py-2 border-b border-neutral-100">
                                    <span className="text-neutral-500">Invoice #</span>
                                    <span className="font-semibold text-neutral-900">{result.invoice.invoiceNumber}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-neutral-100">
                                    <span className="text-neutral-500">Issued By</span>
                                    <span className="font-semibold text-neutral-900">{result.invoice.sellerName}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-neutral-100">
                                    <span className="text-neutral-500">Date</span>
                                    <span className="font-semibold text-neutral-900">{formatDate(result.invoice.issueDate)}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-neutral-500">Amount</span>
                                    <span className="font-bold text-neutral-900">
                                        {formatCurrency(result.invoice.totalAmount, result.invoice.currency)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="p-4 bg-neutral-50 border-t border-neutral-100">
                        <div className="text-center">
                            <p className="text-[10px] text-neutral-400 mb-1">Verification Code</p>
                            <code className="text-[11px] font-mono text-neutral-600">
                                {hash.slice(0, 10)}...{hash.slice(-6)}
                            </code>
                        </div>

                        {result.status !== 'VALID' && (
                            <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg mt-3 text-center">
                                Contact seller if you believe this is an error.
                            </p>
                        )}
                    </div>

                    {/* Verified Seal Overlay - Only show for VALID invoices */}
                    {result.status === 'VALID' && (
                        <div className="absolute top-1/2 -right-8 -translate-y-1/2 w-40 h-40 opacity-10 pointer-events-none transform rotate-[-15deg]">
                            <Image
                                src="/logos/rasid_verified.png"
                                alt="Verified by Rasid"
                                width={160}
                                height={160}
                                className="w-full h-full object-contain"
                            />
                        </div>
                    )}
                </div>

                {/* Trust Badges */}
                <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-neutral-400">
                    <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Cryptographic
                    </span>
                    <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Tamper-Proof
                    </span>
                </div>

                {/* Footer Link */}
                <div className="mt-4 text-center">
                    <Link href="/" className="text-xs text-neutral-500 hover:text-neutral-700">
                        rasid.in
                    </Link>
                </div>
            </div>
        </div>
    );
}
