'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { Copy, Check, ExternalLink } from 'lucide-react';

interface VerificationLinkProps {
    url: string;
}

export default function VerificationLink({ url }: VerificationLinkProps) {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <div className="flex-1 flex items-center gap-2 p-2.5 sm:p-3 bg-neutral-50 rounded-xl min-w-0">
                <ExternalLink className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                <code className="text-xs sm:text-sm text-neutral-700 truncate block">
                    {url}
                </code>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <Button
                    variant="outline"
                    className="flex-1 sm:w-10 sm:h-10 sm:px-0"
                    onClick={handleCopy}
                >
                    {isCopied ? (
                        <>
                            <Check className="w-4 h-4 text-emerald-600 sm:mr-0 mr-2" />
                            <span className="sm:hidden text-xs">Copied</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-4 h-4 sm:mr-0 mr-2" />
                            <span className="sm:hidden text-xs">Copy link</span>
                        </>
                    )}
                </Button>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                >
                    <Button variant="outline" className="w-full sm:w-10 sm:h-10 sm:px-0">
                        <ExternalLink className="w-4 h-4 sm:mr-0 mr-2" />
                        <span className="sm:hidden text-xs">Open link</span>
                    </Button>
                </a>
            </div>
        </div>
    );
}
