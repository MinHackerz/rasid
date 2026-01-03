import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Help Center - Rasid Invoice Platform',
    description: 'Comprehensive help guide for Rasid invoice management platform. Learn how to create invoices, digitize documents with AI OCR, manage buyers, configure settings, and verify invoice authenticity.',
    keywords: [
        'Rasid help',
        'invoice help',
        'invoice management guide',
        'OCR invoice digitization',
        'invoice verification',
        'invoice platform tutorial',
        'digital invoice guide',
        'invoice software help'
    ],
    openGraph: {
        title: 'Help Center - Rasid Invoice Platform',
        description: 'Comprehensive help guide for Rasid invoice management platform. Learn how to create invoices, digitize documents with AI OCR, manage buyers, configure settings, and verify invoice authenticity.',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Help Center - Rasid Invoice Platform',
        description: 'Comprehensive help guide for Rasid invoice management platform.',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    alternates: {
        canonical: '/help',
    },
};

export default function HelpLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
