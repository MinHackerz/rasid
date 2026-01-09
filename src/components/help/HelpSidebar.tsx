'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HelpSection } from '@/lib/help-content';
import { useState, useEffect } from 'react';
import { ChevronDown, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HelpSidebarProps {
    sections: HelpSection[];
}

export function HelpSidebar({ sections }: HelpSidebarProps) {
    const pathname = usePathname();
    const [expandedSections, setExpandedSections] = useState<string[]>([]);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Automatically expand the section that matches the current path on mount or navigation
    useEffect(() => {
        const activeSection = sections.find(section => pathname.includes(`/help/${section.id}`));
        if (activeSection && !expandedSections.includes(activeSection.id)) {
            setExpandedSections(prev => [...prev, activeSection.id]);
        }
        // Close mobile menu on navigation
        setIsMobileMenuOpen(false);
    }, [pathname, sections]);

    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev =>
            prev.includes(sectionId)
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    return (
        <div className="lg:block">
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden w-full flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-xl mb-6 shadow-sm font-medium text-neutral-900"
            >
                <div className="flex items-center gap-2">
                    <Menu className="w-5 h-5" />
                    <span>Browse Help Topics</span>
                </div>
                <motion.div
                    animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className="w-5 h-5" />
                </motion.div>
            </button>

            {/* Sidebar Content */}
            <aside className={`
                ${isMobileMenuOpen ? 'block' : 'hidden'} 
                lg:block lg:sticky lg:top-24 
                h-auto lg:h-[calc(100vh-8rem)] 
                overflow-y-auto pr-2 custom-scrollbar
                bg-white lg:bg-transparent
                rounded-xl lg:rounded-none
                border lg:border-none border-neutral-200
                p-2 lg:p-0
                mb-6 lg:mb-0
            `}>
                <nav className="space-y-1">
                    {sections.map((section) => {
                        const isExpanded = expandedSections.includes(section.id);
                        const isActiveSection = pathname.includes(`/help/${section.id}`);

                        return (
                            <div key={section.id} className="group mb-1">
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActiveSection || isExpanded
                                        ? 'text-neutral-900 bg-neutral-100/80 shadow-sm'
                                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded-md transition-colors ${isActiveSection ? 'bg-neutral-900 text-white shadow-sm' :
                                                isExpanded ? 'bg-white shadow-sm text-neutral-900' :
                                                    'bg-neutral-100 text-neutral-500 group-hover:text-neutral-900 group-hover:bg-white'
                                            }`}>
                                            {// Render icon - cloning to control size if needed, but lucid icons usually accept classNames
                                                section.icon}
                                        </div>
                                        <span>{section.title}</span>
                                    </div>
                                    <motion.div
                                        animate={{ rotate: isExpanded ? 180 : 0 }}
                                        transition={{ duration: 0.2, ease: "easeInOut" }}
                                    >
                                        <ChevronDown className={`w-4 h-4 transition-colors ${isExpanded || isActiveSection ? 'text-neutral-900' : 'text-neutral-400'}`} />
                                    </motion.div>
                                </button>

                                <AnimatePresence initial={false}>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <div className="mt-1 ml-[1.625rem] pl-4 border-l border-neutral-200 space-y-1 py-1">
                                                {section.subsections.map((subsection) => {
                                                    const href = `/help/${section.id}/${subsection.id}`;
                                                    const isActive = pathname === href;

                                                    return (
                                                        <Link
                                                            key={subsection.id}
                                                            href={href}
                                                            className={`relative block px-3 py-2 rounded-md text-sm transition-all duration-200 -ml-[17px] pl-[17px] ${isActive
                                                                ? 'text-neutral-900 font-medium bg-neutral-100/50'
                                                                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50/50'
                                                                }`}
                                                        >
                                                            {/* Active indicator line */}
                                                            {isActive && (
                                                                <motion.div
                                                                    layoutId="activeIndicator"
                                                                    className="absolute left-0 top-0 bottom-0 w-0.5 bg-neutral-900 rounded-full"
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: "100%" }}
                                                                />
                                                            )}
                                                            {subsection.title}
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </nav>
            </aside>
        </div>
    );
}
