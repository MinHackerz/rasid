import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define which routes are public
const isPublicRoute = createRouteMatcher([
    '/',
    '/api/og(.*)',     // Public OpenGraph image generation
    '/api-docs',       // Public API documentation
    '/pricing',        // Public pricing page
    '/help(.*)',       // Public help center (all sub-routes)
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/upload(.*)', // Allow upload API for now, consider securing
    '/api/verify(.*)', // Public verification API
    '/verify(.*)',     // Public verification page
    '/sso-callback',    // SSO callback for OAuth (Google Sign-in)
    '/privacy',         // Public privacy policy
    '/terms',           // Public terms of service
    '/api/v1/invoices/generate(.*)', // Public invoice generation API (protected by API key)
    '/api/webhooks(.*)',// Public webhooks
    '/sitemap',         // Next.js sitemap path
    '/sitemap.xml',     // Public sitemap target
    '/robots.txt',      // Public robots text file
    '/manifest.json',   // Public app manifest
    '/icon.png',        // App icon
    '/llms.txt',        // Public llms text file
]);

export default clerkMiddleware(async (auth, request) => {
    if (!isPublicRoute(request)) {
        await auth.protect()
    }
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}
