'use client';

import { useState } from 'react';
import { ProcessingStatus } from '@/types';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody, Button, FileUpload, FileWithPreview } from '@/components/ui';
import { Upload, FileText, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface UploadResultItem {
    id: string;
    name: string;
    status: ProcessingStatus;
}

export default function UploadPageClient() {
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResults, setUploadResults] = useState<UploadResultItem[]>([]);
    const router = useRouter();

    const handleUpload = async () => {
        if (files.length === 0) return;

        setIsUploading(true);
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to upload files');
            }

            toast.success('Files uploaded, processing...');

            // Initialize results with uploading state
            const initialResults: UploadResultItem[] = data.data.map((doc: { id: string; originalName: string }) => ({
                id: doc.id,
                name: doc.originalName,
                status: 'PROCESSING',
            }));
            setUploadResults(initialResults);

            // Start polling for each document
            initialResults.forEach((doc) => pollStatus(doc.id));
            setFiles([]); // Clear selection
            setIsUploading(false); // Reset uploading state

        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : 'Failed to upload files');
            setIsUploading(false);
        }
    };

    const pollStatus = async (documentId: string) => {
        const checkStatus = async () => {
            try {
                const response = await fetch(`/api/upload?documentId=${documentId}`);
                const data = await response.json();

                if (data.success) {
                    const status = data.data.processingStatus;

                    setUploadResults(prev => prev.map(item =>
                        item.id === documentId
                            ? { ...item, status }
                            : item
                    ));

                    if (status === 'COMPLETED' || status === 'REVIEW_NEEDED') {
                        toast.success('Document processed successfully');
                        return; // Stop polling
                    } else if (status === 'FAILED') {
                        toast.error('Document processing failed');
                        return; // Stop polling
                    }
                }
            } catch (error) {
                console.error('Polling error:', error);
            }

            // Continue polling
            setTimeout(checkStatus, 2000);
        };

        // Start first check
        checkStatus();
    };

    const handleCreateInvoice = (documentId: string) => {
        router.push(`/dashboard/invoices/new?fromUpload=${documentId}`);
    };

    return (
        <div className="space-y-6 animate-enter">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Upload & Convert</h1>
                <p className="text-muted-foreground mt-2">
                    Upload your invoices to automatically extract data and convert them to digital format.
                </p>
            </div>

            <Card className="border-2 border-dashed border-muted bg-muted/5">
                <CardBody className="p-8">
                    {uploadResults.length === 0 ? (
                        <>
                            <FileUpload
                                onFilesSelect={(newFiles) => setFiles(prev => [...prev, ...newFiles])}
                                maxFiles={5}
                                maxSize={5 * 1024 * 1024} // 5MB
                                accept={{ 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'] }}
                                className="mb-4"
                                disabled={isUploading}
                            />

                            <div className="space-y-4">
                                {files.map((file, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-neutral-400" />
                                            <span className="text-sm font-medium">{file.name}</span>
                                            <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(0)} KB)</span>
                                        </div>
                                        <button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700">
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 flex justify-end">
                                <Button
                                    onClick={handleUpload}
                                    disabled={files.length === 0 || isUploading}
                                    className="gap-2"
                                >
                                    {isUploading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Upload className="w-4 h-4" />
                                    )}
                                    {isUploading ? 'Uploading...' : 'Upload & Convert'}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-lg">Processing Results</h3>
                                <Button variant="outline" size="sm" onClick={() => setUploadResults([])}>
                                    Upload More
                                </Button>
                            </div>
                            {uploadResults.map((result) => (
                                <div key={result.id} className="flex items-center justify-between p-4 bg-white rounded-xl border shadow-sm animate-in fade-in slide-in-from-bottom-2">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${result.status === 'COMPLETED' ? 'bg-green-100 text-green-600' :
                                            result.status === 'FAILED' ? 'bg-red-100 text-red-600' :
                                                'bg-blue-100 text-blue-600'
                                            }`}>
                                            {result.status === 'COMPLETED' ? <FileText className="w-5 h-5" /> :
                                                result.status === 'FAILED' ? <AlertCircle className="w-5 h-5" /> :
                                                    <Loader2 className="w-5 h-5 animate-spin" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{result.name}</p>
                                            <p className="text-xs text-muted-foreground capitalize">
                                                {result.status === 'PROCESSING' ? 'Analyzing...' :
                                                    result.status === 'REVIEW_NEEDED' ? 'Review Needed' :
                                                        result.status.toLowerCase()}
                                            </p>
                                        </div>
                                    </div>

                                    {(result.status === 'COMPLETED' || result.status === 'REVIEW_NEEDED') && (
                                        <Button
                                            size="sm"
                                            className="gap-2"
                                            onClick={() => handleCreateInvoice(result.id)}
                                        >
                                            Create Invoice <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    )}

                                    {result.status === 'FAILED' && (
                                        <span className="text-sm text-red-500">Processing Failed</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardBody>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
                <Card>
                    <CardBody className="p-6 space-y-2">
                        <div className="p-3 bg-blue-500/10 text-blue-600 rounded-lg w-fit">
                            <Upload className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold">1. Upload</h3>
                        <p className="text-sm text-muted-foreground">Upload your scanned/PDF invoices or receipts.</p>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="p-6 space-y-2">
                        <div className="p-3 bg-purple-500/10 text-purple-600 rounded-lg w-fit">
                            <Loader2 className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold">2. Process</h3>
                        <p className="text-sm text-muted-foreground">AI extracts data like date, total, and items.</p>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="p-6 space-y-2">
                        <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-lg w-fit">
                            <FileText className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold">3. Review</h3>
                        <p className="text-sm text-muted-foreground">Verify extracted data and save as invoice.</p>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
