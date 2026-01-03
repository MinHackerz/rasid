/**
 * Helper utilities for invoice templates
 */

import type { InvoiceWithRelations } from '@/types';
import { getCurrencyTaxName, getCurrencyTaxIdLabel } from '@/lib/currencies';

// Bank detail labels mapping
export const BANK_LABELS: Record<string, string> = {
  bankName: 'Bank Name',
  accountNumber: 'Account Number',
  accountHolder: 'Account Holder',
  ifscCode: 'IFSC Code',
  swiftCode: 'SWIFT Code',
  iban: 'IBAN',
  routingNumber: 'Routing Number',
};

// Format currency helper
export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

// Format date helper
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

// Generate bank details HTML
export function generateBankDetailsHTML(bankDetails: Record<string, string> | null, styles: string = ''): string {
  if (!bankDetails) return '';

  const entries = Object.entries(bankDetails)
    .filter(([_, value]) => value && value.trim() !== '');

  if (entries.length === 0) return '';

  return `
    <div class="bank-details" ${styles ? `style="${styles}"` : ''}>
      <h4>Payment Details</h4>
      ${entries.map(([key, value]) => `
        <p><strong>${BANK_LABELS[key] || key}:</strong> ${value}</p>
      `).join('')}
    </div>
  `;
}

// Common CSS reset and base styles
export const BASE_CSS = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 12px;
    line-height: 1.5;
    color: #1a1a1a;
    background: #ffffff;
    padding: 40px;
  }
  
  .invoice-container {
    max-width: 800px;
    margin: 0 auto;
  }
  
  @media print {
    body {
      padding: 20px;
    }
    
    .invoice-container {
      max-width: 100%;
    }
  }
`;

// Generate invoice items table
export function generateItemsTableHTML(invoice: InvoiceWithRelations, tableStyles: {
  headerBg?: string;
  headerColor?: string;
  borderColor?: string;
  stripedBg?: string;
} = {}): string {
  const {
    headerBg = '#f8f8f8',
    headerColor = '#666',
    borderColor = '#e5e5e5',
    stripedBg = '#fafafa'
  } = tableStyles;

  return `
    <table class="items-table" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
      <thead style="background: ${headerBg};">
        <tr>
          <th style="padding: 12px 16px; text-align: left; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: ${headerColor}; border-bottom: 1px solid ${borderColor}; width: 50%;">Description</th>
          <th style="padding: 12px 16px; text-align: left; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: ${headerColor}; border-bottom: 1px solid ${borderColor};">Qty</th>
          <th style="padding: 12px 16px; text-align: left; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: ${headerColor}; border-bottom: 1px solid ${borderColor};">Unit</th>
          <th style="padding: 12px 16px; text-align: left; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: ${headerColor}; border-bottom: 1px solid ${borderColor};">Rate</th>
          <th style="padding: 12px 16px; text-align: left; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: ${headerColor}; border-bottom: 1px solid ${borderColor};">${getCurrencyTaxName(invoice.currency)}</th>
          <th style="padding: 12px 16px; text-align: right; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: ${headerColor}; border-bottom: 1px solid ${borderColor};">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${(invoice.items || []).map((item, index) => `
          <tr style="background: ${index % 2 === 1 ? stripedBg : 'transparent'};">
            <td style="padding: 14px 16px; border-bottom: 1px solid ${borderColor}; font-weight: 500;">${item.description}</td>
            <td style="padding: 14px 16px; border-bottom: 1px solid ${borderColor};">${item.quantity}</td>
            <td style="padding: 14px 16px; border-bottom: 1px solid ${borderColor};">${item.unit}</td>
            <td style="padding: 14px 16px; border-bottom: 1px solid ${borderColor};">${formatCurrency(Number(item.unitPrice), invoice.currency)}</td>
            <td style="padding: 14px 16px; border-bottom: 1px solid ${borderColor};">${item.taxRate}%</td>
            <td style="padding: 14px 16px; border-bottom: 1px solid ${borderColor}; text-align: right;">${formatCurrency(Number(item.amount), invoice.currency)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// Generate totals section HTML
export function generateTotalsHTML(invoice: InvoiceWithRelations, styles: {
  borderColor?: string;
  labelColor?: string;
  finalBorderColor?: string;
} = {}): string {
  const {
    borderColor = '#f0f0f0',
    labelColor = '#666',
    finalBorderColor = '#0a0a0a'
  } = styles;

  return `
    <div style="display: flex; justify-content: flex-end; margin-bottom: 40px;">
      <div style="width: 280px;">
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid ${borderColor};">
          <span style="color: ${labelColor};">Subtotal</span>
          <span style="font-weight: 600;">${formatCurrency(Number(invoice.subtotal), invoice.currency)}</span>
        </div>
        ${Number(invoice.taxAmount) > 0 ? `
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid ${borderColor};">
            <span style="color: ${labelColor};">${getCurrencyTaxName(invoice.currency)}</span>
            <span style="font-weight: 600;">${formatCurrency(Number(invoice.taxAmount), invoice.currency)}</span>
          </div>
        ` : ''}
        ${Number(invoice.discountAmount) > 0 ? `
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid ${borderColor};">
            <span style="color: ${labelColor};">Discount</span>
            <span style="font-weight: 600;">-${formatCurrency(Number(invoice.discountAmount), invoice.currency)}</span>
          </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between; border-top: 2px solid ${finalBorderColor}; margin-top: 8px; padding-top: 16px;">
          <span style="font-size: 16px; font-weight: 700;">Total Due</span>
          <span style="font-size: 16px; font-weight: 700;">${formatCurrency(Number(invoice.totalAmount), invoice.currency)}</span>
        </div>
      </div>
    </div>
  `;
}
