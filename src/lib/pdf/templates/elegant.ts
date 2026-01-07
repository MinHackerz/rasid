/**
 * Elegant Template - Serif fonts, refined borders
 */

import type { InvoiceTemplateConfig } from './types';
import type { InvoiceWithRelations } from '@/types';
import { formatCurrency, formatDate, BANK_LABELS } from './helpers';

export const elegantTemplate: InvoiceTemplateConfig = {
  id: 'elegant',
  name: 'Elegant Serif',
  description: 'Refined design with serif typography and subtle borders',
  category: 'professional',
  colors: {
    primary: '#1f2937',
    secondary: '#6b7280',
    accent: '#d4af37',
  },
  thumbnail: `<svg viewBox="0 0 200 260" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="260" fill="#fefefe"/>
    <rect x="16" y="16" width="168" height="1" fill="#d4af37"/>
    <rect x="16" y="24" width="80" height="10" rx="1" fill="#1f2937"/>
    <rect x="16" y="38" width="60" height="5" rx="1" fill="#9ca3af"/>
    <rect x="140" y="24" width="44" height="20" fill="none" stroke="#d4af37" stroke-width="1"/>
    <rect x="16" y="60" width="168" height="1" fill="#e5e7eb"/>
    <rect x="16" y="80" width="40" height="5" rx="1" fill="#d4af37"/>
    <rect x="16" y="90" width="70" height="5" rx="1" fill="#9ca3af"/>
    <rect x="16" y="120" width="168" height="1" fill="#e5e7eb"/>
    <rect x="16" y="130" width="168" height="10" rx="1" fill="#fafafa"/>
    <rect x="16" y="145" width="168" height="10" rx="1" fill="white"/>
    <rect x="16" y="160" width="168" height="10" rx="1" fill="#fafafa"/>
    <rect x="16" y="175" width="168" height="1" fill="#e5e7eb"/>
    <rect x="120" y="190" width="64" height="30" fill="none" stroke="#d4af37" stroke-width="1"/>
    <rect x="128" y="198" width="48" height="6" rx="1" fill="#1f2937"/>
    <rect x="128" y="208" width="48" height="6" rx="1" fill="#d4af37"/>
    <rect x="16" y="242" width="168" height="1" fill="#d4af37"/>
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
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Source+Sans+Pro:wght@400;600&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Source Sans Pro', Georgia, serif;
      font-size: 11px;
      line-height: 1.6;
      color: #1f2937;
      background: #fefefe;
      padding: 48px;
    }
    h1, h2, h3 { font-family: 'Playfair Display', Georgia, serif; }
    .container { max-width: 780px; margin: 0 auto; }
    .gold-line { height: 2px; background: linear-gradient(90deg, #d4af37 0%, #f4e4a6 50%, #d4af37 100%); margin-bottom: 24px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #e5e7eb; }
    .brand h1 { font-size: 28px; font-weight: 600; color: #1f2937; margin-bottom: 6px; letter-spacing: 1px; }
    .brand p { font-size: 10px; color: #6b7280; }
    .invoice-badge { border: 2px solid #d4af37; padding: 12px 20px; text-align: center; }
    .invoice-badge .label { font-size: 9px; text-transform: uppercase; letter-spacing: 3px; color: #d4af37; font-weight: 600; }
    .invoice-badge .number { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 600; margin-top: 4px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-bottom: 32px; }
    .info-box h3 { font-size: 11px; color: #d4af37; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; margin-bottom: 12px; }
    .info-box .name { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 600; margin-bottom: 6px; }
    .info-box p { font-size: 11px; color: #6b7280; margin-bottom: 2px; }
    .dates { display: flex; gap: 40px; margin-bottom: 32px; padding: 16px 0; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; }
    .date-box .label { font-size: 9px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; }
    .date-box .value { font-size: 13px; font-weight: 600; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
    thead { border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; }
    th { padding: 14px 12px; text-align: left; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; }
    th:last-child { text-align: right; }
    td { padding: 16px 12px; border-bottom: 1px solid #f3f4f6; font-size: 11px; }
    td:last-child { text-align: right; }
    tbody tr:nth-child(even) { background: #fafafa; }
    .item-name { font-weight: 600; color: #1f2937; }
    .totals { display: flex; justify-content: flex-end; margin-bottom: 40px; }
    .totals-box { width: 260px; border: 2px solid #d4af37; }
    .total-row { display: flex; justify-content: space-between; padding: 12px 16px; font-size: 11px; border-bottom: 1px solid #f3f4f6; }
    .total-row span:first-child { color: #6b7280; }
    .total-row span:last-child { font-weight: 600; }
    .total-row.final { background: linear-gradient(135deg, #d4af37 0%, #f4e4a6 100%); border-bottom: none; font-size: 14px; }
    .total-row.final span { color: #1f2937; font-weight: 700; }
    .footer { display: flex; justify-content: space-between; align-items: flex-start; padding-top: 24px; }
    .notes { max-width: 380px; }
    .notes h4 { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #d4af37; font-weight: 600; margin-bottom: 8px; }
    .notes p { font-size: 10px; color: #6b7280; font-style: italic; }
    .qr { text-align: center; }
    .qr img { width: 68px; height: 68px; border: 1px solid #e5e7eb; padding: 4px; }
    .qr p { font-size: 8px; color: #9ca3af; margin-top: 4px; font-style: italic; }
    .bank { margin-top: 32px; padding: 20px; border: 1px solid #e5e7eb; background: #fafafa; }
    .bank h4 { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #d4af37; font-weight: 600; margin-bottom: 12px; }
    .bank p { font-size: 10px; color: #6b7280; margin-bottom: 4px; }
    .gold-line-bottom { height: 2px; background: linear-gradient(90deg, #d4af37 0%, #f4e4a6 50%, #d4af37 100%); margin-top: 32px; }
    @media print { body { padding: 32px; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="gold-line"></div>
    
    <div class="header">
      <div class="brand">
        ${logoBase64 ? `<img src="${logoBase64}" style="max-height: 56px; max-width: 180px; margin-bottom: 12px; display: block;" alt="Logo" />` : ''}
        <h1>${invoice.seller.businessName}</h1>
        ${invoice.seller.businessAddress ? `<p>${invoice.seller.businessAddress}</p>` : ''}
        <p>${invoice.seller.email}${invoice.seller.phone ? ` • ${invoice.seller.phone}` : ''}</p>
        ${invoice.seller.taxId ? `<p>GSTIN: ${invoice.seller.taxId}</p>` : ''}
      </div>
      <div class="invoice-badge">
        <p class="label">Invoice</p>
        <p class="number">${invoice.invoiceNumber}</p>
      </div>
    </div>

    <div class="info-grid">
      <div class="info-box">
        <h3>Billed To</h3>
        ${invoice.buyer ? `
          <p class="name">${invoice.buyer.name}</p>
          ${invoice.buyer.address ? `<p>${invoice.buyer.address}</p>` : ''}
          ${invoice.buyer.email ? `<p>${invoice.buyer.email}</p>` : ''}
          ${invoice.buyer.phone ? `<p>${invoice.buyer.phone}</p>` : ''}
        ` : '<p class="name">Walk-in Customer</p>'}
      </div>
      <div class="dates">
        <div class="date-box">
          <p class="label">Date of Issue</p>
          <p class="value">${formatDate(invoice.issueDate)}</p>
        </div>
        ${invoice.dueDate ? `
          <div class="date-box">
            <p class="label">Payment Due</p>
            <p class="value">${formatDate(invoice.dueDate)}</p>
          </div>
        ` : ''}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 40%">Description</th>
          <th>Quantity</th>
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
          <span>Total Due</span>
          <span>${formatCurrency(Number(invoice.totalAmount), invoice.currency)}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <div class="notes">
        ${invoice.notes ? `<h4>Notes</h4><p>${invoice.notes}</p>` : ''}
        ${invoice.terms ? `<h4 style="margin-top: 16px;">Terms & Conditions</h4><p>${invoice.terms}</p>` : ''}
      </div>
      <div class="qr">
        <img src="${qrCodeDataUrl}" alt="QR" />
        <p>Scan to verify</p>
      </div>
    </div>

    ${(() => {
        if (!invoice.seller.bankDetails) return '';
        const entries = Object.entries(invoice.seller.bankDetails).filter(([_, v]) => v && v.trim() !== '');
        if (entries.length === 0) return '';
        return `
        <div class="bank">
          <h4>Payment Information</h4>
          ${entries.map(([key, value]) => `<p><strong>${BANK_LABELS[key] || key}:</strong> ${value}</p>`).join('')}
        </div>
      `;
      })()}

    <div class="gold-line-bottom"></div>
  </div>
</body>
</html>
    `;
  }
};
