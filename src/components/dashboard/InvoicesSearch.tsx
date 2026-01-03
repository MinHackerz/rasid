'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useState, useEffect, useTransition } from 'react';
import { cn } from '@/lib/utils';

interface InvoicesSearchProps {
    initialSearch?: string;
    status?: string;
    source?: string;
}

export function InvoicesSearch({ initialSearch = '', status, source }: InvoicesSearchProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState(initialSearch);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        setSearch(initialSearch);
    }, [initialSearch]);

    const handleSearch = (value: string) => {
        setSearch(value);
        
        startTransition(() => {
            const params = new URLSearchParams(searchParams.toString());
            
            if (value.trim()) {
                params.set('search', value.trim());
            } else {
                params.delete('search');
            }
            
            // Preserve status and source filters (only add source if not default MANUAL)
            if (status && status !== 'ALL') {
                params.set('status', status);
            }
            if (source && source !== 'MANUAL') {
                params.set('source', source);
            }
            
            router.push(`/dashboard/invoices?${params.toString()}`);
        });
    };

    const clearSearch = () => {
        setSearch('');
        handleSearch('');
    };

    return (
        <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
            <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by invoice number or buyer name..."
                className={cn(
                    "w-full pl-10 pr-10 py-3 text-sm bg-white border border-neutral-200 rounded-xl",
                    "placeholder:text-neutral-400",
                    "focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-neutral-900",
                    "transition-all duration-200",
                    isPending && "opacity-70"
                )}
            />
            {search && (
                <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100 transition-colors"
                    aria-label="Clear search"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
