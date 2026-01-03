'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function switchBusiness(businessId: string) {
    (await cookies()).set('rashid-active-business', businessId, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });
    // Revalidating path might be needed, but redirect forces a refresh usually
}
