import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';

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

        let logoUrl: string | undefined;

        if (logoFile) {
            const bytes = await logoFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Create unique filename
            const ext = logoFile.name.split('.').pop() || 'png';
            const filename = `logo-${user.id}-${Date.now()}.${ext}`;
            const uploadDir = join(process.cwd(), 'public', 'logos');

            await mkdir(uploadDir, { recursive: true });
            await writeFile(join(uploadDir, filename), buffer);

            logoUrl = `/logos/${filename}`;
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
                    ...(logoUrl && { logo: logoUrl }),
                },
            });
            return NextResponse.json({ success: true, data: updatedSeller });
        }

        // Create new Seller linked to Clerk User
        // Note: We removed the email-linking logic because with multi-business support, 
        // passing an email doesn't uniquely identify a "legacy" account safely anymore.
        // Users should sign in with the correct account first.

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
                logo: logoUrl || null,
                passwordHash: '', // No password for clerk-auth users
                emailVerified: true,
            },
        });
        return NextResponse.json({ success: true, data: newSeller });
    } catch (error) {
        console.error('Onboarding error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
