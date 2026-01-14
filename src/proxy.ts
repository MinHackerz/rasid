import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define which routes are public
const isPublicRoute = createRouteMatcher([
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/upload(.*)', // Allow upload API for now, consider securing
    '/api/verify(.*)', // Public verification API
    '/verify(.*)',     // Public verification page
    '/sso-callback',    // SSO callback for OAuth (Google Sign-in)
    '/privacy',         // Public privacy policy
    '/terms',           // Public terms of service
    '/help',            // Public help center
    '/api/v1/invoices/generate(.*)', // Public invoice generation API (protected by API key)
    '/api/webhooks(.*)' // Public webhooks
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
