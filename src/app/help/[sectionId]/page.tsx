import { redirect, notFound } from 'next/navigation';
import { helpContent } from '@/lib/help-content';

interface Props {
    params: {
        sectionId: string;
    };
}

export function generateStaticParams() {
    return helpContent.map((section) => ({
        sectionId: section.id,
    }));
}

export default async function SectionPage({ params }: { params: Promise<{ sectionId: string }> }) {
    const { sectionId } = await params;
    const section = helpContent.find((s) => s.id === sectionId);

    if (!section) {
        notFound();
    }

    const firstSubsection = section.subsections[0];
    if (firstSubsection) {
        redirect(`/help/${section.id}/${firstSubsection.id}`);
    }

    return notFound();
}
