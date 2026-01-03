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
            <div className="w-full max-w-lg">
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
                    {result.invoice && (() => {
                        const invoice = result.invoice;
                        return (
                            <div className="p-4 border-t border-neutral-100 space-y-4">
                                {/* Basic Info */}
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between py-2 border-b border-neutral-100">
                                        <span className="text-neutral-500">Invoice #</span>
                                        <span className="font-semibold text-neutral-900">{invoice.invoiceNumber}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-neutral-100">
                                        <span className="text-neutral-500">Issued By</span>
                                        <span className="font-semibold text-neutral-900">{invoice.sellerName}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-neutral-100">
                                        <span className="text-neutral-500">Issue Date</span>
                                        <span className="font-semibold text-neutral-900">{formatDate(invoice.issueDate)}</span>
                                    </div>
                                    {invoice.dueDate && (
                                        <div className="flex justify-between py-2 border-b border-neutral-100">
                                            <span className="text-neutral-500">Due Date</span>
                                            <span className="font-semibold text-neutral-900">{formatDate(invoice.dueDate)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Buyer Info */}
                                {invoice.buyer && (
                                    <div className="pt-2 border-t border-neutral-100">
                                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Bill To</p>
                                        <div className="space-y-1 text-sm">
                                            <p className="font-semibold text-neutral-900">{invoice.buyer.name}</p>
                                            {invoice.buyer.email && (
                                                <p className="text-neutral-600">{invoice.buyer.email}</p>
                                            )}
                                            {invoice.buyer.phone && (
                                                <p className="text-neutral-600">{invoice.buyer.phone}</p>
                                            )}
                                            {invoice.buyer.address && (
                                                <p className="text-neutral-600">{invoice.buyer.address}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Line Items */}
                                {invoice.items && invoice.items.length > 0 && (
                                    <div className="pt-2 border-t border-neutral-100">
                                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Items</p>
                                        <div className="space-y-2">
                                            {invoice.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-sm py-1.5 border-b border-neutral-50 last:border-0">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-neutral-900">{item.description}</p>
                                                        <p className="text-xs text-neutral-500">
                                                            {item.quantity} {item.unit} × {formatCurrency(item.unitPrice, invoice.currency)}
                                                            {item.taxRate > 0 && ` + ${item.taxRate}% tax`}
                                                            {item.discount > 0 && ` - ${formatCurrency(item.discount, invoice.currency)}`}
                                                        </p>
                                                    </div>
                                                    <span className="font-semibold text-neutral-900 ml-4">
                                                        {formatCurrency(item.amount, invoice.currency)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Financial Summary */}
                                <div className="pt-2 border-t border-neutral-100">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between py-1">
                                            <span className="text-neutral-500">Subtotal</span>
                                            <span className="font-medium text-neutral-900">
                                                {formatCurrency(invoice.subtotal, invoice.currency)}
                                            </span>
                                        </div>
                                        {invoice.taxAmount > 0 && (
                                            <div className="flex justify-between py-1">
                                                <span className="text-neutral-500">Tax</span>
                                                <span className="font-medium text-neutral-900">
                                                    {formatCurrency(invoice.taxAmount, invoice.currency)}
                                                </span>
                                            </div>
                                        )}
                                        {invoice.discountAmount > 0 && (
                                            <div className="flex justify-between py-1">
                                                <span className="text-neutral-500">Discount</span>
                                                <span className="font-medium text-neutral-900">
                                                    -{formatCurrency(invoice.discountAmount, invoice.currency)}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between py-2 border-t border-neutral-200 mt-2 pt-2">
                                            <span className="font-semibold text-neutral-900">Total</span>
                                            <span className="font-bold text-lg text-neutral-900">
                                                {formatCurrency(invoice.totalAmount, invoice.currency)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes & Terms */}
                                {(invoice.notes || invoice.terms) && (
                                    <div className="pt-2 border-t border-neutral-100 space-y-3">
                                        {invoice.notes && (
                                            <div>
                                                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">Notes</p>
                                                <p className="text-sm text-neutral-700">{invoice.notes}</p>
                                            </div>
                                        )}
                                        {invoice.terms && (
                                            <div>
                                                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">Terms</p>
                                                <p className="text-sm text-neutral-700">{invoice.terms}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Verification Badge */}
                                {result.status === 'VALID' && (
                                    <div className="pt-3 border-t border-neutral-100">
                                        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">
                                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                            <span className="font-medium">All invoice data cryptographically verified</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })()}

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
