import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { updateProfileSchema } from '@/lib/validations';
import { z } from 'zod';

export async function GET(request: NextRequest) {
    try {
        const session = await requireAuth();

        const seller = await prisma.seller.findUnique({
            where: { id: session.sellerId },
            select: {
                id: true,
                email: true,
                businessName: true,
                logo: true,
                logoData: true,
                businessAddress: true,
                phone: true,
                taxId: true,
                state: true,
                integrations: true,
                invoiceDefaults: true,
                isActive: true,
                plan: true,
            } as any,
        });

        if (!seller) {
            return NextResponse.json(
                { success: false, error: 'Seller not found' },
                { status: 404 }
            );
        }

        // Convert logoData to Base64 string for legacy frontend compatibility
        let logo: any = seller.logo;
        if ((seller as any).logoData) {
            // Determine MimeType? For now assume PNG or JPEG if we don't store mime type separately.
            // Actually, we should preferably store mime type. But we didn't add that column.
            // Base64 usually includes mime type header: data:image/png;base64,...
            // If we stored JUST the buffer, we lost the mime type unless we sniff it.
            // BUT, if we store the buffer from a `data:` string, we can't easily reconstruction the `data:image/x;base64` prefix without knowing type.
            // Wait, if I strip the prefix before saving, I lose type.
            // If I save the WHOLE string to Bytes... UTF8 encoded? That's just saving string as bytes.
            // That works fine and preserves the header!
            // Let's do that for simplicity and 100% fidelity to what frontend sends.
            logo = Buffer.from((seller as any).logoData).toString('utf-8');
        }

        return NextResponse.json({
            success: true,
            data: { ...seller, logo, logoData: undefined, role: session.role || 'OWNER' },
        });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.error('Get profile error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch profile' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await requireAuth();
        const body = await request.json();

        // Validate input
        const validated = updateProfileSchema.parse(body);

        // Prepare update data
        const updateData: any = { ...validated };

        // Handle Logo -> LogoData conversion
        if (validated.logo !== undefined) {
            if (validated.logo) {
                // If Base64 string provided, save as Bytes (UTF8 encoded string)
                // This preserves "data:image/png;base64,..." header so we can just toString('utf-8') later
                updateData.logoData = Buffer.from(validated.logo, 'utf-8');
                updateData.logo = null; // Clear legacy string field
            } else {
                // If explicit null/empty, clear both
                updateData.logoData = null;
                updateData.logo = null;
            }
        }

        // Update seller
        const updatedSeller = await prisma.seller.update({
            where: { id: session.sellerId },
            data: updateData,
        });

        return NextResponse.json({
            success: true,
            data: {
                id: updatedSeller.id,
                email: updatedSeller.email,
                businessName: updatedSeller.businessName,
            },
        });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (error instanceof z.ZodError) {
            console.error('Validation error:', error.flatten());
            return NextResponse.json(
                { success: false, error: error.issues[0].message },
                { status: 400 }
            );
        }

        console.error('Update profile error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update profile' },
            { status: 500 }
        );
    }
}
