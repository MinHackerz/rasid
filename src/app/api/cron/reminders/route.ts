/**
 * Payment Reminder Cron API
 * 
 * This endpoint processes pending payment reminders.
 * Should be called periodically (e.g., every hour via Vercel Cron)
 */

import { NextRequest, NextResponse } from 'next/server';
import { processPendingReminders } from '@/lib/services/payment-reminder';

// Vercel Cron configuration
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds max

export async function GET(request: NextRequest) {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Skip auth check in development or if no secret is set
    if (process.env.NODE_ENV === 'production' && cronSecret) {
        if (authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    try {
        console.log('[Cron] Processing payment reminders...');
        const results = await processPendingReminders();
        console.log('[Cron] Payment reminders processed:', results);

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            results
        });
    } catch (error) {
        console.error('[Cron] Error processing reminders:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// Also support POST for manual triggering
export async function POST(request: NextRequest) {
    return GET(request);
}
