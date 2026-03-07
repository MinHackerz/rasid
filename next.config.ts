import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@sparticuz/chromium-min', 'puppeteer-core', 'puppeteer'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'StrictMode',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(), geolocation=(), browsing-topics=()'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }
        ],
      },
    ];
  },
  async redirects() {
    // Never redirect to production subdomains in development
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const isDev = process.env.NODE_ENV !== 'production' || appUrl.includes('localhost') || appUrl.includes('127.0.0.1');

    if (isDev) {
      return [];
    }

    return [
      {
        source: '/dashboard',
        destination: 'https://dashboard.rasid.in',
        permanent: false,
      },
      {
        source: '/dashboard/:path*',
        destination: 'https://dashboard.rasid.in/:path*',
        permanent: false,
      },
      {
        source: '/admin',
        destination: 'https://admin.rasid.in',
        permanent: false,
      },
      {
        source: '/admin/:path*',
        destination: 'https://admin.rasid.in/:path*',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
