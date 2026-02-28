import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const PAGES: Record<string, { title: string; subtitle: string; gradient: string; emoji: string }> = {
    home: {
        title: 'Rasid',
        subtitle: 'Smart Invoice Platform',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        emoji: '📄',
    },
    help: {
        title: 'Help Center',
        subtitle: 'Guides, tutorials, and answers to get the most out of Rasid',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #064e3b 50%, #065f46 100%)',
        emoji: '📖',
    },
    'api-docs': {
        title: 'API Documentation',
        subtitle: 'Build invoicing into your app with our REST API',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #0c4a6e 50%, #0369a1 100%)',
        emoji: '⚡',
    },
    verify: {
        title: 'Invoice Verification',
        subtitle: 'Cryptographically verify invoice authenticity instantly',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #14532d 50%, #166534 100%)',
        emoji: '🛡️',
    },
    privacy: {
        title: 'Privacy Policy',
        subtitle: 'How Rasid protects your invoice data and business information',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #3b0764 50%, #581c87 100%)',
        emoji: '🔒',
    },
    terms: {
        title: 'Terms of Service',
        subtitle: 'Terms for using Rasid for invoice generation and verification',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #1c1917 50%, #292524 100%)',
        emoji: '📋',
    },
    pricing: {
        title: 'Pricing Plans',
        subtitle: 'From free to Lifetime — find the right plan for your business',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #78350f 50%, #92400e 100%)',
        emoji: '💎',
    },
    dashboard: {
        title: 'Dashboard',
        subtitle: 'Your command center for invoices, analytics, and business insights',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        emoji: '📊',
    },
    invoices: {
        title: 'Invoice Management',
        subtitle: 'Create, send, track, and manage all your invoices',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #0c4a6e 50%, #0369a1 100%)',
        emoji: '🧾',
    },
    analytics: {
        title: 'Advanced Analytics',
        subtitle: 'Revenue trends, client insights, and business performance metrics',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #4c1d95 50%, #6d28d9 100%)',
        emoji: '📈',
    },
    referral: {
        title: 'Referral Program',
        subtitle: 'Earn rewards by referring businesses to Rasid — commissions, credits, or discounts',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #4c1d95 50%, #7c3aed 100%)',
        emoji: '🎁',
    },
};

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || 'home';
    const config = PAGES[page] || PAGES.home;

    return new ImageResponse(
        (
            <div
                style={{
                    width: '1200',
                    height: '630',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    background: config.gradient,
                    padding: '80px',
                    fontFamily: '"Inter", "Segoe UI", sans-serif',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Background decorative circles */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-100px',
                        right: '-100px',
                        width: '500px',
                        height: '500px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.03)',
                        display: 'flex',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        bottom: '-150px',
                        left: '-150px',
                        width: '400px',
                        height: '400px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.02)',
                        display: 'flex',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        right: '120px',
                        transform: 'translateY(-50%)',
                        fontSize: '180px',
                        opacity: 0.15,
                        display: 'flex',
                    }}
                >
                    {config.emoji}
                </div>

                {/* Logo bar */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '40px',
                    }}
                >
                    <div
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'rgba(255,255,255,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            color: 'white',
                            fontWeight: 700,
                        }}
                    >
                        R
                    </div>
                    <span
                        style={{
                            color: 'rgba(255,255,255,0.6)',
                            fontSize: '18px',
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                        }}
                    >
                        rasid.in
                    </span>
                </div>

                {/* Title */}
                <div
                    style={{
                        fontSize: '64px',
                        fontWeight: 800,
                        color: 'white',
                        lineHeight: 1.1,
                        marginBottom: '20px',
                        letterSpacing: '-0.02em',
                        display: 'flex',
                        maxWidth: '800px',
                    }}
                >
                    {config.title}
                </div>

                {/* Subtitle */}
                <div
                    style={{
                        fontSize: '26px',
                        color: 'rgba(255,255,255,0.6)',
                        lineHeight: 1.4,
                        maxWidth: '700px',
                        display: 'flex',
                    }}
                >
                    {config.subtitle}
                </div>

                {/* Bottom bar */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: '40px',
                        left: '80px',
                        right: '80px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            gap: '24px',
                            fontSize: '14px',
                            color: 'rgba(255,255,255,0.35)',
                            fontWeight: 500,
                        }}
                    >
                        <span style={{ display: 'flex' }}>Smart Billing</span>
                        <span style={{ display: 'flex' }}>•</span>
                        <span style={{ display: 'flex' }}>Tamper-Proof</span>
                        <span style={{ display: 'flex' }}>•</span>
                        <span style={{ display: 'flex' }}>Cryptographic Verification</span>
                    </div>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}
