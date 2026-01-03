/**
 * Invoice Verification Service for Rasid Invoice Platform
 * 
 * Provides cryptographic signing and verification for invoices
 */

import CryptoJS from 'crypto-js';
import { prisma } from '@/lib/prisma';
import type { VerificationResult } from '@/types';

// Get verification secret - check lazily when needed
function getVerificationSecret(): string {
    const secret = process.env.VERIFICATION_SECRET;
    
    if (!secret) {
        // In development, use a default but warn strongly
        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production') {
            console.warn('\n⚠️  WARNING: VERIFICATION_SECRET not set!');
            console.warn('   Using default development secret. This is INSECURE for production!');
            console.warn('   Generate a secret: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
            console.warn('   Add to .env: VERIFICATION_SECRET="your-secret-here"\n');
            return 'rashid-verification-secret-dev-default-not-for-production';
        }
        
        // In production, fail hard
        throw new Error(
            'VERIFICATION_SECRET environment variable is REQUIRED in production. ' +
            'Generate one using: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"'
        );
    }
    
    // Validate secret length (should be at least 32 characters for security)
    if (secret.length < 32) {
        console.warn('⚠️  WARNING: VERIFICATION_SECRET is too short. Use at least 64 characters for better security.');
    }
    
    return secret;
}

// Get legacy secrets for verifying old invoices
// This allows verification of invoices created with previous secrets
function getLegacySecrets(): string[] {
    const legacySecrets: string[] = [];
    
    // Support multiple legacy secrets (VERIFICATION_SECRET_LEGACY_1, VERIFICATION_SECRET_LEGACY_2, etc.)
    let i = 1;
    while (process.env[`VERIFICATION_SECRET_LEGACY_${i}`]) {
        legacySecrets.push(process.env[`VERIFICATION_SECRET_LEGACY_${i}`]!);
        i++;
    }
    
    // Also support single legacy secret for convenience
    if (process.env.VERIFICATION_SECRET_LEGACY) {
        legacySecrets.push(process.env.VERIFICATION_SECRET_LEGACY);
    }
    
    // In development, automatically include the default dev secret as legacy
    // This allows verification of invoices created before VERIFICATION_SECRET was set
    if (process.env.NODE_ENV !== 'production') {
        const defaultDevSecret = 'rashid-verification-secret-dev-default-not-for-production';
        if (!legacySecrets.includes(defaultDevSecret)) {
            legacySecrets.push(defaultDevSecret);
        }
    }
    
    return legacySecrets;
}

// ============================================
// Hash Generation
// ============================================
export function generateVerificationHash(invoiceId: string, sellerId: string): string {
    const secret = getVerificationSecret();
    const data = `${invoiceId}:${sellerId}:${Date.now()}`;
    const hash = CryptoJS.SHA256(data + secret).toString(CryptoJS.enc.Hex);
    // Return first 12 characters for a shorter, user-friendly hash
    return hash.substring(0, 12).toUpperCase();
}

// ============================================
// Signature Generation
// ============================================
export interface InvoiceSignatureData {
    invoiceNumber: string;
    sellerId: string;
    buyerId?: string | null;
    issueDate: Date;
    dueDate?: Date | null;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    currency: string;
    notes?: string | null;
    terms?: string | null;
    items: Array<{
        description: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        taxRate: number;
        discount: number;
        amount: number;
        sortOrder: number;
    }>;
    buyer?: {
        name: string;
        email?: string | null;
        phone?: string | null;
        address?: string | null;
        taxId?: string | null;
    } | null;
}

// Helper to normalize invoice data for consistent hashing
// Deterministic JSON stringify that sorts all keys recursively
function deterministicStringify(obj: any): string {
    if (obj === null || obj === undefined) {
        return JSON.stringify(obj);
    }
    
    if (Array.isArray(obj)) {
        return '[' + obj.map(item => deterministicStringify(item)).join(',') + ']';
    }
    
    if (typeof obj === 'object') {
        const sortedKeys = Object.keys(obj).sort();
        const pairs = sortedKeys.map(key => {
            return JSON.stringify(key) + ':' + deterministicStringify(obj[key]);
        });
        return '{' + pairs.join(',') + '}';
    }
    
    return JSON.stringify(obj);
}

