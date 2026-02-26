import { currentUser } from '@clerk/nextjs/server';

/**
 * Returns the normalized ADMIN_EMAIL from environment, or null if not set.
 */
function getAdminEmailFromEnv(): string | null {
    const raw = process.env.ADMIN_EMAIL;
    if (!raw) return null;
    return raw.trim().toLowerCase();
}

/**
 * Checks whether the currently authenticated Clerk user is the platform admin.
 * Admin is identified solely by matching their primary email against ADMIN_EMAIL.
 */
export async function getAdminUser() {
    const user = await currentUser();
    if (!user) return null;

    const adminEmail = getAdminEmailFromEnv();
    if (!adminEmail) {
        return null;
    }

    const isAdmin = user.emailAddresses.some((email) =>
        email.emailAddress.trim().toLowerCase() === adminEmail
    );

    return isAdmin ? user : null;
}

/**
 * Throws if the current user is not the platform admin.
 * Returns the admin user object when successful.
 */
export async function requireAdminUser() {
    const adminUser = await getAdminUser();
    if (!adminUser) {
        throw new Error('Forbidden: admin access required');
    }
    return adminUser;
}

