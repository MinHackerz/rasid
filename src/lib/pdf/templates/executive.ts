/**
 * Executive Template - Bold typography, premium feel
 */

import type { InvoiceTemplateConfig } from './types';
import type { InvoiceWithRelations } from '@/types';
import { formatCurrency, formatDate, BANK_LABELS } from './helpers';

export const executiveTemplate: InvoiceTemplateConfig = {
  id: 'executive',
  name: 'Bold Executive',
  description: 'Striking design with bold typography for executives',
  category: 'professional',
  colors: {
    primary: '#000000',
    secondary: '#525252',
    accent: '#fbbf24',
  },
  thumbnail: `<svg viewBox="0 0 200 260" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="260" fill="white"/>
    <rect x="16" y="16" width="100" height="14" rx="2" fill="#000000"/>
    <rect x="16" y="36" width="60" height="6" rx="1" fill="#525252"/>
    <rect x="140" y="16" width="44" height="36" rx="2" fill="#fbbf24"/>
    <text x="162" y="40" font-family="Arial" font-size="10" font-weight="bold" fill="#000" text-anchor="middle">INV</text>
    <rect x="16" y="70" width="168" height="3" fill="#000000"/>
    <rect x="16" y="90" width="50" height="8" rx="1" fill="#000000"/>
    <rect x="16" y="102" width="70" height="5" rx="1" fill="#a3a3a3"/>
    <rect x="16" y="130" width="168" height="16" rx="2" fill="#000000"/>
    <rect x="16" y="150" width="168" height="12" rx="1" fill="#f5f5f5"/>
    <rect x="16" y="166" width="168" height="12" rx="1" fill="white"/>
    <rect x="16" y="182" width="168" height="12" rx="1" fill="#f5f5f5"/>
    <rect x="104" y="210" width="80" height="30" rx="2" fill="#fbbf24"/>
    <rect x="112" y="220" width="64" height="10" rx="1" fill="#000000"/>
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
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 11px;
      line-height: 1.5;
      color: #171717;
      background: #ffffff;
      padding: 40px;
    }
    .container { max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
    .brand h1 { font-size: 32px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; margin-bottom: 4px; }
    .brand p { font-size: 11px; color: #525252; }
    .invoice-number { background: #fbbf24; padding: 16px 24px; text-align: center; }
    .invoice-number .label { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; }
    .invoice-number .number { font-size: 18px; font-weight: 900; margin-top: 4px; }
    .divider { height: 4px; background: #000; margin-bottom: 32px; }
    .info-section { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 32px; margin-bottom: 32px; }
    .info-box h3 { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; margin-bottom: 12px; }
    .info-box .value { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
    .info-box p { font-size: 11px; color: #525252; margin-bottom: 2px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead { background: #000; color: white; }
    th { padding: 14px 16px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    th:last-child { text-align: right; }
    td { padding: 14px 16px; border-bottom: 1px solid #e5e5e5; font-size: 11px; }
    td:last-child { text-align: right; font-weight: 600; }
    tbody tr:nth-child(even) { background: #fafafa; }
    .item-name { font-weight: 700; }
    .totals { display: flex; justify-content: flex-end; margin-bottom: 40px; }
    .totals-box { width: 280px; }
    .total-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 12px; border-bottom: 1px solid #e5e5e5; }
    .total-row.final { background: #fbbf24; margin: 0 -16px; padding: 16px; border: none; font-size: 16px; font-weight: 900; }
    .footer { display: flex; justify-content: space-between; align-items: flex-start; padding-top: 32px; border-top: 4px solid #000; }
    .notes { max-width: 400px; }
    .notes h4 { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; margin-bottom: 8px; }
    .notes p { font-size: 10px; color: #525252; }
    .qr { text-align: center; }
    .qr img { width: 72px; height: 72px; }
    .qr p { font-size: 8px; color: #737373; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }
    .bank { margin-top: 24px; padding: 20px; background: #f5f5f5; border-left: 4px solid #fbbf24; }
    .bank h4 { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; margin-bottom: 12px; }
    .bank p { font-size: 10px; color: #525252; margin-bottom: 4px; }
    @media print { thead { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">
        ${logoBase64 ? `<img src="${logoBase64}" style="max-height: 60px; max-width: 200px; margin-bottom: 12px; display: block;" alt="Logo" />` : ''}
        <h1>${invoice.seller.businessName}</h1>
        <p>${invoice.seller.email}${invoice.seller.phone ? ` • ${invoice.seller.phone}` : ''}</p>
        ${invoice.seller.taxId ? `<p>GSTIN: ${invoice.seller.taxId}</p>` : ''}
      </div>
      <div class="invoice-number">
        <p class="label">Invoice</p>
        <p class="number">${invoice.invoiceNumber}</p>
      </div>
    </div>

    <div class="divider"></div>

    <div class="info-section">
      <div class="info-box">
        <h3>Bill To</h3>
        ${invoice.buyer ? `
          <p class="value">${invoice.buyer.name}</p>
          ${invoice.buyer.address ? `<p>${invoice.buyer.address}</p>` : ''}
          ${invoice.buyer.email ? `<p>${invoice.buyer.email}</p>` : ''}
          ${invoice.buyer.phone ? `<p>${invoice.buyer.phone}</p>` : ''}
        ` : '<p class="value">Walk-in Customer</p>'}
      </div>
      <div class="info-box">
        <h3>Issue Date</h3>
        <p class="value">${formatDate(invoice.issueDate)}</p>
      </div>
      ${invoice.dueDate ? `
        <div class="info-box">
          <h3>Due Date</h3>
          <p class="value">${formatDate(invoice.dueDate)}</p>
        </div>
      ` : '<div></div>'}
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 40%">Item Description</th>
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
            <span>Tax</span>
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
          <span>TOTAL DUE</span>
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
        <p>Verify Invoice</p>
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
