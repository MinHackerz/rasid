/**
 * Modern Minimal Template - Ultra-clean with lots of whitespace
 */

import type { InvoiceTemplateConfig } from './types';
import type { InvoiceWithRelations } from '@/types';
import { formatCurrency, formatDate, BANK_LABELS } from './helpers';
import { getCurrencyTaxName, getCurrencyTaxIdLabel } from '@/lib/currencies';

export const modernMinimalTemplate: InvoiceTemplateConfig = {
  id: 'modern-minimal',
  name: 'Modern Minimal',
  description: 'Ultra-clean design with generous whitespace',
  category: 'modern',
  colors: {
    primary: '#18181b',
    secondary: '#71717a',
    accent: '#fafafa',
  },
  thumbnail: `<svg viewBox="0 0 200 260" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="260" fill="white"/>
    <rect x="20" y="24" width="50" height="8" rx="1" fill="#18181b"/>
    <rect x="130" y="24" width="50" height="8" rx="1" fill="#18181b"/>
    <rect x="20" y="60" width="30" height="5" rx="1" fill="#71717a"/>
    <rect x="20" y="70" width="60" height="4" rx="1" fill="#e5e5e5"/>
    <rect x="20" y="78" width="50" height="4" rx="1" fill="#e5e5e5"/>
    <rect x="130" y="60" width="50" height="5" rx="1" fill="#71717a"/>
    <rect x="130" y="70" width="50" height="4" rx="1" fill="#e5e5e5"/>
    <rect x="20" y="110" width="160" height="1" fill="#e5e5e5"/>
    <rect x="20" y="125" width="160" height="8" rx="1" fill="#fafafa"/>
    <rect x="20" y="140" width="160" height="8" rx="1" fill="white"/>
    <rect x="20" y="155" width="160" height="8" rx="1" fill="#fafafa"/>
    <rect x="20" y="170" width="160" height="1" fill="#e5e5e5"/>
    <rect x="120" y="185" width="60" height="6" rx="1" fill="#18181b"/>
    <rect x="20" y="220" width="40" height="40" rx="4" fill="#fafafa"/>
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
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 11px;
      line-height: 1.6;
      color: #18181b;
      background: #ffffff;
      padding: 48px;
    }
    .container { max-width: 780px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 64px; }
    .brand h1 { font-size: 18px; font-weight: 600; letter-spacing: -0.5px; margin-bottom: 4px; }
    .brand p { font-size: 10px; color: #71717a; }
    .invoice-meta { text-align: right; }
    .invoice-meta .label { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #71717a; font-weight: 500; }
    .invoice-meta .value { font-size: 20px; font-weight: 600; letter-spacing: -0.5px; color: #18181b; margin-top: 4px; }
    .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; margin-bottom: 48px; }
    .party .label { font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; color: #a1a1aa; font-weight: 500; margin-bottom: 12px; }
    .party .name { font-size: 13px; font-weight: 600; color: #18181b; margin-bottom: 4px; }
    .party p { font-size: 11px; color: #71717a; margin-bottom: 2px; }
    .dates { display: flex; gap: 40px; margin-bottom: 48px; padding: 16px 0; border-top: 1px solid #f4f4f5; border-bottom: 1px solid #f4f4f5; }
    .date-item .label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #a1a1aa; font-weight: 500; }
    .date-item .value { font-size: 12px; font-weight: 500; color: #18181b; margin-top: 4px; }
    .items { margin-bottom: 40px; }
    .items-header { display: grid; grid-template-columns: 2fr 0.5fr 0.5fr 1fr 0.5fr 1fr; gap: 16px; padding: 12px 0; border-bottom: 1px solid #e4e4e7; }
    .items-header span { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #a1a1aa; font-weight: 500; }
    .items-header span:last-child { text-align: right; }
    .item-row { display: grid; grid-template-columns: 2fr 0.5fr 0.5fr 1fr 0.5fr 1fr; gap: 16px; padding: 16px 0; border-bottom: 1px solid #f4f4f5; }
    .item-row:last-child { border-bottom: none; }
    .item-row span { font-size: 11px; color: #3f3f46; }
    .item-row span:first-child { font-weight: 500; color: #18181b; }
    .item-row span:last-child { text-align: right; font-weight: 500; }
    .totals { display: flex; justify-content: flex-end; margin-bottom: 48px; }
    .totals-box { width: 260px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 11px; color: #71717a; }
    .total-row span:last-child { color: #18181b; font-weight: 500; }
    .total-row.final { padding-top: 16px; margin-top: 8px; border-top: 2px solid #18181b; font-size: 14px; font-weight: 600; }
    .total-row.final span { color: #18181b; }
    .footer { display: flex; justify-content: space-between; align-items: flex-end; padding-top: 32px; border-top: 1px solid #f4f4f5; }
    .notes { max-width: 360px; }
    .notes .label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #a1a1aa; font-weight: 500; margin-bottom: 8px; }
    .notes p { font-size: 10px; color: #71717a; }
    .qr { text-align: center; }
    .qr img { width: 64px; height: 64px; }
    .qr p { font-size: 8px; color: #a1a1aa; margin-top: 4px; }
    .bank { margin-top: 32px; padding: 20px; background: #fafafa; border-radius: 8px; }
    .bank .label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #a1a1aa; font-weight: 500; margin-bottom: 12px; }
    .bank p { font-size: 10px; color: #52525b; margin-bottom: 4px; }
    @media print { body { padding: 32px; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">
        ${logoBase64 ? `<img src="${logoBase64}" style="max-height: 48px; max-width: 160px; margin-bottom: 8px; display: block;" alt="Logo" />` : ''}
        <h1>${invoice.seller.businessName}</h1>
        ${invoice.seller.taxId ? `<p>${getCurrencyTaxIdLabel(invoice.currency)}: ${invoice.seller.taxId}</p>` : ''}
      </div>
      <div class="invoice-meta">
        <p class="label">Invoice</p>
        <p class="value">${invoice.invoiceNumber}</p>
      </div>
    </div>

    <div class="parties">
      <div class="party">
        <p class="label">From</p>
        <p class="name">${invoice.seller.businessName}</p>
        ${invoice.seller.businessAddress ? `<p>${invoice.seller.businessAddress}</p>` : ''}
        <p>${invoice.seller.email}</p>
        ${invoice.seller.phone ? `<p>${invoice.seller.phone}</p>` : ''}
      </div>
      <div class="party">
        <p class="label">Bill To</p>
        ${invoice.buyer ? `
          <p class="name">${invoice.buyer.name}</p>
          ${invoice.buyer.address ? `<p>${invoice.buyer.address}</p>` : ''}
          ${invoice.buyer.email ? `<p>${invoice.buyer.email}</p>` : ''}
          ${invoice.buyer.phone ? `<p>${invoice.buyer.phone}</p>` : ''}
        ` : '<p class="name">Walk-in Customer</p>'}
      </div>
    </div>

    <div class="dates">
      <div class="date-item">
        <p class="label">Issue Date</p>
        <p class="value">${formatDate(invoice.issueDate)}</p>
      </div>
      ${invoice.dueDate ? `
        <div class="date-item">
          <p class="label">Due Date</p>
          <p class="value">${formatDate(invoice.dueDate)}</p>
        </div>
      ` : ''}
    </div>

    <div class="items">
      <div class="items-header">
        <span>Description</span>
        <span>Qty</span>
        <span>Unit</span>
        <span>Rate</span>
        <span>${getCurrencyTaxName(invoice.currency)}</span>
        <span>Amount</span>
      </div>
      ${items.map(item => `
        <div class="item-row">
          <span>${item.description}</span>
          <span>${item.quantity}</span>
          <span>${item.unit}</span>
          <span>${formatCurrency(Number(item.unitPrice), invoice.currency)}</span>
          <span>${item.taxRate}%</span>
          <span>${formatCurrency(Number(item.amount), invoice.currency)}</span>
        </div>
      `).join('')}
    </div>

    <div class="totals">
      <div class="totals-box">
        <div class="total-row">
          <span>Subtotal</span>
          <span>${formatCurrency(Number(invoice.subtotal), invoice.currency)}</span>
        </div>
        ${Number(invoice.taxAmount) > 0 ? `
          ${(invoice.cgstAmount || 0) > 0 || (invoice.sgstAmount || 0) > 0 || (invoice.igstAmount || 0) > 0 ? `
            ${(invoice.cgstAmount || 0) > 0 ? `
            <div class="total-row">
              <span>CGST</span>
              <span>${formatCurrency(Number(invoice.cgstAmount), invoice.currency)}</span>
            </div>` : ''}
            ${(invoice.sgstAmount || 0) > 0 ? `
            <div class="total-row">
              <span>SGST</span>
              <span>${formatCurrency(Number(invoice.sgstAmount), invoice.currency)}</span>
            </div>` : ''}
            ${(invoice.igstAmount || 0) > 0 ? `
            <div class="total-row">
              <span>IGST</span>
              <span>${formatCurrency(Number(invoice.igstAmount), invoice.currency)}</span>
            </div>` : ''}
          ` : `
          <div class="total-row">
            <span>${getCurrencyTaxName(invoice.currency)}</span>
            <span>${formatCurrency(Number(invoice.taxAmount), invoice.currency)}</span>
          </div>
          `}
        ` : ''}
        ${Number(invoice.discountAmount) > 0 ? `
          <div class="total-row">
            <span>Discount</span>
            <span>-${formatCurrency(Number(invoice.discountAmount), invoice.currency)}</span>
          </div>
        ` : ''}
        <div class="total-row final">
          <span>Total</span>
          <span>${formatCurrency(Number(invoice.totalAmount), invoice.currency)}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <div class="notes">
        ${invoice.notes ? `
          <p class="label">Notes</p>
          <p>${invoice.notes}</p>
        ` : ''}
        ${invoice.terms ? `
          <p class="label" style="margin-top: 16px;">Terms</p>
          <p>${invoice.terms}</p>
        ` : ''}
      </div>
      <div class="qr">
        <img src="${qrCodeDataUrl}" alt="QR" />
        <p>Scan to verify</p>
      </div>
    </div>


  </div>
</body>
</html>
    `;
  }
};
