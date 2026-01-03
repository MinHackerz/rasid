/**
 * Consultant Template - Time-tracking focused, detailed
 */

import type { InvoiceTemplateConfig } from './types';
import type { InvoiceWithRelations } from '@/types';
import { formatCurrency, formatDate, BANK_LABELS } from './helpers';

export const consultantTemplate: InvoiceTemplateConfig = {
  id: 'consultant',
  name: 'Consultant Pro',
  description: 'Detailed layout perfect for consultants and freelancers',
  category: 'specialized',
  colors: {
    primary: '#0f766e',
    secondary: '#14b8a6',
    accent: '#f0fdfa',
  },
  thumbnail: `<svg viewBox="0 0 200 260" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="260" fill="white"/>
    <rect x="16" y="16" width="80" height="10" rx="2" fill="#0f766e"/>
    <rect x="16" y="30" width="60" height="5" rx="1" fill="#14b8a6"/>
    <rect x="140" y="16" width="44" height="20" rx="2" fill="#f0fdfa" stroke="#0f766e"/>
    <rect x="16" y="55" width="80" height="35" rx="4" fill="#f0fdfa"/>
    <rect x="24" y="63" width="30" height="4" rx="1" fill="#0f766e"/>
    <rect x="24" y="72" width="50" height="4" rx="1" fill="#5eead4"/>
    <rect x="24" y="80" width="40" height="4" rx="1" fill="#5eead4"/>
    <rect x="104" y="55" width="80" height="35" rx="4" fill="#f0fdfa"/>
    <rect x="112" y="63" width="30" height="4" rx="1" fill="#0f766e"/>
    <rect x="112" y="72" width="50" height="4" rx="1" fill="#5eead4"/>
    <rect x="16" y="105" width="168" height="14" rx="2" fill="#0f766e"/>
    <rect x="16" y="124" width="168" height="12" rx="1" fill="#f0fdfa"/>
    <rect x="16" y="140" width="168" height="12" rx="1" fill="white" stroke="#e5e7eb"/>
    <rect x="16" y="156" width="168" height="12" rx="1" fill="#f0fdfa"/>
    <rect x="16" y="172" width="168" height="12" rx="1" fill="white" stroke="#e5e7eb"/>
    <rect x="104" y="200" width="80" height="35" rx="4" fill="#0f766e"/>
    <rect x="112" y="210" width="64" height="6" rx="1" fill="white"/>
    <rect x="112" y="222" width="64" height="6" rx="1" fill="#5eead4"/>
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
      font-family: 'IBM Plex Sans', -apple-system, sans-serif;
      font-size: 11px;
      line-height: 1.5;
      color: #1f2937;
      background: #ffffff;
      padding: 40px;
    }
    .container { max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 2px solid #0f766e; }
    .brand h1 { font-size: 20px; font-weight: 700; color: #0f766e; margin-bottom: 4px; }
    .brand p { font-size: 10px; color: #14b8a6; }
    .invoice-ref { text-align: right; background: #f0fdfa; padding: 12px 16px; border-radius: 8px; border: 1px solid #0f766e; }
    .invoice-ref .label { font-size: 8px; text-transform: uppercase; letter-spacing: 1.5px; color: #0f766e; font-weight: 600; }
    .invoice-ref .number { font-size: 14px; font-weight: 700; color: #0f766e; margin-top: 2px; }
    .info-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .info-card { background: #f0fdfa; padding: 16px; border-radius: 8px; }
    .info-card h4 { font-size: 8px; text-transform: uppercase; letter-spacing: 1.5px; color: #0f766e; font-weight: 700; margin-bottom: 8px; }
    .info-card .name { font-size: 13px; font-weight: 600; color: #1f2937; margin-bottom: 4px; }
    .info-card p { font-size: 10px; color: #6b7280; margin-bottom: 2px; }
    .info-card .value { font-size: 13px; font-weight: 600; color: #0f766e; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead { background: #0f766e; color: white; }
    th { padding: 12px 14px; text-align: left; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    th:last-child { text-align: right; }
    td { padding: 12px 14px; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
    td:last-child { text-align: right; font-weight: 500; }
    tbody tr { background: #f0fdfa; }
    tbody tr:nth-child(even) { background: white; }
    .item-name { font-weight: 600; color: #0f766e; }
    .item-details { font-size: 9px; color: #6b7280; margin-top: 2px; }
    .summary { display: grid; grid-template-columns: 1fr 280px; gap: 32px; margin-bottom: 24px; }
    .project-summary { background: #f0fdfa; padding: 16px; border-radius: 8px; }
    .project-summary h4 { font-size: 8px; text-transform: uppercase; letter-spacing: 1.5px; color: #0f766e; font-weight: 700; margin-bottom: 12px; }
    .summary-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 10px; border-bottom: 1px solid #ccfbf1; }
    .summary-row:last-child { border-bottom: none; }
    .totals-box { background: #0f766e; border-radius: 8px; padding: 20px; color: white; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 11px; opacity: 0.9; }
    .total-row.final { padding-top: 12px; margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.3); font-size: 16px; font-weight: 700; opacity: 1; }
    .footer { display: flex; justify-content: space-between; align-items: flex-start; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .notes { max-width: 380px; }
    .notes h4 { font-size: 8px; text-transform: uppercase; letter-spacing: 1.5px; color: #0f766e; font-weight: 700; margin-bottom: 6px; }
    .notes p { font-size: 10px; color: #6b7280; }
    .qr { text-align: center; }
    .qr img { width: 60px; height: 60px; }
    .qr p { font-size: 7px; color: #14b8a6; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }
    .bank { margin-top: 20px; padding: 16px; background: #f0fdfa; border-radius: 8px; border-left: 3px solid #0f766e; }
    .bank h4 { font-size: 8px; text-transform: uppercase; letter-spacing: 1.5px; color: #0f766e; font-weight: 700; margin-bottom: 8px; }
    .bank p { font-size: 10px; color: #6b7280; margin-bottom: 2px; }
    @media print { thead, .totals-box { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">
        ${logoBase64 ? `<img src="${logoBase64}" style="max-height: 44px; max-width: 160px; margin-bottom: 8px; display: block;" alt="Logo" />` : ''}
        <h1>${invoice.seller.businessName}</h1>
        <p>${invoice.seller.email}${invoice.seller.phone ? ` • ${invoice.seller.phone}` : ''}</p>
      </div>
      <div class="invoice-ref">
        <p class="label">Invoice No.</p>
        <p class="number">${invoice.invoiceNumber}</p>
      </div>
    </div>

    <div class="info-cards">
      <div class="info-card">
        <h4>Bill To</h4>
        ${invoice.buyer ? `
          <p class="name">${invoice.buyer.name}</p>
          ${invoice.buyer.email ? `<p>${invoice.buyer.email}</p>` : ''}
          ${invoice.buyer.phone ? `<p>${invoice.buyer.phone}</p>` : ''}
        ` : '<p class="name">Walk-in Customer</p>'}
      </div>
      <div class="info-card">
        <h4>Issue Date</h4>
        <p class="value">${formatDate(invoice.issueDate)}</p>
        ${invoice.seller.taxId ? `<p style="margin-top: 8px; font-size: 9px;">GSTIN: ${invoice.seller.taxId}</p>` : ''}
      </div>
      <div class="info-card">
        <h4>Payment Due</h4>
        <p class="value">${invoice.dueDate ? formatDate(invoice.dueDate) : 'Upon Receipt'}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 40%">Service / Item Description</th>
          <th>Qty / Hours</th>
          <th>Unit</th>
          <th>Rate</th>
          <th>Tax</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(item => `
          <tr>
            <td>
              <div class="item-name">${item.description}</div>
            </td>
            <td>${item.quantity}</td>
            <td>${item.unit}</td>
            <td>${formatCurrency(Number(item.unitPrice), invoice.currency)}</td>
            <td>${item.taxRate}%</td>
            <td>${formatCurrency(Number(item.amount), invoice.currency)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="summary">
      <div class="project-summary">
        <h4>Invoice Summary</h4>
        <div class="summary-row">
          <span>Total Items</span>
          <span>${items.length}</span>
        </div>
        <div class="summary-row">
          <span>Currency</span>
          <span>${invoice.currency}</span>
        </div>
        <div class="summary-row">
          <span>Status</span>
          <span style="color: #0f766e; font-weight: 600;">${invoice.paymentStatus || 'Pending'}</span>
        </div>
      </div>

      <div class="totals-box">
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
          <span>Amount Due</span>
          <span>${formatCurrency(Number(invoice.totalAmount), invoice.currency)}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <div class="notes">
        ${invoice.notes ? `<h4>Notes</h4><p>${invoice.notes}</p>` : ''}
        ${invoice.terms ? `<h4 style="margin-top: 12px;">Terms & Conditions</h4><p>${invoice.terms}</p>` : ''}
      </div>
      <div class="qr">
        <img src="${qrCodeDataUrl}" alt="QR" />
        <p>Verify</p>
      </div>
    </div>

    ${(() => {
        if (!invoice.seller.bankDetails) return '';
        const entries = Object.entries(invoice.seller.bankDetails).filter(([_, v]) => v && v.trim() !== '');
        if (entries.length === 0) return '';
        return `
        <div class="bank">
          <h4>Payment Details</h4>
          ${entries.map(([key, value]) => `<p><strong>${BANK_LABELS[key] || key}:</strong> ${value}</p>`).join('')}
        </div>
      `;
      })()}
  </div>
</body>
</html>
    `;
  }
};
