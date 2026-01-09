// Type definitions for Rasid Invoice Platform

// ============================================
// API Response Types
// ============================================
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}

// ============================================
// Auth Types
// ============================================
export interface JWTPayload {
    sellerId: string;
    email: string;
    businessName: string;
    iat?: number;
    exp?: number;
}

export interface AuthSession {
    sellerId: string;
    email: string;
    businessName: string;
    role?: 'OWNER' | 'ADMIN' | 'VIEWER';
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    businessName: string;
    phone?: string;
}

// ============================================
// Invoice Types
// ============================================
// export type InvoiceStatus = 'DRAFT' | 'PENDING' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'; // Deprecated
export type InvoiceStatus = string; // Loose type for backwards compat
export type PaymentStatus = 'DRAFT' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type InvoiceDeliveryStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'DOWNLOADED';
export type SourceType = 'MANUAL' | 'OCR' | 'IMPORTED';
export type DeliveryMethod = 'EMAIL' | 'WHATSAPP' | 'SMS';
export type DeliveryStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'BOUNCED'; // For DeliveryLog
export type ProcessingStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REVIEW_NEEDED';

export interface InvoiceItemInput {
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    taxRate: number;
    discount: number;
    inventoryItemId?: string; // Link to inventory for stock deduction
}

export interface CreateInvoiceInput {
    buyerId?: string;
    buyerName?: string;
    buyerEmail?: string;
    buyerPhone?: string;
    buyerAddress?: string;
    buyerState?: string;
    buyerTaxId?: string;
    issueDate?: Date;
    dueDate?: Date;
    items: InvoiceItemInput[];
    notes?: string;
    terms?: string;
    currency?: string;
    taxAmount?: number;
    discountAmount?: number;
    status?: InvoiceStatus;
    paymentStatus?: PaymentStatus;
    deliveryStatus?: InvoiceDeliveryStatus;
    sourceDocumentId?: string;
    sellerDetails?: {
        businessName?: string;
        businessAddress?: string;
        phone?: string;
        email?: string;
        taxId?: string;
    };
}

export interface InvoiceWithRelations {
    id: string;
    invoiceNumber: string;
    sellerId: string;
    buyerId: string | null;
    issueDate: Date;
    dueDate: Date | null;
    status: InvoiceStatus;
    paymentStatus: PaymentStatus;
    deliveryStatus: InvoiceDeliveryStatus;
    subtotal: number;
    taxAmount: number;
    cgstAmount?: number;
    sgstAmount?: number;
    igstAmount?: number;
    discountAmount: number;
    totalAmount: number;
    currency: string;
    notes: string | null;
    terms: string | null;
    verificationHash: string;
    signature: string;
    pdfUrl: string | null;
    sourceType: SourceType;
    createdAt: Date;
    updatedAt: Date;
    buyer: {
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        address: string | null;
        state: string | null;
        taxId: string | null;
    } | null;
    items: {
        id: string;
        description: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        taxRate: number;
        cgstRate?: number;
        sgstRate?: number;
        igstRate?: number;
        cgstAmount?: number;
        sgstAmount?: number;
        igstAmount?: number;
        discount: number;
        amount: number;
        sortOrder: number;
    }[];
    seller: {
        id: string;
        businessName: string;
        businessAddress: string | null;
        phone: string | null;
        email: string;
        logo: string | null;
        taxId: string | null;
        bankDetails: Record<string, string> | null;
        integrations?: {
            whatsapp?: {
                phoneNumberId: string;
                accessToken: string;
                businessAccountId?: string;
            };
            email?: {
                smtpHost: string;
                smtpPort: string;
                smtpUser: string;
                smtpPass: string;
                fromEmail: string;
            };
        };
    };
    sourceDocument?: {
        extractedData: any;
    } | null;
}

// ============================================
// OCR Types
// ============================================
export interface OCRResult {
    text: string;
    confidence: number;
    boundingBox?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

export interface ExtractedInvoiceData {
    sellerName?: string;
    buyerName?: string;
    invoiceDate?: string;
    invoiceNumber?: string;
    items: ExtractedLineItem[];
    subtotal?: number;
    taxAmount?: number;
    totalAmount?: number;
    confidence: number;
    rawText: string;
}

export interface ExtractedLineItem {
    name: string;
    quantity?: number;
    unitPrice?: number;
    amount?: number;
    confidence: number;
}

// ============================================
// Dashboard Types
// ============================================
export interface DashboardStats {
    totalInvoices: number;
    totalRevenue: number;
    monthlyRevenue: number;
    pendingAmount: number; // Sum of total amounts for pending invoices
    invoicesByStatus: Record<InvoiceStatus, number>;
    recentInvoices: InvoiceWithRelations[];
}

export interface SalesBreakdown {
    byItem: {
        description: string;
        quantity: number;
        revenue: number;
    }[];
    byDate: {
        date: string;
        count: number;
        revenue: number;
    }[];
}

// ============================================
// Verification Types
// ============================================
export interface VerificationResult {
    valid: boolean;
    status: 'VALID' | 'NOT_FOUND' | 'TAMPERED';
    invoice?: {
        invoiceNumber: string;
        issueDate: Date;
        dueDate?: Date | null;
        subtotal: number;
        taxAmount: number;
        discountAmount: number;
        totalAmount: number;
        sellerName: string;
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
        }>;
        buyer?: {
            name: string;
            email?: string | null;
            phone?: string | null;
            address?: string | null;
            taxId?: string | null;
        } | null;
    };
}

// ============================================
// File Upload Types
// ============================================
export interface UploadedFile {
    id: string;
    originalName: string;
    storagePath: string;
    mimeType: string;
    fileSize: number;
    pageCount: number;
}

export interface ProcessingResult {
    documentId: string;
    status: ProcessingStatus;
    extractedData?: ExtractedInvoiceData;
    error?: string;
}
