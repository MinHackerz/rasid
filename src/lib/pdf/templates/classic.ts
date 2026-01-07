/**
 * Classic Template - Clean, professional default design
 */

import type { InvoiceTemplateConfig } from './types';
import type { InvoiceWithRelations } from '@/types';
import { formatCurrency, formatDate, BANK_LABELS } from './helpers';
import { getCurrencyTaxName, getCurrencyTaxIdLabel } from '@/lib/currencies';

export const classicTemplate: InvoiceTemplateConfig = {
  id: 'classic',
  name: 'Classic',
  description: 'Clean and professional - perfect for any business',
  category: 'professional',
  colors: {
    primary: '#0a0a0a',
    secondary: '#666666',
    accent: '#f8f8f8',
  },
  thumbnail: `<svg viewBox="0 0 200 260" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="260" fill="white"/>
    <rect x="16" y="16" width="80" height="10" rx="2" fill="#0a0a0a"/>
    <rect x="16" y="30" width="60" height="6" rx="1" fill="#e5e5e5"/>
    <rect x="140" y="16" width="44" height="28" rx="2" fill="#f8f8f8"/>
    <rect x="16" y="60" width="168" height="1" fill="#e5e5e5"/>
    <rect x="16" y="75" width="40" height="6" rx="1" fill="#0a0a0a"/>
    <rect x="16" y="85" width="70" height="5" rx="1" fill="#e5e5e5"/>
    <rect x="16" y="110" width="168" height="20" rx="2" fill="#f8f8f8"/>
    <rect x="16" y="135" width="168" height="12" rx="1" fill="#fafafa"/>
    <rect x="16" y="150" width="168" height="12" rx="1" fill="white" stroke="#f0f0f0"/>
    <rect x="16" y="165" width="168" height="12" rx="1" fill="#fafafa"/>
    <rect x="120" y="190" width="64" height="40" rx="2" fill="white" stroke="#e5e5e5"/>
    <rect x="128" y="198" width="48" height="6" rx="1" fill="#e5e5e5"/>
    <rect x="128" y="208" width="48" height="6" rx="1" fill="#e5e5e5"/>
    <rect x="128" y="220" width="48" height="6" rx="1" fill="#0a0a0a"/>
  </svg>`,
  generateHTML: (invoice: InvoiceWithRelations, qrCodeDataUrl: string, logoBase64: string | null): string => {
    const items = invoice.items || [];

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 12px;
      line-height: 1.5;
      color: #1a1a1a;
      background: #ffffff;
      padding: 40px;
    }
    .invoice-container { max-width: 800px; margin: 0 auto; }
    .invoice-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e5e5e5;
    }
    .company-info h1 { font-size: 24px; font-weight: 700; color: #0a0a0a; margin-bottom: 8px; }
    .company-info p { color: #666; font-size: 11px; }
    .invoice-title { text-align: right; }
    .invoice-title h2 { font-size: 32px; font-weight: 300; color: #0a0a0a; letter-spacing: 2px; text-transform: uppercase; }
    .invoice-number { font-size: 14px; font-weight: 600; color: #666; margin-top: 8px; }
    .details-section { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .details-block { flex: 1; }
    .details-block h3 { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 8px; }
    .details-block p { font-size: 12px; margin-bottom: 4px; }
    .details-block .name { font-weight: 600; font-size: 14px; color: #0a0a0a; }
    .invoice-meta { text-align: right; }
    .meta-row { display: flex; justify-content: flex-end; margin-bottom: 4px; }
    .meta-label { color: #666; margin-right: 16px; width: 100px; text-align: right; }
    .meta-value { font-weight: 600; width: 120px; text-align: left; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .items-table thead { background: #f8f8f8; }
    .items-table th { padding: 12px 16px; text-align: left; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #666; border-bottom: 1px solid #e5e5e5; }
    .items-table th:last-child, .items-table td:last-child { text-align: right; }
    .items-table td { padding: 14px 16px; border-bottom: 1px solid #f0f0f0; }
    .items-table tbody tr:nth-child(even) { background: #fafafa; }
    .item-description { font-weight: 500; }
    .totals-section { display: flex; justify-content: flex-end; margin-bottom: 40px; }
    .totals-table { width: 280px; }
    .totals-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
    .totals-row.final { border-bottom: none; border-top: 2px solid #0a0a0a; margin-top: 8px; padding-top: 16px; }
    .totals-row.final .totals-label, .totals-row.final .totals-value { font-size: 16px; font-weight: 700; }
    .totals-label { color: #666; }
    .totals-value { font-weight: 600; }
    .invoice-footer { display: flex; justify-content: space-between; align-items: flex-end; padding-top: 30px; border-top: 1px solid #e5e5e5; }
    .notes-section { flex: 1; max-width: 400px; }
    .notes-section h4 { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 8px; }
    .notes-section p { font-size: 11px; color: #666; }
    .bank-details { margin-top: 30px; padding: 20px; background: #f8f8f8; border-radius: 4px; }
    .bank-details h4 { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 12px; }
    .bank-details p { font-size: 11px; margin-bottom: 4px; }
    @media print { body { padding: 20px; } .invoice-container { max-width: 100%; } }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="invoice-header">
      <div class="company-info">
        ${logoBase64 ? `<img src="${logoBase64}" style="max-height: 60px; max-width: 200px; margin-bottom: 12px; display: block;" alt="Business Logo" />` : ''}
        <h1>${invoice.seller.businessName}</h1>
        ${invoice.seller.businessAddress ? `<p>${invoice.seller.businessAddress}</p>` : ''}
        ${invoice.seller.phone ? `<p>Phone: ${invoice.seller.phone}</p>` : ''}
        <p>Email: ${invoice.seller.email}</p>
        ${invoice.seller.taxId ? `<p>${getCurrencyTaxIdLabel(invoice.currency)}: ${invoice.seller.taxId}</p>` : ''}
      </div>
      <div class="invoice-title">
        <h2>Invoice</h2>
        <p class="invoice-number">${invoice.invoiceNumber}</p>
        <div style="margin-top: 12px;">
          <img src="${qrCodeDataUrl}" style="width: 80px; height: 80px;" alt="QR Code" />
          <p style="font-size: 8px; color: #999; margin-top: 4px;">Scan to verify</p>
        </div>
      </div>
    </div>
    
    <div class="details-section">
      <div class="details-block">
        <h3>Billed To</h3>
        ${invoice.buyer ? `
          <p class="name">${invoice.buyer.name}</p>
          ${invoice.buyer.address ? `<p>${invoice.buyer.address}</p>` : ''}
          ${invoice.buyer.email ? `<p>${invoice.buyer.email}</p>` : ''}
          ${invoice.buyer.phone ? `<p>${invoice.buyer.phone}</p>` : ''}
        ` : '<p class="name">Walk-in Customer</p>'}
      </div>
      <div class="details-block invoice-meta">
        <div class="meta-row">
          <span class="meta-label">Invoice Date</span>
          <span class="meta-value">${formatDate(invoice.issueDate)}</span>
        </div>
        ${invoice.dueDate ? `
          <div class="meta-row">
            <span class="meta-label">Due Date</span>
            <span class="meta-value">${formatDate(invoice.dueDate)}</span>
          </div>
        ` : ''}
      </div>
    </div>
    
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 50%">Description</th>
          <th>Qty</th>
          <th>Unit</th>
          <th>Rate</th>
          <th>${getCurrencyTaxName(invoice.currency)}</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(item => `
          <tr>
            <td class="item-description">${item.description}</td>
            <td>${item.quantity}</td>
            <td>${item.unit}</td>
            <td>${formatCurrency(Number(item.unitPrice), invoice.currency)}</td>
            <td>${item.taxRate}%</td>
            <td>${formatCurrency(Number(item.amount), invoice.currency)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <div class="totals-section">
      <div class="totals-table">
        <div class="totals-row">
          <span class="totals-label">Subtotal</span>
          <span class="totals-value">${formatCurrency(Number(invoice.subtotal), invoice.currency)}</span>
        </div>
        ${Number(invoice.taxAmount) > 0 ? `
          ${(invoice.cgstAmount || 0) > 0 || (invoice.sgstAmount || 0) > 0 || (invoice.igstAmount || 0) > 0 ? `
              ${(invoice.cgstAmount || 0) > 0 ? `
              <div class="totals-row">
                <span class="totals-label">CGST</span>
                <span class="totals-value">${formatCurrency(Number(invoice.cgstAmount), invoice.currency)}</span>
              </div>` : ''}
              ${(invoice.sgstAmount || 0) > 0 ? `
              <div class="totals-row">
                <span class="totals-label">SGST</span>
                <span class="totals-value">${formatCurrency(Number(invoice.sgstAmount), invoice.currency)}</span>
              </div>` : ''}
              ${(invoice.igstAmount || 0) > 0 ? `
              <div class="totals-row">
                <span class="totals-label">IGST</span>
                <span class="totals-value">${formatCurrency(Number(invoice.igstAmount), invoice.currency)}</span>
              </div>` : ''}
          ` : `
          <div class="totals-row">
            <span class="totals-label">${getCurrencyTaxName(invoice.currency)}</span>
            <span class="totals-value">${formatCurrency(Number(invoice.taxAmount), invoice.currency)}</span>
          </div>
          `}
        ` : ''}
        ${Number(invoice.discountAmount) > 0 ? `
          <div class="totals-row">
            <span class="totals-label">Discount</span>
            <span class="totals-value">-${formatCurrency(Number(invoice.discountAmount), invoice.currency)}</span>
          </div>
        ` : ''}
        <div class="totals-row final">
          <span class="totals-label">Total Due</span>
          <span class="totals-value">${formatCurrency(Number(invoice.totalAmount), invoice.currency)}</span>
        </div>
      </div>
    </div>
    
    <div class="invoice-footer">
      <div class="notes-section">
        ${invoice.notes ? `
          <h4>Notes</h4>
          <p>${invoice.notes}</p>
        ` : ''}
        ${invoice.terms ? `
          <h4 style="margin-top: 16px;">Terms & Conditions</h4>
          <p>${invoice.terms}</p>
        ` : ''}
      </div>
    </div>
    

  </div>
</body>
</html>
    `;
  }
};