function normalizeInvoiceData(invoiceData: InvoiceSignatureData) {
    return {
        invoiceNumber: invoiceData.invoiceNumber,
        sellerId: invoiceData.sellerId,
        buyerId: invoiceData.buyerId || null,
        issueDate: invoiceData.issueDate.toISOString(),
        dueDate: invoiceData.dueDate?.toISOString() || null,
        subtotal: Number(invoiceData.subtotal),
        taxAmount: Number(invoiceData.taxAmount),
        discountAmount: Number(invoiceData.discountAmount),
        totalAmount: Number(invoiceData.totalAmount),
        currency: invoiceData.currency,
        notes: invoiceData.notes || null,
        terms: invoiceData.terms || null,
        // Sort items by sortOrder for consistent hashing
        items: invoiceData.items
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map(item => ({
                description: item.description,
                quantity: Number(item.quantity),
                unit: item.unit,
                unitPrice: Number(item.unitPrice),
                taxRate: Number(item.taxRate),
                discount: Number(item.discount),
                amount: Number(item.amount),
                sortOrder: item.sortOrder,
            })),
        buyer: invoiceData.buyer ? {
            name: invoiceData.buyer.name,
            email: invoiceData.buyer.email || null,
            phone: invoiceData.buyer.phone || null,
            address: invoiceData.buyer.address || null,
            taxId: invoiceData.buyer.taxId || null,
        } : null,
    };
}

export function generateInvoiceSignature(invoiceData: InvoiceSignatureData): string {
    const normalizedData = normalizeInvoiceData(invoiceData);
    // Use deterministic JSON stringify (recursively sorted keys)
    const dataString = deterministicStringify(normalizedData);
    const secret = getVerificationSecret();
    
    return CryptoJS.HmacSHA256(dataString, secret).toString(CryptoJS.enc.Hex);
}

// Generate signature with a specific secret (for legacy verification)
function generateSignatureWithSecret(invoiceData: InvoiceSignatureData, secret: string): string {
    const normalizedData = normalizeInvoiceData(invoiceData);
    const dataString = deterministicStringify(normalizedData);
    return CryptoJS.HmacSHA256(dataString, secret).toString(CryptoJS.enc.Hex);
}

// Generate signature using old JSON.stringify method (non-recursive sorting)
// This is for invoices created before we implemented deterministicStringify
function generateSignatureWithOldMethod(invoiceData: InvoiceSignatureData, secret: string): string {
    const normalizedData = normalizeInvoiceData(invoiceData);
    // Old method: only sorts top-level keys, not nested objects
    const dataString = JSON.stringify(normalizedData, Object.keys(normalizedData).sort());
    return CryptoJS.HmacSHA256(dataString, secret).toString(CryptoJS.enc.Hex);
}

// Generate signature using plain JSON.stringify (no sorting at all)
// This is for invoices created with the very first version
function generateSignatureWithPlainJSON(invoiceData: InvoiceSignatureData, secret: string): string {
    const normalizedData = normalizeInvoiceData(invoiceData);
    // Plain JSON.stringify with no sorting
    const dataString = JSON.stringify(normalizedData);
    return CryptoJS.HmacSHA256(dataString, secret).toString(CryptoJS.enc.Hex);
}

// ============================================
// Legacy Signature Format (Old - Only 4 fields)
// ============================================
// This is for invoices created before we expanded signature to include all fields
function generateLegacySignature(invoiceData: InvoiceSignatureData, secret: string): string {
    const legacyData = {
        invoiceNumber: invoiceData.invoiceNumber,
        sellerId: invoiceData.sellerId,
        totalAmount: invoiceData.totalAmount,
        issueDate: invoiceData.issueDate.toISOString(),
    };
    const dataString = JSON.stringify(legacyData, Object.keys(legacyData).sort());
    return CryptoJS.HmacSHA256(dataString, secret).toString(CryptoJS.enc.Hex);
}

