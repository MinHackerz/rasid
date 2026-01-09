import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(req: Request) {
    try {
        const user = await currentUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const businessName = formData.get('businessName') as string;
        const businessAddress = formData.get('businessAddress') as string;
        const phone = formData.get('phone') as string;
        const taxId = formData.get('taxId') as string;
        const logoFile = formData.get('logo') as File | null;

        // Convert logo file to Base64 data URL and store as Buffer
        let logoDataBuffer: Buffer | null = null;

        if (logoFile && logoFile.size > 0) {
            const bytes = await logoFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Determine mime type
            const mimeType = logoFile.type || 'image/png';

            // Create data URL string and convert to Buffer for storage
            const base64 = buffer.toString('base64');
            const dataUrl = `data:${mimeType};base64,${base64}`;
            logoDataBuffer = Buffer.from(dataUrl, 'utf-8');
        }

        // Check if a business with this name already exists for this user (Update vs Create)
        const existingSeller = await prisma.seller.findFirst({
            where: {
                clerkUserId: user.id,
                businessName: businessName
            },
        });

        if (existingSeller) {
            // Update existing business with same name
            const updatedSeller = await prisma.seller.update({
                where: { id: existingSeller.id },
                data: {
                    businessAddress,
                    phone,
                    taxId,
                    ...(logoDataBuffer && { logoData: logoDataBuffer, logo: null }),
                } as any,
            });
            return NextResponse.json({ success: true, data: updatedSeller });
        }

        // Create new Seller linked to Clerk User
        const formEmail = formData.get('email') as string;
        const email = formEmail || user.emailAddresses[0]?.emailAddress;

        if (!email) {
            return NextResponse.json({ error: 'Email required' }, { status: 400 });
        }

        const newSeller = await prisma.seller.create({
            data: {
                clerkUserId: user.id,
                email: email,
                businessName: businessName || 'My Business',
                businessAddress,
                phone,
                taxId,
                logoData: logoDataBuffer,
                logo: null, // Legacy field cleared
                passwordHash: '', // No password for clerk-auth users
                emailVerified: true,
            } as any,
        });
        return NextResponse.json({ success: true, data: newSeller });
    } catch (error) {
        console.error('Onboarding error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
