import { MetadataRoute } from 'next';
import { helpContent } from '@/lib/help-content';

export default function sitemap(): MetadataRoute.Sitemap {
    const domains = ['https://rasid.in'];

    const staticRoutes = [
        '',
        '/pricing',
        '/sign-in',
        '/sign-up',
        '/privacy',
        '/terms',
        '/help',
        '/referral',
    ];

    const helpRoutes = helpContent.flatMap((section) =>
        section.subsections.map((sub) => `/help/${section.id}/${sub.id}`)
    );

    const allPaths = [...staticRoutes, ...helpRoutes];
    const sitemapEntries: MetadataRoute.Sitemap = [];

    domains.forEach((domain) => {
        allPaths.forEach((path) => {
            sitemapEntries.push({
                url: `${domain}${path}`,
                lastModified: new Date(),
                changeFrequency: path === '' ? 'daily' : 'weekly',
                priority: path === '' ? 1 : (path.startsWith('/help') ? 0.6 : 0.8),
            });
        });
    });

    return sitemapEntries;
}
