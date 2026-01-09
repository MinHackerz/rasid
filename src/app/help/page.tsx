import Link from 'next/link';
import { helpContent } from '@/lib/help-content';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function HelpLandingPage() {
    return (
        <div className="container-app py-8 lg:py-12">
            <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center max-w-4xl mx-auto shadow-sm">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-8 h-8 text-neutral-400" />
                </div>
                <h2 className="text-3xl font-bold text-neutral-900 mb-4 tracking-tight">How can we help you today?</h2>
                <p className="text-lg text-neutral-600 mb-10 max-w-lg mx-auto leading-relaxed">
                    Select a topic below to explore guides, tutorials, and answers to common questions about Rasid.
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-left">
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
            </div>
        </div>
    );
}
