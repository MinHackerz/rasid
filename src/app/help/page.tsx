import Link from 'next/link';
import { helpContent } from '@/lib/help-content';
import { Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import { HelpSidebar } from '@/components/help/HelpSidebar';

export default function HelpLandingPage() {
    return (
        <div className="container-app py-8 lg:py-12">
            <div className="grid lg:grid-cols-[280px_1fr] gap-8">
                {/* Persistent Sidebar */}
                <HelpSidebar sections={helpContent} />

                {/* Main Content */}
                <main className="min-w-0 space-y-8">
                    {/* Welcome Banner */}
                    <div className="bg-white rounded-xl border border-neutral-200 p-8 md:p-10 shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-neutral-900 flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">How can we help you today?</h2>
                                <p className="text-sm text-neutral-500 mt-0.5">Browse topics or search for specific answers</p>
                            </div>
                        </div>
                    </div>

                    {/* Topic Cards Grid */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {helpContent.map((section) => (
                            <Link
                                key={section.id}
                                href={`/help/${section.id}/${section.subsections[0]?.id}`}
                                className="p-6 border border-neutral-200 rounded-xl hover:border-neutral-900 hover:shadow-md transition-all group bg-white"
                            >
                                <div className="flex items-start gap-4 mb-3">
                                    <div className="p-2.5 rounded-lg bg-neutral-50 text-neutral-500 group-hover:text-neutral-900 group-hover:bg-neutral-100 transition-colors">
                                        {section.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-neutral-900 text-lg mb-1 group-hover:text-primary transition-colors">
                                            {section.title}
                                        </h3>
                                        <p className="text-sm text-neutral-500 leading-snug">{section.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-xs font-medium text-neutral-400 mt-2 pl-[3.25rem]">
                                    <span>{section.subsections.length} articles</span>
                                    <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-neutral-900" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}
