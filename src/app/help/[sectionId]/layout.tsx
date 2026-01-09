import { HelpSidebar } from '@/components/help/HelpSidebar';
import { helpContent } from '@/lib/help-content';

export default function SectionLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="container-app py-8 lg:py-12">
            <div className="grid lg:grid-cols-[280px_1fr] gap-8">
                <HelpSidebar sections={helpContent} />
                <main className="min-w-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
