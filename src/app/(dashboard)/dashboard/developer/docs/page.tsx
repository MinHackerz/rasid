import { Metadata } from 'next';
import { Card } from '@/components/ui';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
    title: 'API Documentation | Rasid',
};

export default function ApiDocsPage() {
    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-20 animate-enter">
            <div>
                <Link href="/dashboard/developer" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 mb-4">
                    <ArrowLeft className="w-4 h-4" />
                    Back to API Keys
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">API Documentation</h1>
                <p className="text-muted-foreground mt-2">Complete guide to generating invoices programmatically using the Rasid API.</p>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg flex items-center justify-between">
                <div>
                    <p className="font-medium">View Full Public Documentation</p>
                    <p className="text-sm text-muted-foreground">Access the complete API docs with code examples</p>
                </div>
                <Link
                    href="/api-docs"
                    target="_blank"
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                    Open Docs <ExternalLink className="w-4 h-4" />
                </Link>
            </div>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold border-b pb-2">Quick Reference</h2>

                <h3 className="text-lg font-semibold mt-6">Authentication</h3>
                <p>
                    Include your API Key in the <code className="bg-muted px-2 py-0.5 rounded text-sm">x-api-key</code> header.
                </p>
                <Card className="bg-muted font-mono text-sm p-4 border-l-4 border-primary">
                    x-api-key: rsd_live_...
                </Card>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold border-b pb-2">Endpoint</h2>
                <div className="flex items-center gap-2 mb-4">
                    <span className="bg-green-500/10 text-green-600 px-3 py-1 rounded-md font-bold text-sm border border-green-500/20">POST</span>
                    <code className="bg-muted px-3 py-1 rounded-md text-sm font-mono text-foreground">https://rasid.in/api/v1/invoices/generate</code>
                </div>

                <h3 className="text-lg font-semibold mt-6">Minimal Request</h3>
                <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm font-mono border border-slate-800">
                    {`{
  "buyer": { "name": "Customer Name" },
  "items": [
    { "description": "Product/Service", "quantity": 1, "unitPrice": 1000 }
  ]
}`}
                </pre>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold border-b pb-2">Templates</h2>
                <p className="text-muted-foreground">
                    Each API key is configured with a specific invoice template. All invoices generated through that key will use the selected template style.
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                    <li>Classic - Clean and professional</li>
                    <li>Modern Minimal - Ultra-clean with whitespace</li>
                    <li>Corporate - Traditional with dark headers</li>
                    <li>Executive - Striking bold typography</li>
                    <li>Elegant Serif - Refined with gold accents</li>
                    <li>Tech Startup - Modern gradient accents</li>
                    <li>Creative Agency - Bold asymmetric layout</li>
                    <li>Consultant Pro - Detailed professional layout</li>
                    <li>Retail Commerce - Receipt-style design</li>
                    <li>Luxury Premium - Dark with gold accents</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold border-b pb-2">Limits</h2>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Rate Limit:</strong> 60 requests per minute.</li>
                    <li><strong>Total Quota:</strong> 100,000 requests per API key.</li>
                </ul>
            </section>
        </div>
    );
}
