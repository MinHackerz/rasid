/**
 * Invoice Template Type Definitions
 */

import type { InvoiceWithRelations } from '@/types';

// Available template IDs
export type InvoiceTemplateId =
    | 'classic'
    | 'modern-minimal'
    | 'corporate'
    | 'executive'
    | 'elegant'
    | 'startup'
    | 'creative'
    | 'consultant'
    | 'retail'
    | 'luxury';

// Template configuration interface
export interface InvoiceTemplateConfig {
    id: InvoiceTemplateId;
    name: string;
    description: string;
    category: 'professional' | 'modern' | 'creative' | 'specialized';
    colors: {
        primary: string;
        secondary: string;
        accent: string;
    };
    thumbnail: string; // Base64 SVG or inline SVG
    generateHTML: (invoice: InvoiceWithRelations, qrCodeDataUrl: string, logoBase64: string | null) => string;
}

// Template metadata for UI display (without generateHTML function)
export interface InvoiceTemplatePreview {
    id: InvoiceTemplateId;
    name: string;
    description: string;
    category: 'professional' | 'modern' | 'creative' | 'specialized';
    colors: {
        primary: string;
        secondary: string;
        accent: string;
    };
    thumbnail: string;
}
