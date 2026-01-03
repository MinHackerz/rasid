/**
 * Retail Template - Receipt-style, product-focused
 */

import type { InvoiceTemplateConfig } from './types';
import type { InvoiceWithRelations } from '@/types';
import { formatCurrency, formatDate, BANK_LABELS } from './helpers';

export const retailTemplate: InvoiceTemplateConfig = {
  id: 'retail',
  name: 'Retail Commerce',
  description: 'Clean receipt-style design for retail businesses',
  category: 'specialized',
  colors: {
    primary: '#dc2626',
    secondary: '#4b5563',
    accent: '#fef2f2',
  },
  thumbnail: `<svg viewBox="0 0 200 260" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="260" fill="white"/>
    <rect x="40" y="12" width="120" height="236" fill="#fafafa" stroke="#e5e5e5" stroke-dasharray="4 2"/>
    <rect x="50" y="24" width="100" height="12" rx="2" fill="#dc2626"/>
    <rect x="60" y="42" width="80" height="6" rx="1" fill="#4b5563"/>
    <rect x="70" y="52" width="60" height="4" rx="1" fill="#9ca3af"/>
    <rect x="50" y="70" width="100" height="1" stroke="#e5e5e5" stroke-dasharray="2 2"/>
    <rect x="50" y="82" width="60" height="5" rx="1" fill="#4b5563"/>
    <rect x="120" y="82" width="30" height="5" rx="1" fill="#4b5563"/>
    <rect x="50" y="92" width="50" height="4" rx="1" fill="#d1d5db"/>
    <rect x="120" y="92" width="30" height="4" rx="1" fill="#d1d5db"/>
    <rect x="50" y="104" width="55" height="4" rx="1" fill="#d1d5db"/>
    <rect x="120" y="104" width="30" height="4" rx="1" fill="#d1d5db"/>
    <rect x="50" y="116" width="100" height="1" stroke="#e5e5e5" stroke-dasharray="2 2"/>
    <rect x="50" y="128" width="40" height="4" rx="1" fill="#9ca3af"/>
    <rect x="110" y="128" width="40" height="4" rx="1" fill="#4b5563"/>
    <rect x="50" y="140" width="100" height="1" fill="#dc2626"/>
    <rect x="50" y="150" width="50" height="6" rx="1" fill="#dc2626"/>
    <rect x="110" y="150" width="40" height="6" rx="1" fill="#dc2626"/>
    <rect x="70" y="180" width="60" height="60" rx="4" fill="#fef2f2" stroke="#fca5a5"/>
    <rect x="85" y="195" width="30" height="30" fill="#d1d5db"/>
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
      font-family: 'Courier New', monospace;
      font-size: 11px;
      line-height: 1.4;
      color: #1f2937;
      background: #f3f4f6;
      padding: 40px;
    }
    .receipt {
      max-width: 420px;
      margin: 0 auto;
      background: white;
      padding: 32px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.1);
      border: 1px dashed #e5e5e5;
    }
    .header { text-align: center; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 2px dashed #e5e5e5; }
    .logo-area { margin-bottom: 12px; }
    .header h1 { font-size: 18px; font-weight: 700; color: #dc2626; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 2px; }
    .header p { font-size: 10px; color: #6b7280; }
    .header .invoice-no { font-size: 14px; font-weight: 700; color: #1f2937; margin-top: 12px; padding: 8px; background: #fef2f2; border-radius: 4px; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 9px; text-transform: uppercase; letter-spacing: 2px; color: #dc2626; font-weight: 700; margin-bottom: 8px; }
    .info-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 11px; }
    .info-row .label { color: #6b7280; }
    .info-row .value { font-weight: 600; }
    .divider { border: none; border-top: 1px dashed #e5e5e5; margin: 16px 0; }
    .items-list { margin-bottom: 20px; }
    .item { padding: 8px 0; border-bottom: 1px dotted #e5e5e5; }
    .item:last-child { border-bottom: none; }
    .item-main { display: flex; justify-content: space-between; font-size: 11px; }
    .item-name { font-weight: 600; flex: 1; }
    .item-amount { font-weight: 700; }
    .item-details { font-size: 9px; color: #6b7280; margin-top: 2px; }
    .totals { background: #fef2f2; padding: 16px; border-radius: 8px; margin-bottom: 20px; }
    .total-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 11px; }
    .total-row.final { padding-top: 12px; margin-top: 8px; border-top: 2px solid #dc2626; font-size: 16px; font-weight: 700; color: #dc2626; }
    .qr-section { text-align: center; padding: 20px; background: #fef2f2; border-radius: 8px; border: 2px dashed #fca5a5; }
    .qr-section img { width: 80px; height: 80px; }
    .qr-section p { font-size: 9px; color: #dc2626; margin-top: 8px; text-transform: uppercase; letter-spacing: 1px; }
    .footer { text-align: center; margin-top: 24px; padding-top: 20px; border-top: 2px dashed #e5e5e5; }
    .footer p { font-size: 10px; color: #6b7280; margin-bottom: 4px; }
    .footer .thank-you { font-size: 14px; font-weight: 700; color: #dc2626; margin-top: 12px; }
    .bank { margin-top: 20px; padding: 12px; background: #f9fafb; border-radius: 4px; font-size: 10px; }
    .bank .section-title { margin-bottom: 8px; }
    .bank p { color: #6b7280; margin-bottom: 2px; }
    @media print { body { background: white; padding: 0; } .receipt { box-shadow: none; border: none; } }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <div class="logo-area">
        ${logoBase64 ? `<img src="${logoBase64}" style="max-height: 50px; max-width: 150px; margin: 0 auto 8px; display: block;" alt="Logo" />` : ''}
      </div>
      <h1>${invoice.seller.businessName}</h1>
      ${invoice.seller.businessAddress ? `<p>${invoice.seller.businessAddress}</p>` : ''}
      <p>${invoice.seller.email}${invoice.seller.phone ? ` | ${invoice.seller.phone}` : ''}</p>
      ${invoice.seller.taxId ? `<p>GSTIN: ${invoice.seller.taxId}</p>` : ''}
      <div class="invoice-no">${invoice.invoiceNumber}</div>
    </div>

    <div class="section">
      <div class="section-title">Customer</div>
      ${invoice.buyer ? `
        <div class="info-row">
          <span class="label">Name:</span>
          <span class="value">${invoice.buyer.name}</span>
        </div>
        ${invoice.buyer.phone ? `
          <div class="info-row">
            <span class="label">Phone:</span>
            <span class="value">${invoice.buyer.phone}</span>
          </div>
        ` : ''}
      ` : '<p style="color: #6b7280;">Walk-in Customer</p>'}
    </div>

    <hr class="divider" />

    <div class="section">
      <div class="info-row">
        <span class="label">Date:</span>
        <span class="value">${formatDate(invoice.issueDate)}</span>
      </div>
      ${invoice.dueDate ? `
        <div class="info-row">
          <span class="label">Due:</span>
          <span class="value">${formatDate(invoice.dueDate)}</span>
        </div>
      ` : ''}
    </div>

    <hr class="divider" />

    <div class="items-list">
      <div class="section-title">Items</div>
      ${items.map(item => `
        <div class="item">
          <div class="item-main">
            <span class="item-name">${item.description}</span>
            <span class="item-amount">${formatCurrency(Number(item.amount), invoice.currency)}</span>
          </div>
          <div class="item-details">
            ${item.quantity} ${item.unit} × ${formatCurrency(Number(item.unitPrice), invoice.currency)} ${Number(item.taxRate) > 0 ? `+ ${item.taxRate}% tax` : ''}
          </div>
        </div>
      `).join('')}
    </div>

    <div class="totals">
      <div class="total-row">
        <span>Subtotal</span>
        <span>${formatCurrency(Number(invoice.subtotal), invoice.currency)}</span>
      </div>
      ${Number(invoice.taxAmount) > 0 ? `
        <div class="total-row">
          <span>Tax</span>
          <span>${formatCurrency(Number(invoice.taxAmount), invoice.currency)}</span>
        </div>
      ` : ''}
      ${Number(invoice.discountAmount) > 0 ? `
        <div class="total-row">
          <span>Discount</span>
          <span>-${formatCurrency(Number(invoice.discountAmount), invoice.currency)}</span>
        </div>
      ` : ''}
      <div class="total-row final">
        <span>TOTAL</span>
        <span>${formatCurrency(Number(invoice.totalAmount), invoice.currency)}</span>
      </div>
    </div>

    <div class="qr-section">
      <img src="${qrCodeDataUrl}" alt="QR Code" />
      <p>Scan to verify invoice</p>
    </div>

    ${(() => {
        if (!invoice.seller.bankDetails) return '';
        const entries = Object.entries(invoice.seller.bankDetails).filter(([_, v]) => v && v.trim() !== '');
        if (entries.length === 0) return '';
        return `
        <div class="bank">
          <div class="section-title">Payment Details</div>
          ${entries.map(([key, value]) => `<p><strong>${BANK_LABELS[key] || key}:</strong> ${value}</p>`).join('')}
        </div>
      `;
      })()}

    <div class="footer">
      ${invoice.notes ? `<p>${invoice.notes}</p>` : ''}
      ${invoice.terms ? `<p style="font-size: 9px;">${invoice.terms}</p>` : ''}
      <p class="thank-you">Thank You!</p>
    </div>
  </div>
</body>
</html>
    `;
  }
};
