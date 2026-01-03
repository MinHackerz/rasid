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
        <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 p-3 bg-neutral-50 rounded-xl">
                <ExternalLink className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                <code className="text-sm text-neutral-700 truncate">{url}</code>
            </div>
            <Button variant="outline" size="icon" onClick={handleCopy}>
                {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </Button>
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
            >
                <Button variant="outline" size="icon">
                    <ExternalLink className="w-4 h-4" />
                </Button>
            </a>
        </div>
    );
}
