/**
 * Invoice Delivery Service for Rasid Invoice Platform
 * 
 * Handles delivery via Email, SMS, and WhatsApp
 */

import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';
import { getInvoicePDFBuffer } from '@/lib/pdf';
import type { DeliveryMethod, DeliveryStatus } from '@/types';

// ============================================
// Email Transport Configuration
// ============================================
// ============================================
// Email Delivery
// ============================================
export async function sendInvoiceEmail(
    invoiceId: string,
    recipientEmail: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
        const invoice = await (prisma.invoice as any).findUnique({
            where: { id: invoiceId },
            include: {
                seller: {
                    include: {
                        paymentMethods: {
                            where: { isEnabled: true }
                        }
                    }
                },
                buyer: true,
                items: true,
            },
        });

        if (!invoice) {
            throw new Error('Invoice not found');
        }

        // Get Payment Method
        const paymentMethod = (invoice.seller as any).paymentMethods?.[0];
        let paymentHtml = '';

        // Prepare attachments array
        const attachments: any[] = [];

        if (paymentMethod && invoice.paymentStatus !== 'PAID') {
            if (paymentMethod.type === 'BANK_TRANSFER') {
                const d = paymentMethod.details;
                paymentHtml = `
                <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee;">
                    <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #0a0a0a;">Payment Instructions</h3>
                    <p style="margin: 0 0 8px; color: #666; font-size: 14px;">Please transfer the total amount to the following bank account:</p>
                    <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; font-size: 14px; color: #333;">
                        <p style="margin: 4px 0;"><strong>Bank Name:</strong> ${d.bankName || '-'}</p>
                        <p style="margin: 4px 0;"><strong>Account Name:</strong> ${d.accountName || '-'}</p>
                        <p style="margin: 4px 0;"><strong>Account Number:</strong> ${d.accountNumber || '-'}</p>
                        ${d.ifsc ? `<p style="margin: 4px 0;"><strong>IFSC Code:</strong> ${d.ifsc}</p>` : ''}
                        ${d.swift ? `<p style="margin: 4px 0;"><strong>SWIFT/IBAN:</strong> ${d.swift}</p>` : ''}
                    </div>
                </div>`;
            } else if (paymentMethod.type === 'UPI') {
                paymentHtml = `
                <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee;">
                    <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #0a0a0a;">Pay via UPI</h3>
                    <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; font-size: 14px; color: #333;">
                        <p style="margin: 4px 0;"><strong>UPI ID:</strong> ${paymentMethod.details.upiId}</p>
                    </div>
                </div>`;
            } else if (paymentMethod.type === 'PAYPAL') {
                paymentHtml = `
                <div style="text-align: center; margin-top: 24px;">
                    <a href="${paymentMethod.details.email.includes('http') ? paymentMethod.details.email : `https://paypal.me/${paymentMethod.details.email}`}" 
                       style="display: inline-block; background: #0070BA; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
                        Pay via PayPal
                    </a>
                </div>`;
            } else if (paymentMethod.type === 'QR_CODE' && paymentMethod.details.qrCode) {
                const qrCodeData = paymentMethod.details.qrCode;
                let imgSrc = qrCodeData;

                // If it's a data URL, we attach it as CID for better email client support
                if (qrCodeData.startsWith('data:')) {
                    const cid = 'payment-qr-code';
                    attachments.push({
                        filename: 'qrcode.png',
                        path: qrCodeData,
                        cid: cid
                    });
                    imgSrc = `cid:${cid}`;
                }

                paymentHtml = `
                <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee; text-align: center;">
                    <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #0a0a0a;">Scan to Pay</h3>
                    <img src="${imgSrc}" alt="Payment QR Code" style="max-width: 200px; border-radius: 8px; border: 1px solid #eee;" />
                </div>`;
            }
        }

        // Get PDF buffer
        const pdfBuffer = await getInvoicePDFBuffer(invoiceId);
        if (!pdfBuffer) {
            throw new Error('Failed to generate PDF');
        }

        // Add PDF to attachments
        attachments.push({
            filename: `Invoice-${invoice.invoiceNumber}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
        });

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const verificationUrl = `${appUrl}/verify/${invoice.verificationHash}`;

        // Configure Transport
        const integrations = (invoice.seller as any).integrations;
        const emailConfig = integrations?.email;

        let transport;
        let fromAddress = process.env.EMAIL_FROM;

        if (emailConfig?.smtpHost && emailConfig?.smtpUser) {
            transport = nodemailer.createTransport({
                host: emailConfig.smtpHost,
                port: parseInt(emailConfig.smtpPort || '587'),
                auth: {
                    user: emailConfig.smtpUser,
                    pass: emailConfig.smtpPass,
                },
            });
            fromAddress = emailConfig.fromEmail || emailConfig.smtpUser;
        } else {
            // Fallback to system default
            transport = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: process.env.SMTP_PORT === '465',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
        }

        // Send email
        const info = await transport.sendMail({
            from: `"${invoice.seller.businessName}" <${fromAddress}>`,
            to: recipientEmail,
            subject: `Invoice ${invoice.invoiceNumber} from ${invoice.seller.businessName}`,
            html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f8f9fa; padding: 32px; text-align: center; border-bottom: 3px solid #0a0a0a;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #0a0a0a;">
              ${invoice.seller.businessName}
            </h1>
          </div>
          
          <div style="padding: 32px;">
            <p style="margin: 0 0 16px; color: #333; font-size: 16px;">
              Hello${invoice.buyer?.name ? ` ${invoice.buyer.name}` : ''},
            </p>
            
            <p style="margin: 0 0 24px; color: #666; font-size: 14px; line-height: 1.6;">
              Please find attached your invoice <strong>${invoice.invoiceNumber}</strong> 
              dated ${new Date(invoice.issueDate).toLocaleDateString('en-IN', { dateStyle: 'long' })}.
            </p>
            
            <div style="background: #f8f9fa; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="text-align: left; padding-bottom: 12px; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Item</th>
                        <th style="text-align: right; padding-bottom: 12px; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoice.items.map((item: any) => `
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 12px 0; color: #333; font-size: 14px;">
                            ${item.description}
                            <div style="font-size: 12px; color: #999;">${Number(item.quantity)} x ${item.unit}</div>
                        </td>
                        <td style="padding: 12px 0; text-align: right; color: #333; font-size: 14px;">
                            ${invoice.currency} ${Number(item.amount).toFixed(2)}
                        </td>
                    </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <td style="padding-top: 16px; font-weight: 600; color: #333;">Total Amount</td>
                        <td style="padding-top: 16px; text-align: right; font-weight: 600; font-size: 18px; color: #0a0a0a;">
                            ${invoice.currency} ${Number(invoice.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                    </tr>
                </tfoot>
              </table>
            </div>

            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${verificationUrl}" 
                 style="display: inline-block; background: #0a0a0a; color: #fff; padding: 12px 24px; 
                        text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px;">
                Verify Invoice Authenticity
              </a>
            </div>

            ${paymentHtml}

          </div>
        </div>
      `,
            attachments: attachments,
        });

        // Log the delivery
        await prisma.deliveryLog.create({
            data: {
                invoiceId,
                method: 'EMAIL',
                recipient: recipientEmail,
                status: 'SENT',
                messageId: info.messageId,
                sentAt: new Date(),
            },
        });

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email delivery failed:', error);
        await prisma.deliveryLog.create({
            data: {
                invoiceId,
                method: 'EMAIL',
                recipient: recipientEmail,
                status: 'FAILED',
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
            },
        });
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

// ============================================
// SMS Delivery (Placeholder - requires Twilio)
// ============================================
export async function sendInvoiceSMS(
    invoiceId: string,
    phoneNumber: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // SMS impl skipped for brevity, similar pattern
    return { success: false, error: 'SMS not implemented yet' };
}

// ============================================
// WhatsApp Delivery (Placeholder - requires Twilio)
// ============================================
export async function sendInvoiceWhatsApp(
    invoiceId: string,
    phoneNumber: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
        const invoice = await (prisma.invoice as any).findUnique({
            where: { id: invoiceId },
            include: {
                seller: {
                    include: {
                        paymentMethods: {
                            where: { isEnabled: true }
                        }
                    }
                }
            },
        });

        if (!invoice) {
            throw new Error('Invoice not found');
        }

        // Get Payment Method
        const paymentMethod = (invoice.seller as any).paymentMethods?.[0];
        let paymentText = '';

        if (paymentMethod && invoice.paymentStatus !== 'PAID') {
            paymentText = '\n\n*Payment Details:*';
            const d = paymentMethod.details;
            if (paymentMethod.type === 'BANK_TRANSFER') {
                paymentText += `\nBank: ${d.bankName || '-'}\nAcct: ${d.accountNumber || '-'}\nIFSC: ${d.ifsc || '-'}`;
            } else if (paymentMethod.type === 'UPI') {
                paymentText += `\nUPI ID: ${d.upiId}`;
            } else if (paymentMethod.type === 'PAYPAL') {
                paymentText += `\nPay Link: ${d.email}`;
            } else if (paymentMethod.type === 'QR_CODE') {
                paymentText += '\n(Scan QR code on invoice to pay)';
            }
        }

        const integrations = (invoice.seller as any).integrations;
        const waConfig = integrations?.whatsapp;

        // Check if Meta WhatsApp is configured
        if (!waConfig?.phoneNumberId || !waConfig?.accessToken) {
            console.warn('WhatsApp delivery not configured (Missing Phone ID or Token).');
            await prisma.deliveryLog.create({
                data: {
                    invoiceId,
                    method: 'WHATSAPP',
                    recipient: phoneNumber,
                    status: 'FAILED',
                    errorMessage: 'WhatsApp service not configured (Missing credentials)',
                },
            });
            return { success: false, error: 'WhatsApp service not configured' };
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const verificationUrl = `${appUrl}/verify/${invoice.verificationHash}`;

        // Construct the message payload
        const payload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: phoneNumber.replace(/\D/g, ''), // Ensure clean number
            type: 'text',
            text: {
                preview_url: true,
                body: `Hello, here is your invoice *${invoice.invoiceNumber}* from *${invoice.seller.businessName || 'Us'}*.\n\nAmount: ${invoice.currency} ${Number(invoice.totalAmount).toLocaleString('en-IN')}${paymentText}\n\nView & Download: ${verificationUrl}`
            }
        };

        const response = await fetch(`https://graph.facebook.com/v17.0/${waConfig.phoneNumberId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${waConfig.accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('[WhatsApp Cloud API Error]', data);
            throw new Error(data.error?.message || 'Failed to send WhatsApp message');
        }

        const messageId = data.messages?.[0]?.id;

        await prisma.deliveryLog.create({
            data: {
                invoiceId,
                method: 'WHATSAPP',
                recipient: phoneNumber,
                status: 'SENT',
                messageId: messageId,
                sentAt: new Date(),
            },
        });

        return { success: true, messageId };

    } catch (error) {
        console.error('WhatsApp delivery failed:', error);

        // Log failure
        try {
            await prisma.deliveryLog.create({
                data: {
                    invoiceId,
                    method: 'WHATSAPP',
                    recipient: phoneNumber,
                    status: 'FAILED',
                    errorMessage: error instanceof Error ? error.message : 'Unknown error',
                },
            });
        } catch (logError) {
            console.error('Failed to log delivery failure:', logError);
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

// ============================================
// Smart Delivery (Auto-select method)
// ============================================
export async function deliverInvoice(
    invoiceId: string,
    email?: string,
    phone?: string,
    preferredMethod?: DeliveryMethod
): Promise<{ method: DeliveryMethod; success: boolean; error?: string }> {
    // If specific method requested
    if (preferredMethod === 'EMAIL') {
        if (!email) return { method: 'EMAIL', success: false, error: 'No email address found for buyer' };
        const result = await sendInvoiceEmail(invoiceId, email);
        return { method: 'EMAIL', ...result };
    }

    if (preferredMethod === 'WHATSAPP') {
        if (!phone) return { method: 'WHATSAPP', success: false, error: 'No phone number found for buyer' };
        const result = await sendInvoiceWhatsApp(invoiceId, phone);
        return { method: 'WHATSAPP', ...result };
    }

    if (preferredMethod === 'SMS') {
        if (!phone) return { method: 'SMS', success: false, error: 'No phone number found for buyer' };
        const result = await sendInvoiceSMS(invoiceId, phone);
        return { method: 'SMS', ...result };
    }

    // Auto-select (Smart Delivery)
    if (email) {
        const result = await sendInvoiceEmail(invoiceId, email);
        return { method: 'EMAIL', ...result };
    }

    if (phone) {
        const waResult = await sendInvoiceWhatsApp(invoiceId, phone);
        if (waResult.success) {
            return { method: 'WHATSAPP', ...waResult };
        }
    }

    return { method: 'EMAIL', success: false, error: 'No delivery destination provided' };
}

// ============================================
// Get Delivery History
// ============================================
export async function getDeliveryHistory(invoiceId: string) {
    return prisma.deliveryLog.findMany({
        where: { invoiceId },
        orderBy: { createdAt: 'desc' },
    });
}

// ============================================
// Retry Failed Delivery
// ============================================
export async function retryDelivery(deliveryLogId: string): Promise<{ success: boolean; error?: string }> {
    const log = await prisma.deliveryLog.findUnique({
        where: { id: deliveryLogId },
    });

    if (!log) {
        return { success: false, error: 'Delivery log not found' };
    }

    if (log.status !== 'FAILED') {
        return { success: false, error: 'Can only retry failed deliveries' };
    }

    switch (log.method) {
        case 'EMAIL':
            return sendInvoiceEmail(log.invoiceId, log.recipient);
        case 'SMS':
            return sendInvoiceSMS(log.invoiceId, log.recipient);
        case 'WHATSAPP':
            return sendInvoiceWhatsApp(log.invoiceId, log.recipient);
        default:
            return { success: false, error: 'Unknown delivery method' };
    }
}
