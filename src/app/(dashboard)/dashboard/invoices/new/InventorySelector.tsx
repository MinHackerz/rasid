'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InventoryItem {
    id: string;
    description: string;
    note?: string;
    price: string;
    unit: string;
    taxRate: string;
    quantity: number;
}

interface InventorySelectorProps {
    inventory: InventoryItem[];
    value: string; // selected item ID
    onChange: (item: InventoryItem) => void;
    onManualSelect: () => void;
    className?: string;
    currencySymbol?: string; // Currency symbol to display
}

export default function InventorySelector({
    inventory,
    value,
    onChange,
    onManualSelect,
    className,
    currencySymbol = '₹'
}: InventorySelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedItem = inventory.find(i => i.id === value);

    // Handle click outside to close dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const getStockColor = (qty: number) => {
        if (qty === 0) return 'text-red-600';
        if (qty < 10) return 'text-amber-600';
        return 'text-emerald-600';
    };

    const getStockBg = (qty: number) => {
        if (qty === 0) return 'bg-red-50';
        if (qty < 10) return 'bg-amber-50';
        return 'bg-emerald-50';
    };

    return (
        <div className={cn("relative", className)} ref={containerRef}>
            {/* Trigger Button */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-10 px-3 pr-8 bg-white border border-neutral-200 rounded-xl text-sm flex items-center cursor-pointer hover:border-neutral-300 transition-colors"
            >
                {selectedItem ? (
                    <span className="truncate">{selectedItem.description} ({currencySymbol}{selectedItem.price})</span>
                ) : (
                    <span className="text-neutral-500">Select Product...</span>
                )}

                {selectedItem && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
                        <ChevronDown className="w-4 h-4" />
                    </div>
                )}
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute left-0 top-full mt-1 w-full min-w-[300px] z-50 bg-white/80 backdrop-blur-md border border-neutral-200 rounded-xl shadow-lg max-h-60 overflow-y-auto no-scrollbar">
                    <div className="p-1">
                        {inventory.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => {
                                    if (item.quantity > 0) {
                                        onChange(item);
                                        setIsOpen(false);
                                    }
                                }}
                                className={cn(
                                    "flex items-center justify-between p-2 rounded-lg transition-colors text-sm",
                                    item.quantity === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                                    item.id === value ? "bg-neutral-100" : (item.quantity > 0 ? "hover:bg-neutral-50" : "")
                                )}
                            >
                                <div className="flex flex-col">
                                    <span className="font-medium text-neutral-900">{item.description}</span>
                                    <span className="text-xs text-neutral-500">Price: {currencySymbol}{item.price} • Tax: {item.taxRate}%</span>
                                </div>

                                <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium", getStockBg(item.quantity))}>
                                    <span className={getStockColor(item.quantity)}>
                                        {item.quantity} in stock
                                    </span>
                                </div>
                            </div>
                        ))}

                        <div className="border-t border-neutral-100 my-1"></div>

                        <div
                            onClick={() => {
                                onManualSelect();
                                setIsOpen(false);
                            }}
                            className="p-2 rounded-lg cursor-pointer hover:bg-neutral-50 text-sm text-primary font-medium flex items-center gap-2"
                        >
                            <Package className="w-4 h-4" />
                            + Other (Manual Entry)
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
