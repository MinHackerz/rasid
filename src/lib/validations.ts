/**
 * Zod Validation Schemas for Rasid Invoice Platform
 */

import { z } from 'zod';
import type { PaymentStatus, InvoiceDeliveryStatus } from '@/types';

// ============================================
// Auth Schemas
// ============================================
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    businessName: z.string().min(2, 'Business name is required'),
    phone: z.string().optional(),
});

export const magicLinkSchema = z.object({
    email: z.string().email('Invalid email address'),
});

// ============================================
// Buyer Schemas
// ============================================
export const buyerSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
    state: z.string().optional(),
    taxId: z.string().optional(),
});

// ============================================
// Invoice Item Schemas
// ============================================
export const invoiceItemSchema = z.object({
    description: z.string().min(1, 'Description is required'),
    quantity: z.number().positive('Quantity must be positive'),
    unit: z.string().default('pcs'),
    unitPrice: z.number().min(0, 'Price cannot be negative'),
    taxRate: z.number().min(0).max(100).default(0),
    discount: z.number().min(0).default(0),
});

// ============================================
// Invoice Schemas
// ============================================
export const createInvoiceSchema = z.object({
    // Buyer can be existing or new
    buyerId: z.string().optional(),
    buyerName: z.string().optional(),
    buyerEmail: z.string().email().optional().or(z.literal('')),
    buyerPhone: z.string().optional(),
    buyerAddress: z.string().optional(),
    buyerState: z.string().optional(),

    // Invoice details
    issueDate: z.coerce.date().optional(),
    dueDate: z.coerce.date().optional(),

    // Items
    items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),

    // Additional
    notes: z.string().optional(),
    terms: z.string().optional(),
    currency: z.string().default('INR'),

    // Manual adjustments
    taxAmount: z.number().min(0).optional(),
    discountAmount: z.number().min(0).optional(),

    // Status
    status: z.enum(['DRAFT', 'PENDING', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),

    // Source (for digitized)
    sourceDocumentId: z.string().optional(),

    // Custom Seller Details override
    sellerDetails: z.object({
        businessName: z.string().optional(),
        businessAddress: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        taxId: z.string().optional(),
    }).optional(),
}).refine(
    (data) => data.buyerId || data.buyerName,
    { message: 'Either buyer ID or buyer name is required', path: ['buyerName'] }
);

export const updateInvoiceSchema = createInvoiceSchema.partial().extend({
    status: z.enum(['DRAFT', 'PENDING', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
});

// ============================================
// OCR Review Schema
// ============================================
export const ocrReviewSchema = z.object({
    documentId: z.string(),
    extractedData: z.object({
        sellerName: z.string().optional(),
        buyerName: z.string().optional(),
        invoiceDate: z.string().optional(),
        invoiceNumber: z.string().optional(),
        items: z.array(z.object({
            name: z.string(),
            quantity: z.number().optional(),
            unitPrice: z.number().optional(),
            amount: z.number().optional(),
        })),
        subtotal: z.number().optional(),
        taxAmount: z.number().optional(),
        totalAmount: z.number().optional(),
    }),
    approved: z.boolean(),
});

// ============================================
// Delivery Schema
// ============================================
export const deliverySchema = z.object({
    invoiceId: z.string(),
    method: z.enum(['EMAIL', 'WHATSAPP', 'SMS', 'AUTO']),
    recipient: z.string().optional(),
});

// ============================================
// Profile Update Schema
// ============================================
export const updateProfileSchema = z.object({
    businessName: z.string().min(2).optional(),
    logo: z.string().nullable().optional(),
    businessAddress: z.string().optional(),
    phone: z.string().optional(),
    taxId: z.string().optional(),
    state: z.string().optional(),
    integrations: z.any().optional(),
    invoiceDefaults: z.any().optional(),
});

// ============================================
// File Upload Schema
// ============================================
export const fileUploadSchema = z.object({
    file: z.instanceof(File).refine(
        (file) => file.size <= 10 * 1024 * 1024,
        'File size must be less than 10MB'
    ).refine(
        (file) => ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type),
        'File must be an image (JPEG, PNG, WebP) or PDF'
    ),
});

// ============================================
// Type Exports
// ============================================
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type BuyerInput = z.infer<typeof buyerSchema>;
export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema> & {
    paymentStatus?: PaymentStatus;
    deliveryStatus?: InvoiceDeliveryStatus;
    buyerState?: string;
    buyerTaxId?: string;
};
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type OCRReviewInput = z.infer<typeof ocrReviewSchema>;
export type DeliveryInput = z.infer<typeof deliverySchema>;
export type ProfileUpdateInput = z.infer<typeof updateProfileSchema>;
