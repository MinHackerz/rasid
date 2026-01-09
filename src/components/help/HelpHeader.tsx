'use client';

import Link from 'next/link';
import { HelpCircle, ArrowLeft, Search, X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { helpContent } from '@/lib/help-content';

export function HelpHeader() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false); // Mobile search state

    const filteredResults = searchQuery.trim()
        ? helpContent.flatMap(section =>
            section.subsections
                .filter(sub =>
                    sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    sub.content.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(sub => ({
                    ...sub,
                    sectionId: section.id,
                    sectionTitle: section.title
                }))
        )
        : [];

    return (
        <header className="border-b border-neutral-200/50 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
            <div className="container-app">
                <div className="flex items-center justify-between py-4">
                    {!isSearchOpen ? (
                        <div className="flex items-center gap-4">
                            <Link
                                href="/"
                                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors -ml-2"
                                aria-label="Back to home"
                            >
                                <ArrowLeft className="w-5 h-5 text-neutral-600" />
                            </Link>
                            <Link href="/help" className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-neutral-900 flex items-center justify-center">
                                    <HelpCircle className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Help Center</h1>
                                    <p className="text-xs text-neutral-500 mt-0.5">Find answers and guides</p>
                                </div>
                            </Link>
                        </div>
                    ) : (
                        // Spacer for mobile search layout
                        <div className="hidden md:block"></div>
                    )}

                    {/* Desktop Search */}
                    <div className="relative hidden md:block w-96">
                        <SearchInput
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            setShowResults={setShowResults}
                            showResults={showResults}
                            filteredResults={filteredResults}
                            router={router}
                        />
                    </div>

                    {/* Mobile Search Toggle */}
                    <div className="md:hidden flex items-center">
                        {!isSearchOpen && (
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                            >
                                <Search className="w-5 h-5 text-neutral-600" />
                            </button>
                        )}
                    </div>

                    {/* Mobile Search Overlay */}
                    {isSearchOpen && (
                        <div className="absolute inset-0 bg-white z-50 px-4 py-3 flex items-start gap-3 md:hidden h-screen">
                            <div className="flex-1 relative mt-[1px]">
                                <SearchInput
                                    searchQuery={searchQuery}
                                    setSearchQuery={setSearchQuery}
                                    setShowResults={setShowResults}
                                    showResults={showResults}
                                    filteredResults={filteredResults}
                                    router={router}
                                    autoFocus={true}
                                />
                            </div>
                            <button
                                onClick={() => {
                                    setIsSearchOpen(false);
                                    setSearchQuery('');
                                }}
                                className="p-2.5 bg-neutral-100 rounded-lg text-neutral-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

// Extracted Search Input Component for reuse
function SearchInput({
    searchQuery,
    setSearchQuery,
    setShowResults,
    showResults,
    filteredResults,
    router,
    autoFocus = false
}: any) {
    return (
        <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
                type="text"
                placeholder="Search help..."
                value={searchQuery}
                autoFocus={autoFocus}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-100 border-transparent rounded-lg focus:bg-white focus:border-neutral-200 focus:ring-2 focus:ring-neutral-900 focus:outline-none transition-all"
            />
            {/* Search Results Dropdown */}
            {showResults && searchQuery && (
                <div
                    className="absolute top-full mt-2 w-full rounded-xl shadow-2xl border border-white/50 overflow-hidden max-h-[60vh] overflow-y-auto z-[100] [&::-webkit-scrollbar]:hidden"
                    style={{
                        backdropFilter: 'blur(40px) saturate(200%)',
                        WebkitBackdropFilter: 'blur(40px) saturate(200%)',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                    }}
                >
                    {filteredResults.length > 0 ? (
                        <div className="py-2">
                            {filteredResults.map((result: any) => (
                                <button
                                    key={`${result.sectionId}-${result.id}`}
                                    onClick={() => router.push(`/help/${result.sectionId}/${result.id}`)}
                                    className="w-full text-left px-4 py-3 hover:bg-neutral-50/50 hover:backdrop-blur-sm transition-colors border-b border-white/10 last:border-0"
                                >
                                    <div className="text-sm font-medium text-neutral-900">{result.title}</div>
                                    <div className="text-xs text-neutral-500">{result.sectionTitle}</div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-sm text-neutral-500">
                            No results found
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
