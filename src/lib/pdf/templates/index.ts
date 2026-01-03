/**
 * Invoice Templates Registry
 * 
 * Central registry for all invoice templates
 */

import type { InvoiceTemplateConfig, InvoiceTemplateId, InvoiceTemplatePreview } from './types';

// Import all templates
import { classicTemplate } from './classic';
import { modernMinimalTemplate } from './modern-minimal';
import { corporateTemplate } from './corporate';
import { executiveTemplate } from './executive';
import { elegantTemplate } from './elegant';
import { startupTemplate } from './startup';
import { creativeTemplate } from './creative';
import { consultantTemplate } from './consultant';
import { retailTemplate } from './retail';
import { luxuryTemplate } from './luxury';

// Export types
export type { InvoiceTemplateConfig, InvoiceTemplateId, InvoiceTemplatePreview } from './types';

// All available templates
export const INVOICE_TEMPLATES: InvoiceTemplateConfig[] = [
    classicTemplate,
    modernMinimalTemplate,
    corporateTemplate,
    executiveTemplate,
    elegantTemplate,
    startupTemplate,
    creativeTemplate,
    consultantTemplate,
    retailTemplate,
    luxuryTemplate,
];

// Default template ID
export const DEFAULT_TEMPLATE_ID: InvoiceTemplateId = 'classic';

// Get template by ID
export function getTemplateById(templateId: string | undefined | null): InvoiceTemplateConfig {
    if (!templateId) {
        return classicTemplate;
    }

    const template = INVOICE_TEMPLATES.find(t => t.id === templateId);
    return template || classicTemplate;
}

// Get template previews for UI (without generateHTML function)
export function getTemplatePreviews(): InvoiceTemplatePreview[] {
    return INVOICE_TEMPLATES.map(({ id, name, description, category, colors, thumbnail }) => ({
        id,
        name,
        description,
        category,
        colors,
        thumbnail,
    }));
}

// Export individual templates for direct access
export {
    classicTemplate,
    modernMinimalTemplate,
    corporateTemplate,
    executiveTemplate,
    elegantTemplate,
    startupTemplate,
    creativeTemplate,
    consultantTemplate,
    retailTemplate,
    luxuryTemplate,
};
