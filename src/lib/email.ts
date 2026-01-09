
import nodemailer from 'nodemailer';
import { prisma } from './prisma';

interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    sellerId: string;
}

export async function sendEmail({ to, subject, html, sellerId }: SendEmailOptions) {
    try {
        // 1. Fetch Seller's SMTP Settings
        const seller = await prisma.seller.findUnique({
            where: { id: sellerId },
            select: { integrations: true, email: true, businessName: true }
        });

        if (!seller || !seller.integrations) {
            console.error('Seller not found or no integrations configured.');
            return { success: false, error: 'Email settings not configured.' };
        }

        const integrations = seller.integrations as any;
        const emailSettings = integrations.email;

        // 2. Validate SMTP Settings
        if (!emailSettings?.smtpHost || !emailSettings?.smtpUser || !emailSettings?.smtpPass) {
            console.error('Incomplete SMTP settings.');
            return { success: false, error: 'Incomplete SMTP settings.' };
        }

        // 3. Create Transporter
        const transporter = nodemailer.createTransport({
            host: emailSettings.smtpHost,
            port: parseInt(emailSettings.smtpPort || '587'),
            secure: emailSettings.port === 465, // true for 465, false for other ports
            auth: {
                user: emailSettings.smtpUser,
                pass: emailSettings.smtpPass,
            },
        });

        // 4. Send Email
        const info = await transporter.sendMail({
            from: `"${seller.businessName || 'Rashid Platform'}" <${emailSettings.fromEmail || emailSettings.smtpUser}>`,
            to,
            subject,
            html,
        });

        console.log('Email sent: %s', info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}
