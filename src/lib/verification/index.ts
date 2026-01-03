/**
 * Invoice Verification Service for Rasid Invoice Platform
 * 
 * Provides cryptographic signing and verification for invoices
 */

import CryptoJS from 'crypto-js';
import { prisma } from '@/lib/prisma';
import type { VerificationResult } from '@/types';

const VERIFICATION_SECRET = process.env.VERIFICATION_SECRET || 'rashid-verification-secret';

// ============================================
// Hash Generation
// ============================================
export function generateVerificationHash(invoiceId: string, sellerId: string): string {
    const data = `${invoiceId}:${sellerId}:${Date.now()}`;
    const hash = CryptoJS.SHA256(data + VERIFICATION_SECRET).toString(CryptoJS.enc.Hex);
    // Return first 12 characters for a shorter, user-friendly hash
    return hash.substring(0, 12).toUpperCase();
}

// ============================================
// Signature Generation
// ============================================
export function generateInvoiceSignature(invoiceData: {
    invoiceNumber: string;
    sellerId: string;
    totalAmount: number;
    issueDate: Date;
}): string {
    const dataString = JSON.stringify({
        invoiceNumber: invoiceData.invoiceNumber,
        sellerId: invoiceData.sellerId,
        totalAmount: invoiceData.totalAmount,
        issueDate: invoiceData.issueDate.toISOString(),
    });

    return CryptoJS.HmacSHA256(dataString, VERIFICATION_SECRET).toString(CryptoJS.enc.Hex);
}

// ============================================
// Signature Verification
// ============================================
export function verifyInvoiceSignature(
    invoiceData: {
        invoiceNumber: string;
        sellerId: string;
        totalAmount: number;
        issueDate: Date;
    },
    signature: string
): boolean {
    const expectedSignature = generateInvoiceSignature(invoiceData);
    return expectedSignature === signature;
}

// ============================================
// Public Verification
// ============================================
export async function verifyInvoice(hash: string, ipAddress?: string, userAgent?: string): Promise<VerificationResult> {
    // Find invoice by verification hash
    const invoice = await prisma.invoice.findUnique({
        where: { verificationHash: hash },
        include: {
            seller: {
                select: {
                    businessName: true,
                },
            },
        },
    });

    // Log the verification attempt
    await prisma.verificationLog.create({
        data: {
            hash,
            ipAddress,
            userAgent,
            result: !!invoice,
        },
    });

    if (!invoice) {
        return {
            valid: false,
            status: 'NOT_FOUND',
        };
    }

    // Verify the signature to check for tampering
    const isSignatureValid = verifyInvoiceSignature(
        {
            invoiceNumber: invoice.invoiceNumber,
            sellerId: invoice.sellerId,
            totalAmount: Number(invoice.totalAmount),
            issueDate: invoice.issueDate,
        },
        invoice.signature
    );

    if (!isSignatureValid) {
        return {
            valid: false,
            status: 'TAMPERED',
        };
    }

    return {
        valid: true,
        status: 'VALID',
        invoice: {
            invoiceNumber: invoice.invoiceNumber,
            issueDate: invoice.issueDate,
            totalAmount: Number(invoice.totalAmount),
            sellerName: invoice.seller.businessName,
            currency: invoice.currency,
        },
    };
}

// ============================================
// Get Verification Stats
// ============================================
export async function getVerificationStats(invoiceId: string) {
    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        select: { verificationHash: true },
    });

    if (!invoice) {
        return null;
    }

    const stats = await prisma.verificationLog.groupBy({
        by: ['result'],
        where: { hash: invoice.verificationHash },
        _count: true,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalChecks = stats.reduce((sum: number, s: any) => sum + s._count, 0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const successfulChecks = stats.find((s: any) => s.result)?._count || 0;

    return {
        totalChecks,
        successfulChecks,
        failedChecks: totalChecks - successfulChecks,
    };
}
