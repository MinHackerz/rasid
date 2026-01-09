'use client';

import { Copy } from 'lucide-react';
import { toast } from 'sonner';

interface EndpointProps {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    path: string;
    description?: string;
}

const methodColors = {
    GET: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    POST: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    PUT: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    DELETE: 'bg-red-500/10 text-red-500 border-red-500/20',
    PATCH: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
};

export function Endpoint({ method, path, description }: EndpointProps) {
    const handleCopy = () => {
        navigator.clipboard.writeText(`https://rasid.in${path}`);
        toast.success('Endpoint URL copied');
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3 font-mono text-sm max-w-full overflow-hidden">
                <div className={`px-2.5 py-1 rounded-md font-bold border ${methodColors[method]} shrink-0`}>
                    {method}
                </div>
                <div
                    onClick={handleCopy}
                    className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-md text-neutral-600 border border-neutral-200 cursor-pointer hover:bg-white hover:border-neutral-300 hover:shadow-sm transition-all group"
                >
                    <span className="truncate">https://rasid.in{path}</span>
                    <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity" />
                </div>
            </div>
            {description && (
                <p className="text-neutral-600 text-sm leading-relaxed">
                    {description}
                </p>
            )}
        </div>
    );
}
