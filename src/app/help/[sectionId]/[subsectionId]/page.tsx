import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Lightbulb, CheckCircle2 } from 'lucide-react';
import { helpContent } from '@/lib/help-content';
import { Metadata } from 'next';

interface Props {
    params: {
        sectionId: string;
        subsectionId: string;
    };
}

export function generateStaticParams() {
    return helpContent.flatMap((section) =>
        section.subsections.map((subsection) => ({
            sectionId: section.id,
            subsectionId: subsection.id,
        }))
    );
}

export async function generateMetadata({ params }: { params: Promise<{ sectionId: string; subsectionId: string }> }): Promise<Metadata> {
    const { sectionId, subsectionId } = await params;
    const section = helpContent.find((s) => s.id === sectionId);
    const subsection = section?.subsections.find((s) => s.id === subsectionId);

    if (!section || !subsection) {
        return {
            title: 'Article Not Found',
        };
    }

    return {
        title: `${subsection.title} - Help Center | Rasid`,
        description: `Learn about ${subsection.title} in the ${section.title} section of the Rasid Help Center.`,
    };
}

export default async function ArticlePage({ params }: { params: Promise<{ sectionId: string; subsectionId: string }> }) {
    const { sectionId, subsectionId } = await params;
    const section = helpContent.find((s) => s.id === sectionId);
    const subsection = section?.subsections.find((s) => s.id === subsectionId);

    if (!section || !subsection) {
        notFound();
    }

    // Helper function to format content (Logic adapted from original file)
    const formatInlineContent = (text: string) => {
        return text.split(/(\*\*.*?\*\*|`.*?`)/g).map((part, idx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return (
                    <strong key={idx} className="text-foreground font-semibold">
                        {part.replace(/\*\*/g, '')}
                    </strong>
                );
            }
            if (part.startsWith('`') && part.endsWith('`')) {
                return (
                    <code key={idx} className="px-1.5 py-0.5 bg-neutral-100 text-neutral-900 rounded text-sm font-mono">
                        {part.replace(/`/g, '')}
                    </code>
                );
            }
            return <span key={idx}>{part}</span>;
        });
    };

    const formatContent = (content: string) => {
        const parts = content.split('\n\n');
        return parts.map((paragraph, idx) => {
            if (!paragraph.trim()) return null;

            // Handle numbered lists
            if (/^\d+\./.test(paragraph.trim())) {
                const lines = paragraph.split('\n');
                return (
                    <ol key={idx} className="list-decimal list-inside space-y-2 mb-4 ml-4">
                        {lines.map((line, lineIdx) => {
                            if (/^\d+\./.test(line.trim())) {
                                const content = line.replace(/^\d+\.\s*/, '');
                                return (
                                    <li key={lineIdx} className="mb-2">
                                        {formatInlineContent(content)}
                                    </li>
                                );
                            }
                            return null;
                        })}
                    </ol>
                );
            }

            // Handle bullet lists
            if (paragraph.includes('\n-') || paragraph.trim().startsWith('-')) {
                const lines = paragraph.split('\n');
                return (
                    <ul key={idx} className="list-none space-y-2 mb-4">
                        {lines.map((line, lineIdx) => {
                            if (line.trim().startsWith('-')) {
                                const content = line.replace(/^-\s*/, '');
                                return (
                                    <li key={lineIdx} className="flex gap-3 mb-2">
                                        <span className="text-primary mt-1.5 flex-shrink-0">•</span>
                                        <span className="flex-1">{formatInlineContent(content)}</span>
                                    </li>
                                );
                            }
                            if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
                                return (
                                    <h3 key={lineIdx} className="text-foreground font-semibold text-lg mt-6 mb-3">
                                        {line.replace(/\*\*/g, '')}
                                    </h3>
                                );
                            }
                            if (line.trim()) {
                                return (
                                    <p key={lineIdx} className="mb-2">
                                        {formatInlineContent(line)}
                                    </p>
                                );
                            }
                            return null;
                        })}
                    </ul>
                );
            }

            // Handle bold headers (fallback if not caught in lists)
            if (paragraph.trim().startsWith('**') && paragraph.trim().endsWith('**') && paragraph.split('**').length === 3) {
                return (
                    <h3 key={idx} className="text-foreground font-semibold text-lg mt-6 mb-3">
                        {paragraph.replace(/\*\*/g, '')}
                    </h3>
                );
            }

            // Regular paragraph
            return (
                <p key={idx} className="mb-4 leading-relaxed">
                    {formatInlineContent(paragraph)}
                </p>
            );
        });
    };

    return (
        <article className="space-y-6 animate-enter">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-neutral-500">
                <Link href="/help" className="hover:text-neutral-900 transition-colors">Help</Link>
                <ChevronRight className="w-4 h-4" />
                <span>{section.title}</span>
                <ChevronRight className="w-4 h-4" />
                <span className="text-neutral-900 font-medium">{subsection.title}</span>
            </nav>

            {/* Article Header */}
            <div className="bg-white rounded-xl border border-neutral-200 p-8">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-lg bg-neutral-900 flex items-center justify-center flex-shrink-0">
                        {section.icon}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                            {subsection.title}
                        </h1>
                        <p className="text-sm text-neutral-500">
                            {section.description}
                        </p>
                    </div>
                </div>

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'Article',
                            headline: subsection.title,
                            description: section.description,
                            articleBody: subsection.content.replace(/\*\*/g, ''),
                            author: {
                                '@type': 'Organization',
                                name: 'Rasid'
                            }
                        })
                    }}
                />

                {/* Content */}
                <div className="prose prose-sm max-w-none text-neutral-700">
                    {formatContent(subsection.content)}
                </div>

                {/* Tips Section */}
                {subsection.tips && subsection.tips.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-neutral-200">
                        <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Lightbulb className="w-3 h-3 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-neutral-900 mb-3">Pro Tips</h3>
                                <ul className="space-y-2">
                                    {subsection.tips.map((tip, idx) => (
                                        <li key={idx} className="flex gap-2 text-sm text-neutral-600">
                                            <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <span>{tip}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Related Articles */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
                <h3 className="text-sm font-semibold text-neutral-900 mb-4">Related Articles</h3>
                <div className="space-y-2">
                    {section.subsections
                        .filter(sub => sub.id !== subsection.id)
                        .map((sub) => (
                            <Link
                                key={sub.id}
                                href={`/help/${section.id}/${sub.id}`}
                                className="block w-full text-left px-4 py-3 rounded-lg transition-all text-sm text-neutral-700 hover:bg-neutral-50"
                            >
                                {sub.title}
                            </Link>
                        ))}
                    {section.subsections.filter(sub => sub.id !== subsection.id).length === 0 && (
                        <p className="text-sm text-neutral-500 italic">No other articles in this section.</p>
                    )}
                </div>
            </div>
        </article>
    );
}
