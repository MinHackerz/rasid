/**
 * Startup Template - Tech-inspired, gradient accents
 */

import type { InvoiceTemplateConfig } from './types';
import type { InvoiceWithRelations } from '@/types';
import { formatCurrency, formatDate, BANK_LABELS } from './helpers';

export const startupTemplate: InvoiceTemplateConfig = {
  id: 'startup',
  name: 'Tech Startup',
  description: 'Modern tech-inspired design with gradient accents',
  category: 'modern',
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#f0fdf4',
  },
  thumbnail: `<svg viewBox="0 0 200 260" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="260" fill="white"/>
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#6366f1"/>
        <stop offset="100%" style="stop-color:#8b5cf6"/>
      </linearGradient>
    </defs>
    <rect x="16" y="16" width="8" height="24" rx="4" fill="url(#grad)"/>
    <rect x="32" y="16" width="80" height="10" rx="2" fill="#1f2937"/>
    <rect x="32" y="30" width="60" height="5" rx="1" fill="#9ca3af"/>
    <rect x="130" y="16" width="54" height="24" rx="12" fill="url(#grad)"/>
    <rect x="138" y="24" width="38" height="8" rx="2" fill="white" fill-opacity="0.9"/>
    <rect x="16" y="60" width="168" height="40" rx="8" fill="#f8fafc"/>
    <rect x="24" y="70" width="60" height="5" rx="1" fill="#6366f1"/>
    <rect x="24" y="80" width="80" height="4" rx="1" fill="#cbd5e1"/>
    <rect x="16" y="116" width="168" height="14" rx="4" fill="url(#grad)"/>
    <rect x="16" y="136" width="168" height="12" rx="2" fill="#f8fafc"/>
    <rect x="16" y="152" width="168" height="12" rx="2" fill="white"/>
    <rect x="16" y="168" width="168" height="12" rx="2" fill="#f8fafc"/>
    <rect x="100" y="195" width="84" height="36" rx="8" fill="url(#grad)"/>
    <rect x="108" y="203" width="68" height="6" rx="2" fill="white" fill-opacity="0.7"/>
    <rect x="108" y="215" width="68" height="8" rx="2" fill="white"/>
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
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 11px;
      line-height: 1.5;
      color: #1f2937;
      background: #ffffff;
      padding: 40px;
    }
    .container { max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 10px; }
    .brand-text h1 { font-size: 20px; font-weight: 700; color: #1f2937; }
    .brand-text p { font-size: 11px; color: #6b7280; }
    .invoice-pill { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 10px 20px; border-radius: 24px; }
    .invoice-pill .label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9; }
    .invoice-pill .number { font-size: 14px; font-weight: 700; }
    .info-card { background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px; display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 24px; }
    .info-section h3 { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #6366f1; font-weight: 600; margin-bottom: 8px; }
    .info-section .name { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
    .info-section p { font-size: 11px; color: #6b7280; margin-bottom: 2px; }
    .info-section .value { font-size: 13px; font-weight: 600; color: #1f2937; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; }
    th { padding: 12px 16px; text-align: left; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    th:first-child { border-radius: 8px 0 0 8px; }
    th:last-child { border-radius: 0 8px 8px 0; text-align: right; }
    td { padding: 14px 16px; font-size: 11px; }
    td:last-child { text-align: right; font-weight: 500; }
    tbody tr { background: #f8fafc; }
    tbody tr:nth-child(even) { background: white; }
    tbody tr:first-child td:first-child { border-radius: 8px 0 0 0; }
    tbody tr:first-child td:last-child { border-radius: 0 8px 0 0; }
    tbody tr:last-child td:first-child { border-radius: 0 0 0 8px; }
    tbody tr:last-child td:last-child { border-radius: 0 0 8px 0; }
    .item-name { font-weight: 600; color: #1f2937; }
    .totals { display: flex; justify-content: flex-end; margin-bottom: 32px; }
    .totals-card { width: 280px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 12px; padding: 20px; color: white; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 11px; opacity: 0.9; }
    .total-row.final { padding-top: 16px; margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.3); font-size: 16px; font-weight: 700; opacity: 1; }
    .footer { display: flex; justify-content: space-between; align-items: flex-start; }
    .notes { max-width: 400px; }
    .notes h4 { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #6366f1; font-weight: 600; margin-bottom: 8px; }
    .notes p { font-size: 10px; color: #6b7280; }
    .qr { text-align: center; background: #f8fafc; padding: 16px; border-radius: 12px; }
    .qr img { width: 64px; height: 64px; }
    .qr p { font-size: 8px; color: #6b7280; margin-top: 8px; }
    .bank { margin-top: 24px; padding: 20px; background: linear-gradient(135deg, #ede9fe 0%, #e0e7ff 100%); border-radius: 12px; }
    .bank h4 { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #6366f1; font-weight: 600; margin-bottom: 12px; }
    .bank p { font-size: 10px; color: #4c1d95; margin-bottom: 4px; }
    @media print { 
      thead, .totals-card, .invoice-pill { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">
        ${logoBase64 ? `<img src="${logoBase64}" style="max-height: 44px; max-width: 160px;" alt="Logo" />` : '<div class="brand-icon"></div>'}
        <div class="brand-text">
          <h1>${invoice.seller.businessName}</h1>
          <p>${invoice.seller.email}</p>
        </div>
      </div>
      <div class="invoice-pill">
        <p class="label">Invoice</p>
        <p class="number">${invoice.invoiceNumber}</p>
      </div>
    </div>

    <div class="info-card">
      <div class="info-section">
        <h3>Bill To</h3>
        ${invoice.buyer ? `
          <p class="name">${invoice.buyer.name}</p>
          ${invoice.buyer.address ? `<p>${invoice.buyer.address}</p>` : ''}
          ${invoice.buyer.email ? `<p>${invoice.buyer.email}</p>` : ''}
          ${invoice.buyer.phone ? `<p>${invoice.buyer.phone}</p>` : ''}
        ` : '<p class="name">Walk-in Customer</p>'}
      </div>
      <div class="info-section">
        <h3>Issue Date</h3>
        <p class="value">${formatDate(invoice.issueDate)}</p>
        ${invoice.seller.taxId ? `<p style="margin-top: 12px; font-size: 9px; color: #6b7280;">GSTIN: ${invoice.seller.taxId}</p>` : ''}
      </div>
      <div class="info-section">
        <h3>Due Date</h3>
        <p class="value">${invoice.dueDate ? formatDate(invoice.dueDate) : 'On Receipt'}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 40%">Description</th>
          <th>Qty</th>
          <th>Unit</th>
          <th>Rate</th>
          <th>Tax</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(item => `
          <tr>
            <td class="item-name">${item.description}</td>
            <td>${item.quantity}</td>
            <td>${item.unit}</td>
            <td>${formatCurrency(Number(item.unitPrice), invoice.currency)}</td>
            <td>${item.taxRate}%</td>
            <td>${formatCurrency(Number(item.amount), invoice.currency)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-card">
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
          <span>Total</span>
          <span>${formatCurrency(Number(invoice.totalAmount), invoice.currency)}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <div class="notes">
        ${invoice.notes ? `<h4>Notes</h4><p>${invoice.notes}</p>` : ''}
        ${invoice.terms ? `<h4 style="margin-top: 16px;">Terms</h4><p>${invoice.terms}</p>` : ''}
      </div>
      <div class="qr">
        <img src="${qrCodeDataUrl}" alt="QR" />
        <p>Scan to verify invoice</p>
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
