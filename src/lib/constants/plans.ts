
export type PlanType = 'FREE' | 'BASIC' | 'PRO' | 'PREMIUM' | 'LIFETIME';

export interface PlanDetails {
    name: string;
    price: number; // Monthly price in USD (assuming $)
    period?: 'monthly' | 'lifetime';
    features: string[];
    limits: {
        invoices: number;
        templates: number; // Count of available templates
        templateIds: string[]; // IDs of available templates (if specific)
        teamMembers: number;
        pdfApi: number;
        inventory: boolean;
        ocr: number;
        emailIntegration: boolean;
        businesses: number; // Number of businesses allowed (999999 means unlimited)
        paymentReminders: boolean; // Smart payment reminders feature
    };
    dodoProductId?: string;
}

export const PLANS: Record<PlanType, PlanDetails> = {
    FREE: {
        name: 'Free',
        price: 0,
        features: [
            '1 business',
            '10 invoices/month',
            'QR Coded Invoices',
            'Instantly verifiable',
            'PDF Download',
            '1 pdf template (classic)'
        ],
        limits: {
            invoices: 10,
            templates: 1,
            templateIds: ['classic'],
            teamMembers: 1,
            pdfApi: 0,
            inventory: false,
            ocr: 0,
            emailIntegration: false,
            businesses: 1,
            paymentReminders: false
        }
    },
    BASIC: {
        name: 'Basic',
        price: 10,
        features: [
            '3 businesses',
            '2000 invoices/month',
            'QR Coded Invoices',
            'Instantly verifiable',
            'PDF Download',
            'Send invoice with mail and whatsapp instantly',
            'Payment collection mail with email/whatsapp',
            '3 team members',
            'Access to 5 pdf templates',
            '1000 pdf api/month',
            'Smart Payment Reminders',
            'Basic email support'
        ],
        limits: {
            invoices: 2000,
            templates: 5,
            templateIds: ['classic', 'modern_minimal', 'corporate_professional', 'bold_executive', 'elegant_serif'],
            teamMembers: 3,
            pdfApi: 1000,
            inventory: false,
            ocr: 0,
            emailIntegration: true,
            businesses: 3,
            paymentReminders: true
        },
        dodoProductId: process.env.DODO_PRODUCT_ID_BASIC
    },
    PRO: {
        name: 'Pro',
        price: 20,
        features: [
            '10 businesses',
            '5000 invoices/month',
            'QR Coded Invoices',
            'Instantly verifiable',
            'PDF Download',
            'Share invoice with mail and whatsapp',
            'Payment collection mail',
            '10 team members',
            'Access to all pdf templates',
            '2000 pdf api/month',
            'Unlimited Inventory Management',
            'Barcode Scanner for Inventory',
            'Customer Search & Auto-fill',
            'Advanced Analytics Dashboard',
            'Smart Payment Reminders',
            'Instant email support'
        ],
        limits: {
            invoices: 5000,
            templates: 10,
            templateIds: ['all'], // 'all' means all available
            teamMembers: 10,
            pdfApi: 2000,
            inventory: true,
            ocr: 0,
            emailIntegration: true,
            businesses: 10,
            paymentReminders: true
        },
        dodoProductId: process.env.DODO_PRODUCT_ID_PRO
    },
    PREMIUM: {
        name: 'Premium',
        price: 40,
        features: [
            'Unlimited businesses',
            '12000 invoices/month',
            'QR Coded Invoices',
            'Instantly verifiable',
            'Unlimited PDF Download',
            'Unlimited share invoice',
            'Payment collection mail',
            '10 team members',
            'Access to all pdf templates',
            '5000 pdf api/month',
            'Unlimited Inventory Management',
            'Barcode Scanner for Inventory',
            'Customer Search & Auto-fill',
            'Advanced Analytics Dashboard',
            'Smart Payment Reminders',
            '2000 handwritten to digital invoices/month',
            'Exclusive access to upcoming features',
            'Instant email support'
        ],
        limits: {
            invoices: 12000,
            templates: 10,
            templateIds: ['all'],
            teamMembers: 10,
            pdfApi: 5000,
            inventory: true,
            ocr: 2000,
            emailIntegration: true,
            businesses: 999999, // Unlimited
            paymentReminders: true
        },
        dodoProductId: process.env.DODO_PRODUCT_ID_PREMIUM
    },
    LIFETIME: {
        name: 'Lifetime',
        price: 199,
        period: 'lifetime',
        features: [
            'Unlimited businesses',
            '50000 invoices/month (Lifetime)',
            'QR Coded Invoices',
            'Instantly verifiable',
            'Unlimited PDF Download',
            'Unlimited share invoice',
            'Unlimited payment collection mail',
            '10 team members',
            'Access to all pdf templates',
            '10000 pdf api/month',
            'Unlimited Inventory Management',
            'Barcode Scanner for Inventory',
            'Customer Search & Auto-fill',
            'Advanced Analytics Dashboard',
            'Smart Payment Reminders',
            '10000 handwritten to digital invoices',
            'Exclusive access to upcoming features',
            'Direct support from the founder'
        ],
        limits: {
            invoices: 50000,
            templates: 10,
            templateIds: ['all'],
            teamMembers: 10,
            pdfApi: 10000,
            inventory: true,
            ocr: 10000,
            emailIntegration: true,
            businesses: 999999, // Unlimited
            paymentReminders: true
        },
        dodoProductId: process.env.DODO_PRODUCT_ID_LIFETIME
    }
};
