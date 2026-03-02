'use client';

import { useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { BuyerCard } from '@/components/dashboard/BuyerCard';

interface BuyersClientProps {
    buyers: any[];
}

export function BuyersClient({ buyers }: BuyersClientProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <div className="flex bg-neutral-100 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'grid'
                                ? 'bg-white shadow-sm text-neutral-900'
                                : 'text-neutral-500 hover:text-neutral-700'
                            }`}
                        title="Grid View"
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'list'
                                ? 'bg-white shadow-sm text-neutral-900'
                                : 'text-neutral-500 hover:text-neutral-700'
                            }`}
                        title="List View"
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-3"}>
                {buyers.map((buyer: any) => (
                    <BuyerCard key={buyer.id} buyer={buyer} variant={viewMode} />
                ))}
            </div>
        </div>
    );
}
