import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { getInvoice } from '@/lib/services';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardHeader, CardBody, Badge, Button } from '@/components/ui';
import { ArrowLeft, Download, Printer, ExternalLink, Copy, QrCode, CheckCircle2 } from 'lucide-react';
import InvoiceControls from '@/components/invoice/InvoiceControls';
import VerificationLink from '@/components/invoice/VerificationLink';
import InvoiceRenderer from '@/components/invoice/InvoiceRenderer';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: PageProps) {
    const session = await getSession();
    if (!session) return null;

    const { id } = await params;
    const invoice = await getInvoice(id, session.sellerId);

    if (!invoice) {
        notFound();
    }



    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify/${invoice.verificationHash}`;

    // Fetch seller settings to check auto-send preference
    const sellerSettings = await import('@/lib/prisma').then(m => m.prisma.seller.findUnique({
        where: { id: session.sellerId },
        select: {
            invoiceDefaults: true,
            businessName: true,
            businessAddress: true,
            phone: true,
            email: true,
            logo: true,
            taxId: true,
            plan: true
        } as any
    })) as any;

    // Check if auto-send is enabled
    const autoSendEnabled = (sellerSettings?.invoiceDefaults as any)?.autoSend === true;
    const isFreePlan = sellerSettings?.plan === 'FREE';

    // Check buyer contact info availability
    const hasWhatsApp = Boolean(invoice.buyer?.phone);
    const hasEmail = Boolean(invoice.buyer?.email);
    // Hide buttons if auto-send is enabled (as requested)
    const showSendButtons = !autoSendEnabled;

    // Resolve Seller Details (Override Logic for Digitized Invoices)
    const isOCR = invoice.sourceType === 'OCR';
    const extractedData = (isOCR && invoice.sourceDocument?.extractedData)
        ? (invoice.sourceDocument.extractedData as any)
        : null;

    // Check if user chose "Use My Business Profile"
    const useProfile = extractedData?.useProfile === true;
    const shouldUseExtracted = isOCR && !useProfile;

    const extractedSeller = extractedData?.seller || {};

    // STRICT OVERRIDE LOGIC:
    // If shouldUseExtracted (i.e., isOCR && !useProfile), we MUST show extracted details, even if empty.
    // We only show Profile Data (from sellerSettings) if useProfile is TRUE (or if not OCR).

    const sellerName = shouldUseExtracted ? (extractedSeller.businessName || extractedData?.sellerName || '') : (sellerSettings?.businessName || '');
    const sellerAddress = shouldUseExtracted ? (extractedSeller.businessAddress || extractedData?.sellerAddress || null) : (sellerSettings?.businessAddress || null);
    const sellerPhone = shouldUseExtracted ? (extractedSeller.phone || extractedData?.sellerPhone || null) : (sellerSettings?.phone || null);
    const sellerEmail = shouldUseExtracted ? (extractedSeller.email || extractedData?.sellerEmail || '') : (sellerSettings?.email || '');
    const sellerTaxId = shouldUseExtracted ? (extractedSeller.taxId || extractedData?.sellerTaxId || null) : (sellerSettings?.taxId || null);

    // Logo logic follows same strictness
    // If using extracted, show extracted logo (likely null) or nothing.
    // If using profile, show profile logo.
    const showLogo = !shouldUseExtracted;
    const logoUrl = showLogo ? (sellerSettings?.logo || null) : null;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/invoices"
                        className="p-2.5 hover:bg-neutral-100 rounded-xl transition-colors text-neutral-500 hover:text-neutral-900"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
                                {invoice.invoiceNumber}
                            </h1>
                        </div>
                        <p className="text-neutral-500 text-sm mt-0.5">
                            Created on {formatDate(invoice.createdAt)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <InvoiceControls
                        invoiceId={invoice.id}
                        initialStatus={invoice.status}
                        hasWhatsApp={hasWhatsApp}
                        hasEmail={hasEmail}
                        showSendButtons={showSendButtons}
                        isFreePlan={isFreePlan}
                    />
                    <a
                        href={`/api/invoices/${invoice.id}/pdf`}
                        className="inline-flex items-center gap-2 px-3 py-2 h-9 text-sm font-medium border border-neutral-900 rounded-lg bg-white hover:bg-neutral-50 transition-colors"
                    >
                        <Download className="w-4 h-4 text-neutral-500" />
                        Download
                    </a>
                </div>
            </div>

            {/* Invoice Preview - PDF Style */}
            <Card className="shadow-lg border-neutral-200">
                <CardBody className="p-0">
                    <InvoiceRenderer
                        invoice={invoice}
                        templateId={(sellerSettings?.invoiceDefaults as any)?.templateId}
                        businessProfile={{
                            name: sellerName,
                            address: sellerAddress,
                            phone: sellerPhone,
                            email: sellerEmail,
                            logo: logoUrl,
                            taxId: sellerTaxId
                        }}
                    />
                </CardBody>
            </Card>

            {/* Verification Section */}
            <Card>
                <CardHeader
                    title="Invoice Verification"
                    description="Share this link to let anyone verify this invoice's authenticity"
                />
                <CardBody>
                    <div className="flex items-center gap-4">
                        {/* QR Code Placeholder */}
                        <div className="w-24 h-24 bg-neutral-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <QrCode className="w-12 h-12 text-neutral-300" />
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span className="text-sm font-medium text-emerald-700">Cryptographically Signed</span>
                            </div>
                            <VerificationLink url={verificationUrl} />
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
