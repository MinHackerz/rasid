'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface InvoiceSourceDropdownProps {
    currentSource: string;
    currentStatus: string;
    currentSearch: string;
}

export function InvoiceSourceDropdown({ currentSource, currentStatus, currentSearch }: InvoiceSourceDropdownProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const source = currentSource || 'MANUAL';
    const sources = [
        { value: 'MANUAL', label: 'Digital Invoices' },
        { value: 'OCR', label: 'Digitized Invoices' },
    ];

    const currentLabel = sources.find(s => s.value === source)?.label || 'Digital Invoices';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (value: string) => {
        setIsOpen(false);
        const params = new URLSearchParams();
        
        if (value !== 'MANUAL') {
            params.set('source', value);
        }
        
        if (currentStatus && currentStatus !== 'ALL') {
            params.set('status', currentStatus);
        }
        
        if (currentSearch) {
            params.set('search', currentSearch);
        }
        
        router.push(`/dashboard/invoices?${params.toString()}`);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center justify-between gap-1.5 px-2 py-1 text-sm font-medium",
                    "bg-white border border-neutral-200 rounded-lg",
                    "hover:bg-neutral-50 hover:border-neutral-300",
                    "transition-all duration-200",
                    "w-fit"
                )}
            >
                <span className="text-neutral-900 whitespace-nowrap">{currentLabel}</span>
                <ChevronDown className={cn(
                    "w-3.5 h-3.5 text-neutral-500 transition-transform duration-200 flex-shrink-0",
                    isOpen && "rotate-180"
                )} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white/80 backdrop-blur-md border border-neutral-200/50 rounded-lg shadow-lg z-50 overflow-hidden w-fit min-w-full">
                    {sources.map((item) => (
                        <button
                            key={item.value}
                            type="button"
                            onClick={() => handleSelect(item.value)}
                            className={cn(
                                "w-full px-2 py-1 text-sm font-medium text-left whitespace-nowrap",
                                "hover:bg-white/60 transition-colors",
                                source === item.value && "bg-white/80 text-neutral-900 font-semibold"
                            )}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
