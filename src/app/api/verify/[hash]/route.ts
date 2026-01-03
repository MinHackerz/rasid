import { NextRequest, NextResponse } from 'next/server';
import { verifyInvoice } from '@/lib/verification';

interface RouteParams {
    params: Promise<{ hash: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { hash } = await params;

        // Get IP and user agent for logging
        const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        const result = await verifyInvoice(hash, ipAddress, userAgent);

        return NextResponse.json({
            success: result.valid,
            data: result,
        });
    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json(
            { success: false, error: 'Verification failed' },
            { status: 500 }
        );
    }
}
