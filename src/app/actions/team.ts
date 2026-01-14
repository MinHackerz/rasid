'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { sendEmail } from '@/lib/email';
import { checkLimit } from '@/lib/access-control';

export async function getMembers() {
    try {
        const session = await requireAuth();

        const members = await prisma.teamMember.findMany({
            where: { sellerId: session.sellerId },
            orderBy: { createdAt: 'desc' },
        });

        return { success: true, data: members };
    } catch (error) {
        return { success: false, error: 'Failed to fetch members' };
    }
}

export async function inviteMember(email: string) {
    try {
        const session = await requireAuth();

        // Only OWNER can invite
        if (session.role && session.role !== 'OWNER') {
            return { success: false, error: 'Only the business owner can invite members.' };
        }

        if (!email || !email.includes('@')) {
            return { success: false, error: 'Invalid email address.' };
        }

        // Check if duplicate
        const existing = await prisma.teamMember.findUnique({
            where: {
                sellerId_email: {
                    sellerId: session.sellerId,
                    email,
                },
            },
        });

        if (existing) {
            return { success: false, error: 'User is already a team member.' };
        }

        // Check subscription limit
        const canInvite = await checkLimit(session.sellerId, 'teamMembers');
        if (!canInvite) {
            return { success: false, error: 'Team member limit reached. Please upgrade your plan.' };
        }

        // Create member with default role VIEWER (Read-only settings)
        await prisma.teamMember.create({
            data: {
                sellerId: session.sellerId,
                email,
                role: 'VIEWER',
                status: 'PENDING',
            },
        });

        // Send Invitation Email
        try {
            await sendEmail({
                to: email,
                subject: `Invitation to join ${session.businessName}`,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2>Hello,</h2>
                        <p>You have been invited to join <strong>${session.businessName}</strong> on the Rasid Platform.</p>
                        <p>You can access the dashboard by logging in with this email address.</p>
                        <p style="margin-top: 20px;">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
                        </p>
                    </div>
                `,
                sellerId: session.sellerId,
            });
        } catch (emailError) {
            console.error('Failed to send invite email:', emailError);
            // We don't block the UI for this, but logging it is important.
            // The member is added regardless.
        }

        revalidatePath('/dashboard/settings');
        return { success: true };
    } catch (error) {
        console.error('Invite error:', error);
        return { success: false, error: 'Failed to invite member' };
    }
}

export async function removeMember(memberId: string) {
    try {
        const session = await requireAuth();

        if (session.role && session.role !== 'OWNER') {
            return { success: false, error: 'Unauthorized' };
        }

        await prisma.teamMember.delete({
            where: {
                id: memberId,
                sellerId: session.sellerId,
            },
        });

        revalidatePath('/dashboard/settings');
        return { success: true };
    } catch (error) {
        console.error('Remove member error:', error);
        return { success: false, error: 'Failed to remove member' };
    }
}
