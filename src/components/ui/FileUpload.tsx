'use client';

import React, { useCallback } from 'react';
import { useDropzone, Accept } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Upload, FileText, ImageIcon, X, Loader2, CheckCircle2 } from 'lucide-react';
import { formatFileSize } from '@/lib/utils';

interface FileWithPreview extends File {
    preview?: string;
}

interface FileUploadProps {
    onFilesSelect: (files: File[]) => void;
    accept?: Accept;
    maxFiles?: number;
    maxSize?: number;
    disabled?: boolean;
    uploading?: boolean;
    className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
    onFilesSelect,
    accept = {
        'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
        'application/pdf': ['.pdf'],
    },
    maxFiles = 10,
    maxSize = 10 * 1024 * 1024, // 10MB
    disabled = false,
    uploading = false,
    className,
}) => {
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            onFilesSelect(acceptedFiles);
        },
        [onFilesSelect]
    );

    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
        onDrop,
        accept,
        maxFiles,
        maxSize,
        disabled: disabled || uploading,
    });

    return (
        <div className={className}>
            <div
                {...getRootProps()}
                className={cn(
                    'relative rounded-xl border-2 border-dashed p-4 sm:p-8',
                    'transition-all duration-300 ease-out cursor-pointer',
                    'bg-gradient-to-b from-neutral-50/50 to-transparent',
                    'group',
                    isDragActive
                        ? 'border-neutral-900 bg-neutral-50 scale-[1.01]'
                        : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50',
                    (disabled || uploading) && 'opacity-50 cursor-not-allowed'
                )}
            >
                <input {...getInputProps()} />

                <div className="flex flex-col items-center text-center">
                    {/* Icon */}
                    <div
                        className={cn(
                            'w-14 h-14 rounded-2xl flex items-center justify-center mb-4',
                            'transition-all duration-300',
                            isDragActive
                                ? 'bg-neutral-900 text-white scale-110'
                                : 'bg-neutral-100 text-neutral-400 group-hover:bg-neutral-200 group-hover:text-neutral-500'
                        )}
                    >
                        {uploading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <Upload className={cn(
                                'w-6 h-6 transition-transform duration-300',
                                isDragActive && '-translate-y-1'
                            )} />
                        )}
                    </div>

                    {/* Text */}
                    <div className="space-y-1.5">
                        <p className="text-sm font-medium text-neutral-700">
                            {isDragActive ? (
                                'Drop your files here'
                            ) : (
                                <>
                                    <span className="text-neutral-900">Drop files here</span>
                                    {' '}or click to browse
                                </>
                            )}
                        </p>
                        <p className="text-xs text-neutral-500">
                            Up to {maxFiles} files, {formatFileSize(maxSize)} each
                        </p>
                    </div>

                    {/* File Types */}
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-neutral-100">
                        <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                            <div className="p-1.5 bg-neutral-100 rounded">
                                <ImageIcon className="w-3.5 h-3.5" />
                            </div>
                            <span>JPG, PNG, WebP</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                            <div className="p-1.5 bg-neutral-100 rounded">
                                <FileText className="w-3.5 h-3.5" />
                            </div>
                            <span>PDF</span>
                        </div>
                    </div>
                </div>

                {/* Drag Active Overlay */}
                {isDragActive && (
                    <div className="absolute inset-0 rounded-xl bg-neutral-900/5 pointer-events-none" />
                )}
            </div>

            {/* Rejections */}
            {fileRejections.length > 0 && (
                <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg">
                    {fileRejections.map(({ file, errors }) => (
                        <div key={file.name} className="text-sm text-red-600 flex items-start gap-2">
                            <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>
                                <span className="font-medium">{file.name}:</span>{' '}
                                {errors.map((e) => e.message).join(', ')}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ============================================
// File Preview List
// ============================================
interface FilePreviewProps {
    files: FileWithPreview[];
    onRemove: (index: number) => void;
    processing?: boolean[];
}

const FilePreviewList: React.FC<FilePreviewProps> = ({ files, onRemove, processing = [] }) => {
    if (files.length === 0) return null;

    return (
        <div className="mt-5 space-y-2">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-3">
                {files.length} {files.length === 1 ? 'file' : 'files'} selected
            </p>
            {files.map((file, index) => (
                <div
                    key={`${file.name}-${index}`}
                    className={cn(
                        'flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl',
                        'bg-white border border-neutral-200',
                        'transition-all duration-200',
                        'hover:border-neutral-300 hover:shadow-sm',
                        'group'
                    )}
                >
                    {/* Icon */}
                    <div className="flex-shrink-0">
                        <div className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center',
                            file.type.startsWith('image/')
                                ? 'bg-purple-50 text-purple-500'
                                : 'bg-blue-50 text-blue-500'
                        )}>
                            {file.type.startsWith('image/') ? (
                                <ImageIcon className="w-5 h-5" />
                            ) : (
                                <FileText className="w-5 h-5" />
                            )}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 truncate">
                            {file.name}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                            {formatFileSize(file.size)}
                        </p>
                    </div>

                    {/* Status / Action */}
                    {processing[index] ? (
                        <div className="flex items-center gap-2 text-neutral-500">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-xs">Processing...</span>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => onRemove(index)}
                            className={cn(
                                'p-2 rounded-lg transition-all duration-200',
                                'text-neutral-400 hover:text-red-600 hover:bg-red-50',
                                'opacity-0 group-hover:opacity-100'
                            )}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

// ============================================
// Upload Progress Card
// ============================================
interface UploadProgressProps {
    fileName: string;
    progress: number;
    status: 'uploading' | 'processing' | 'complete' | 'error';
    error?: string;
}

const UploadProgress: React.FC<UploadProgressProps> = ({
    fileName,
    progress,
    status,
    error
}) => {
    const statusConfig = {
        uploading: {
            icon: <Loader2 className="w-4 h-4 animate-spin" />,
            text: 'Uploading...',
            color: 'text-neutral-600',
            bgColor: 'bg-neutral-100',
        },
        processing: {
            icon: <Loader2 className="w-4 h-4 animate-spin" />,
            text: 'Processing with AI...',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        complete: {
            icon: <CheckCircle2 className="w-4 h-4" />,
            text: 'Complete',
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
        },
        error: {
            icon: <X className="w-4 h-4" />,
            text: error || 'Error',
            color: 'text-red-600',
            bgColor: 'bg-red-50',
        },
    };

    const config = statusConfig[status];

    return (
        <div className="p-4 bg-white border border-neutral-200 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
                <div className={cn('p-2 rounded-lg', config.bgColor, config.color)}>
                    {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">{fileName}</p>
                    <p className={cn('text-xs', config.color)}>{config.text}</p>
                </div>
            </div>

            {/* Progress Bar */}
            {(status === 'uploading' || status === 'processing') && (
                <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                        className={cn(
                            'h-full rounded-full transition-all duration-500',
                            status === 'processing' ? 'bg-blue-500' : 'bg-neutral-900'
                        )}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </div>
    );
};

export { FileUpload, FilePreviewList, UploadProgress };
export type { FileWithPreview };
