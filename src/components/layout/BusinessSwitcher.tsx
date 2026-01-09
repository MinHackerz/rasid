'use client';

import * as React from 'react';
import { ChevronDown, Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { switchBusiness } from '@/lib/actions';

interface Business {
    id: string;
    businessName: string | null;
}

interface BusinessSwitcherProps {
    currentBusinessName: string | null;
    businesses: Business[];
    className?: string; // Add className prop for flexibility
}

export function BusinessSwitcher({ currentBusinessName, businesses, className }: BusinessSwitcherProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const router = useRouter();

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSwitch = async (id: string) => {
        setIsOpen(false);
        await switchBusiness(id);
        // Force refresh to ensure server components update with new cookie
        // Using window.location.reload() might be harsh but ensures complete state reset.
        // router.refresh() updates server components but client state might persist. 
        // Given we are changing the 'active' business for the whole dashboard, a soft refresh is usually enough if the layout re-renders.
        router.refresh();
    };

    const currentBusiness = businesses.find(b => b.businessName === currentBusinessName);
    const canAddBusiness = !currentBusiness || (currentBusiness as any).role === 'OWNER' || !(currentBusiness as any).role;

    return (
        <div className={cn("relative px-4 py-6", className)} ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-card hover:bg-accent/5 rounded-xl border border-border/50 hover:border-border transition-all duration-200 group shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 min-w-[32px] bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center text-xs font-bold text-primary-foreground shadow-inner">
                        {(currentBusinessName || 'M').charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left overflow-hidden">
                        <p className="text-sm font-semibold text-foreground truncate block max-w-[120px]">
                            {currentBusinessName || 'My Business'}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Business</p>
                    </div>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-muted-foreground group-hover:text-foreground transition-transform duration-200 shrink-0", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div
                    className="absolute top-[85px] left-4 right-4 w-auto min-w-[220px] p-1.5 bg-white border border-border/50 rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                    style={{ backgroundColor: '#ffffff', opacity: 1 }}
                >
                    <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
                        <p className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            My Businesses
                        </p>
                        {businesses.map((business) => (
                            <button
                                key={business.id}
                                onClick={() => handleSwitch(business.id)}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-all mb-1",
                                    business.businessName === currentBusinessName
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "text-foreground hover:bg-accent/50"
                                )}
                            >
                                <span className="truncate">{business.businessName || 'Unnamed Business'}</span>
                                {business.businessName === currentBusinessName && (
                                    <Check className="w-4 h-4 ml-2" />
                                )}
                            </button>
                        ))}
                    </div>
                    {canAddBusiness && (
                        <div className="border-t border-border/50 mt-1 pt-2">
                            <button
                                onClick={() => router.push('/onboarding')}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors border border-dashed border-border/50 hover:border-primary/30"
                            >
                                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                                    <Plus className="w-3 h-3" />
                                </div>
                                <span>Add New Business</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
