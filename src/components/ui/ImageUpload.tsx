'use client';

import React, { useRef, useState } from 'react';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ImageUploadProps {
    value?: string | null;
    onChange: (value: string) => void;
    onRemove: () => void;
    label?: string;
    className?: string;
    previewClassName?: string;
    disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    value,
    onChange,
    onRemove,
    label = "Upload Image",
    className,
    previewClassName,
    disabled = false
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file (JPG, PNG, WebP)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB
            setError('Image must be less than 5MB');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Convert to Base64
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                onChange(base64String);
                setLoading(false);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error('Error reading file:', err);
            setError('Failed to process image');
            setLoading(false);
        }
    };

    const triggerUpload = () => {
        if (disabled || loading) return;
        fileInputRef.current?.click();
    };

    return (
        <div className={cn('space-y-4', className)}>
            <div>
                <p className="block text-sm font-medium text-neutral-700 mb-2">{label}</p>
                <div className="flex flex-col gap-4">
                    {/* Preview Circle */}
                    <div
                        onClick={triggerUpload}
                        className={cn(
                            "relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-dashed transition-all duration-200 group cursor-pointer",
                            error ? "border-red-300 bg-red-50" : "border-neutral-200 bg-neutral-50 hover:border-neutral-300 hover:bg-neutral-100",
                            disabled && "opacity-60 cursor-not-allowed",
                            previewClassName
                        )}
                    >
                        {loading ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                                <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
                            </div>
                        ) : value ? (
                            <>
                                <div className="relative w-full h-full">
                                    <Image
                                        src={value}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                    />
                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Upload className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400 group-hover:text-neutral-500 transition-colors">
                                <ImageIcon className="w-8 h-8 mb-1" />
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="space-y-3">
                        <div>
                            {/* <p className="font-medium text-neutral-900">{label}</p> */}
                            <p className="text-xs text-neutral-500">Recommended size 400x400px</p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={triggerUpload}
                                disabled={disabled || loading}
                                className="text-sm font-medium text-neutral-900 hover:text-neutral-700 disabled:opacity-50"
                            >
                                {value ? 'Change Logo' : 'Upload Logo'}
                            </button>
                            {value && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                                    disabled={disabled}
                                    className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                        {error && (
                            <p className="text-xs text-red-600 font-medium">{error}</p>
                        )}
                    </div>
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
                disabled={disabled}
            />
        </div>
    );
};

export { ImageUpload };
