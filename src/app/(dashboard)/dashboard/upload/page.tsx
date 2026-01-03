'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileUpload, FilePreviewList, Card, CardHeader, CardBody, Button, Badge } from '@/components/ui';
import { ArrowLeft, ArrowRight, Check, AlertCircle, Loader2, Sparkles, FileText, Zap } from 'lucide-react';
import Link from 'next/link';
import type { FileWithPreview } from '@/components/ui/FileUpload';

interface UploadedDoc {
    id: string;
    originalName: string;
    processingStatus: string;
    extractedData?: {
        invoiceNumber?: string;
        invoiceDate?: string;
        totalAmount?: number;
        items: Array<{ name: string; quantity?: number; amount?: number }>;
        confidence: number;
    };
}

export default function UploadPage() {
    const router = useRouter();
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
    const [error, setError] = useState('');
    const [step, setStep] = useState<'upload' | 'processing' | 'review'>('upload');

    const handleFilesSelect = (newFiles: File[]) => {
        setFiles((prev) => [...prev, ...newFiles] as FileWithPreview[]);
        setError('');
    };

    const handleRemoveFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            setError('Please select at least one file');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const formData = new FormData();
            files.forEach((file) => {
                formData.append('files', file);
            });

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            setUploadedDocs(data.data);
            setStep('processing');

            pollProcessingStatus(data.data.map((d: UploadedDoc) => d.id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const pollProcessingStatus = async (docIds: string[]) => {
        const checkStatus = async () => {
            const results = await Promise.all(
                docIds.map(async (id) => {
                    const res = await fetch(`/api/upload?documentId=${id}`);
                    return res.json();
                })
            );

            const updatedDocs = results.map((r) => r.data);
            setUploadedDocs(updatedDocs);

            const allDone = updatedDocs.every(
                (d: UploadedDoc) => d.processingStatus !== 'PENDING' && d.processingStatus !== 'PROCESSING'
            );

            if (allDone) {
                setStep('review');
            } else {
                setTimeout(() => checkStatus(), 2000);
            }
        };

        await checkStatus();
    };

    const handleCreateInvoice = async (doc: UploadedDoc) => {
        router.push(`/dashboard/invoices/new?fromUpload=${doc.id}`);
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'PENDING':
                return { variant: 'warning' as const, label: 'Waiting', icon: Clock };
            case 'PROCESSING':
                return { variant: 'pending' as const, label: 'Processing', icon: Loader2 };
            case 'COMPLETED':
                return { variant: 'success' as const, label: 'Complete', icon: Check };
            case 'REVIEW_NEEDED':
                return { variant: 'warning' as const, label: 'Review Needed', icon: AlertCircle };
            case 'FAILED':
                return { variant: 'error' as const, label: 'Failed', icon: AlertCircle };
            default:
                return { variant: 'default' as const, label: status, icon: FileText };
        }
    };

    const Clock = Loader2;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard"
                    className="p-2.5 hover:bg-neutral-100 rounded-xl transition-colors text-neutral-500 hover:text-neutral-900"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
                        Upload & Convert
                    </h1>
                    <p className="text-neutral-500 mt-0.5">
                        Transform handwritten invoices into digital format using AI
                    </p>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center py-4 px-2 overflow-x-auto">
                {['Upload', 'Processing', 'Review'].map((label, index) => {
                    const stepMap = { 0: 'upload', 1: 'processing', 2: 'review' };
                    const currentStep = stepMap[index as keyof typeof stepMap];
                    const isActive = step === currentStep;
                    const isPast =
                        (step === 'processing' && index === 0) ||
                        (step === 'review' && (index === 0 || index === 1));

                    return (
                        <div key={label} className="flex items-center shrink-0">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div
                                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-300 ${isPast
                                        ? 'bg-emerald-500 text-white shadow-sm'
                                        : isActive
                                            ? 'bg-neutral-900 text-white shadow-md scale-110'
                                            : 'bg-neutral-100 text-neutral-400'
                                        }`}
                                >
                                    {isPast ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : index + 1}
                                </div>
                                <span
                                    className={`text-xs sm:text-sm font-medium transition-colors ${isActive || isPast ? 'text-neutral-900' : 'text-neutral-400'
                                        } ${!isActive && !isPast ? 'hidden sm:block' : ''}`}
                                >
                                    {label}
                                </span>
                            </div>
                            {index < 2 && (
                                <div
                                    className={`w-8 sm:w-20 h-0.5 mx-2 sm:mx-4 rounded-full transition-colors ${isPast ? 'bg-emerald-500' : 'bg-neutral-200'
                                        }`}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-4 h-4" />
                    </div>
                    <span>{error}</span>
                </div>
            )}

            {/* Step 1: Upload */}
            {step === 'upload' && (
                <Card>
                    <CardHeader
                        title="Upload Handwritten Invoices"
                        description="Drag and drop images or PDFs of your handwritten invoices"
                    />
                    <CardBody className="space-y-6">
                        <FileUpload
                            onFilesSelect={handleFilesSelect}
                            maxFiles={10}
                            uploading={uploading}
                        />

                        <FilePreviewList files={files} onRemove={handleRemoveFile} />

                        {files.length > 0 && (
                            <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                                <p className="text-sm text-neutral-500">
                                    {files.length} {files.length === 1 ? 'file' : 'files'} ready for processing
                                </p>
                                <Button onClick={handleUpload} loading={uploading}>
                                    <Sparkles className="w-4 h-4" />
                                    Process with AI
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </CardBody>
                </Card>
            )}

            {/* Step 2: Processing */}
            {step === 'processing' && (
                <Card>
                    <CardHeader
                        title="AI is analyzing your invoices"
                        description="This usually takes a few seconds per document"
                    />
                    <CardBody>
                        <div className="space-y-3">
                            {uploadedDocs.map((doc, index) => {
                                if (!doc) return null;
                                const config = getStatusConfig(doc.processingStatus);
                                const isProcessing = doc.processingStatus === 'PROCESSING' || doc.processingStatus === 'PENDING';

                                return (
                                    <div
                                        key={doc.id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-neutral-50 rounded-xl animate-slide-up gap-4 sm:gap-0"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <div className="flex items-start sm:items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isProcessing
                                                ? 'bg-blue-100 text-blue-600'
                                                : doc.processingStatus === 'COMPLETED'
                                                    ? 'bg-emerald-100 text-emerald-600'
                                                    : 'bg-red-100 text-red-600'
                                                }`}>
                                                {isProcessing ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : doc.processingStatus === 'COMPLETED' ? (
                                                    <Check className="w-5 h-5" />
                                                ) : (
                                                    <AlertCircle className="w-5 h-5" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-neutral-900 truncate">{doc.originalName}</p>
                                                <p className="text-xs text-neutral-500">
                                                    {isProcessing
                                                        ? 'Extracting data...'
                                                        : doc.processingStatus === 'COMPLETED'
                                                            ? 'Ready for review'
                                                            : 'Processing failed'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex sm:block justify-end">
                                            <Badge variant={config.variant} dot>
                                                {config.label}
                                            </Badge>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Processing Animation */}
                        <div className="mt-8 flex flex-col items-center py-8">
                            <div className="relative w-16 h-16 mb-4">
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 animate-pulse opacity-20" />
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                    <Zap className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <p className="text-sm font-medium text-neutral-900">AI Processing</p>
                            <p className="text-xs text-neutral-500 mt-1">Powered by advanced OCR technology</p>
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Step 3: Review */}
            {step === 'review' && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader
                            title="Review Extracted Data"
                            description="Verify the data and create digital invoices"
                        />
                        <CardBody className="p-0">
                            <div className="divide-y divide-neutral-100">
                                {uploadedDocs.map((doc) => {
                                    const config = getStatusConfig(doc.processingStatus);

                                    return (
                                        <div key={doc.id} className="p-4 sm:p-6">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-5 gap-4 sm:gap-0">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
                                                        <FileText className="w-6 h-6 text-neutral-400" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-semibold text-neutral-900 truncate pr-2">{doc.originalName}</h3>
                                                        <p className="text-sm text-neutral-500 mt-0.5">
                                                            {doc.processingStatus === 'COMPLETED'
                                                                ? `${((doc.extractedData?.confidence || 0) * 100).toFixed(0)}% confidence`
                                                                : doc.processingStatus === 'FAILED'
                                                                    ? 'Processing failed'
                                                                    : 'Needs review'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex sm:block justify-end">
                                                    <Badge variant={config.variant} dot>
                                                        {config.label}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {doc.extractedData && doc.processingStatus !== 'FAILED' && (
                                                <div className="bg-neutral-50 rounded-xl p-5 mb-5">
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-5">
                                                        <div>
                                                            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">
                                                                Invoice #
                                                            </p>
                                                            <p className="font-semibold text-neutral-900">
                                                                {doc.extractedData.invoiceNumber || '—'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">
                                                                Date
                                                            </p>
                                                            <p className="font-semibold text-neutral-900">
                                                                {doc.extractedData.invoiceDate || '—'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">
                                                                Total
                                                            </p>
                                                            <p className="font-bold text-lg text-neutral-900 tabular-nums">
                                                                {doc.extractedData.totalAmount
                                                                    ? `₹${doc.extractedData.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                                                                    : '—'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {doc.extractedData.items.length > 0 && (
                                                        <div className="border-t border-neutral-200 pt-4">
                                                            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-3">
                                                                Line Items ({doc.extractedData.items.length})
                                                            </p>
                                                            <div className="space-y-2">
                                                                {doc.extractedData.items.slice(0, 3).map((item, idx) => (
                                                                    <div key={idx} className="flex justify-between text-sm">
                                                                        <span className="text-neutral-700">{item.name}</span>
                                                                        <span className="font-medium text-neutral-900 tabular-nums">
                                                                            {item.quantity && `${item.quantity} × `}
                                                                            {item.amount && `₹${item.amount.toLocaleString('en-IN')}`}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                                {doc.extractedData.items.length > 3 && (
                                                                    <p className="text-xs text-neutral-400">
                                                                        +{doc.extractedData.items.length - 3} more items
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <Button
                                                    onClick={() => handleCreateInvoice(doc)}
                                                    disabled={doc.processingStatus === 'FAILED'}
                                                    className="w-full sm:w-auto justify-center"
                                                >
                                                    Create Invoice
                                                    <ArrowRight className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handleCreateInvoice(doc)}
                                                    className="w-full sm:w-auto justify-center"
                                                >
                                                    Edit Data
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardBody>
                    </Card>

                    <div className="flex justify-between">
                        <Button variant="outline" onClick={() => setStep('upload')}>
                            <ArrowLeft className="w-4 h-4" />
                            Upload More
                        </Button>
                        <Link href="/dashboard/invoices" className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">
                            View All Invoices
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
