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
    return [
      {
        source: '/dashboard',
        destination: 'https://dashboard.rasid.in',
        permanent: true,
      },
      {
        source: '/dashboard/:path*',
        destination: 'https://dashboard.rasid.in/:path*',
        permanent: true,
      },
      {
        source: '/admin',
        destination: 'https://admin.rasid.in',
        permanent: true,
      },
      {
        source: '/admin/:path*',
        destination: 'https://admin.rasid.in/:path*',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: 'dashboard.rasid.in',
          },
        ],
        destination: '/dashboard',
      },
      {
        source: '/:path((?!api/).*)',
        has: [
          {
            type: 'host',
            value: 'dashboard.rasid.in',
          },
        ],
        destination: '/dashboard/:path',
      },
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: 'admin.rasid.in',
          },
        ],
        destination: '/admin',
      },
      {
        source: '/:path((?!api/).*)',
        has: [
          {
            type: 'host',
            value: 'admin.rasid.in',
          },
        ],
        destination: '/admin/:path',
      },
    ];
  },
};

export default nextConfig;
