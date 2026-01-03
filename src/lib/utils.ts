import { clsx, type ClassValue } from 'clsx';

// ============================================
// Class Name Utility
// ============================================
export function cn(...inputs: ClassValue[]): string {
    return clsx(inputs);
}

// ============================================
// Format Currency
// ============================================
export function formatCurrency(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

export function formatCompactNumber(amount: number, currency: string = 'INR'): string {
    // For small amounts, show full currency format
    if (amount < 1000) {
        return formatCurrency(amount, currency);
    }

    // For large amounts, use compact notation
    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        notation: 'compact',
        maximumFractionDigits: 1,
    });

    return formatter.format(amount);
}

// ============================================
// Format Date
// ============================================
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'medium',
        ...options,
    }).format(d);
}

export function formatDateTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(d);
}

// ============================================
// Generate Invoice Number
// ============================================
export function generateInvoiceNumber(prefix: string = 'INV'): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
}

// ============================================
// Calculate Invoice Totals
// ============================================
export function calculateLineItemTotal(
    quantity: number,
    unitPrice: number,
    taxRate: number = 0,
    discount: number = 0
): { amount: number; taxAmount: number } {
    const subtotal = quantity * unitPrice - discount;
    const taxAmount = subtotal * (taxRate / 100);
    return {
        amount: subtotal + taxAmount,
        taxAmount,
    };
}

export function calculateInvoiceTotal(
    items: Array<{ quantity: number; unitPrice: number; taxRate?: number; discount?: number }>
): { subtotal: number; taxAmount: number; total: number } {
    let subtotal = 0;
    let taxAmount = 0;

    for (const item of items) {
        const itemSubtotal = item.quantity * item.unitPrice - (item.discount || 0);
        const itemTax = itemSubtotal * ((item.taxRate || 0) / 100);
        subtotal += itemSubtotal;
        taxAmount += itemTax;
    }

    return {
        subtotal,
        taxAmount,
        total: subtotal + taxAmount,
    };
}

// ============================================
// Validation Helpers
// ============================================
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
    // Supports Indian phone numbers with or without country code
    const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// ============================================
// File Helpers
// ============================================
export function getFileExtension(filename: string): string {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
}

export function isValidImageFile(mimeType: string): boolean {
    return ['image/jpeg', 'image/png', 'image/webp'].includes(mimeType);
}

export function isValidPdfFile(mimeType: string): boolean {
    return mimeType === 'application/pdf';
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ============================================
// Slug/ID Helpers
// ============================================
export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

export function truncate(text: string, length: number): string {
    if (text.length <= length) return text;
    return text.slice(0, length) + '...';
}

// ============================================
// Delay Utility
// ============================================
export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================
// Safe JSON Parse
// ============================================
export function safeJsonParse<T>(json: string, fallback: T): T {
    try {
        return JSON.parse(json) as T;
    } catch {
        return fallback;
    }
}