// ============================================
// Signature Verification
// ============================================
export function verifyInvoiceSignature(
    invoiceData: InvoiceSignatureData,
    signature: string
): boolean {
    const currentSecret = getVerificationSecret();
    const legacySecrets = getLegacySecrets();
    const allSecrets = [currentSecret, ...legacySecrets];
    
    // Try all secrets with new format (all fields, deterministic stringify) first
    for (const secret of allSecrets) {
        const newFormatSignature = generateSignatureWithSecret(invoiceData, secret);
        if (newFormatSignature === signature) {
            return true;
        }
    }
    
    // Try old JSON.stringify method (non-recursive sorting)
    // This handles invoices created before we implemented deterministicStringify
    for (const secret of allSecrets) {
        const oldMethodSignature = generateSignatureWithOldMethod(invoiceData, secret);
        if (oldMethodSignature === signature) {
            return true;
        }
    }
    
    // Try plain JSON.stringify (no sorting at all)
    // This handles invoices created with the very first version
    for (const secret of allSecrets) {
        const plainJSONSignature = generateSignatureWithPlainJSON(invoiceData, secret);
        if (plainJSONSignature === signature) {
            return true;
        }
    }
    
    // If new format doesn't match, try legacy format (4 fields only)
    // This handles invoices created before we expanded the signature
    for (const secret of allSecrets) {
        const legacyFormatSignature = generateLegacySignature(invoiceData, secret);
        if (legacyFormatSignature === signature) {
            return true;
        }
    }
    
    return false;
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
            buyer: true,
            items: {
                orderBy: { sortOrder: 'asc' },
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

    // Verify the signature with ALL invoice data
    const isSignatureValid = verifyInvoiceSignature(
        {
            invoiceNumber: invoice.invoiceNumber,
            sellerId: invoice.sellerId,
            buyerId: invoice.buyerId,
            issueDate: invoice.issueDate,
            dueDate: invoice.dueDate,
            subtotal: Number(invoice.subtotal),
            taxAmount: Number(invoice.taxAmount),
            discountAmount: Number(invoice.discountAmount),
            totalAmount: Number(invoice.totalAmount),
            currency: invoice.currency,
            notes: invoice.notes,
            terms: invoice.terms,
            items: invoice.items.map(item => ({
                description: item.description,
                quantity: Number(item.quantity),
                unit: item.unit,
                unitPrice: Number(item.unitPrice),
                taxRate: Number(item.taxRate),
                discount: Number(item.discount),
                amount: Number(item.amount),
                sortOrder: item.sortOrder,
            })),
            buyer: invoice.buyer ? {
                name: invoice.buyer.name,
                email: invoice.buyer.email,
                phone: invoice.buyer.phone,
                address: invoice.buyer.address,
                taxId: invoice.buyer.taxId,
            } : null,
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
            dueDate: invoice.dueDate,
            subtotal: Number(invoice.subtotal),
            taxAmount: Number(invoice.taxAmount),
            discountAmount: Number(invoice.discountAmount),
            totalAmount: Number(invoice.totalAmount),
            sellerName: invoice.seller.businessName,
            currency: invoice.currency,
            notes: invoice.notes,
            terms: invoice.terms,
            items: invoice.items.map(item => ({
                description: item.description,
                quantity: Number(item.quantity),
                unit: item.unit,
                unitPrice: Number(item.unitPrice),
                taxRate: Number(item.taxRate),
                discount: Number(item.discount),
                amount: Number(item.amount),
            })),
            buyer: invoice.buyer ? {
                name: invoice.buyer.name,
                email: invoice.buyer.email,
                phone: invoice.buyer.phone,
                address: invoice.buyer.address,
                taxId: invoice.buyer.taxId,
            } : null,
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
