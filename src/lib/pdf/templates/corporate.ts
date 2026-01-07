/**
 * Corporate Template - Traditional corporate with dark headers
 */

import type { InvoiceTemplateConfig } from './types';
import type { InvoiceWithRelations } from '@/types';
import { formatCurrency, formatDate, BANK_LABELS } from './helpers';

export const corporateTemplate: InvoiceTemplateConfig = {
  id: 'corporate',
  name: 'Corporate Professional',
  description: 'Traditional corporate style with bold headers',
  category: 'professional',
  colors: {
    primary: '#1e3a5f',
    secondary: '#4a5568',
    accent: '#edf2f7',
  },
  thumbnail: `<svg viewBox="0 0 200 260" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="260" fill="white"/>
    <rect width="200" height="50" fill="#1e3a5f"/>
    <rect x="16" y="16" width="80" height="8" rx="1" fill="white"/>
    <rect x="16" y="28" width="60" height="5" rx="1" fill="#ffffff80"/>
    <rect x="140" y="16" width="44" height="6" rx="1" fill="white"/>
    <rect x="140" y="26" width="44" height="14" rx="2" fill="#ffffff20"/>
    <rect x="16" y="66" width="80" height="6" rx="1" fill="#1e3a5f"/>
    <rect x="16" y="78" width="70" height="5" rx="1" fill="#a0aec0"/>
    <rect x="16" y="100" width="168" height="20" rx="2" fill="#1e3a5f"/>
    <rect x="24" y="106" width="40" height="4" rx="1" fill="white"/>
    <rect x="100" y="106" width="30" height="4" rx="1" fill="white"/>
    <rect x="150" y="106" width="26" height="4" rx="1" fill="white"/>
    <rect x="16" y="125" width="168" height="12" rx="1" fill="white" stroke="#e2e8f0"/>
    <rect x="16" y="140" width="168" height="12" rx="1" fill="#edf2f7"/>
    <rect x="16" y="155" width="168" height="12" rx="1" fill="white" stroke="#e2e8f0"/>
    <rect x="100" y="185" width="84" height="40" rx="2" fill="#1e3a5f"/>
    <rect x="108" y="193" width="68" height="6" rx="1" fill="white"/>
    <rect x="108" y="205" width="68" height="8" rx="1" fill="#ffffff80"/>
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
      font-family: 'Georgia', 'Times New Roman', serif;
      font-size: 11px;
      line-height: 1.5;
      color: #2d3748;
      background: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%);
      color: white;
      padding: 32px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header h1 { font-size: 22px; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 4px; }
    .header p { font-size: 10px; opacity: 0.85; }
    .invoice-badge { text-align: right; }
    .invoice-badge .label { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.8; }
    .invoice-badge .number { font-size: 18px; font-weight: 700; margin-top: 4px; }
    .container { padding: 40px; max-width: 800px; margin: 0 auto; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
    .info-box h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #1e3a5f; font-weight: 700; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #1e3a5f; }
    .info-box .name { font-size: 14px; font-weight: 600; color: #1a202c; margin-bottom: 4px; }
    .info-box p { font-size: 11px; color: #4a5568; margin-bottom: 2px; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .meta-item { background: #edf2f7; padding: 12px; border-radius: 4px; }
    .meta-item .label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #718096; }
    .meta-item .value { font-size: 12px; font-weight: 600; color: #1a202c; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
    thead { background: #1e3a5f; color: white; }
    th { padding: 14px 16px; text-align: left; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    th:last-child { text-align: right; }
    td { padding: 14px 16px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
    td:last-child { text-align: right; }
    tbody tr:nth-child(even) { background: #f7fafc; }
    .item-name { font-weight: 600; color: #1a202c; }
    .totals { display: flex; justify-content: flex-end; margin-bottom: 40px; }
    .totals-box { width: 280px; background: #1e3a5f; color: white; border-radius: 8px; padding: 20px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 11px; opacity: 0.9; }
    .total-row.final { padding-top: 16px; margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.3); font-size: 16px; font-weight: 700; opacity: 1; }
    .footer { display: flex; justify-content: space-between; align-items: flex-start; padding-top: 32px; border-top: 2px solid #1e3a5f; }
    .notes { max-width: 400px; }
    .notes h4 { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #1e3a5f; font-weight: 700; margin-bottom: 8px; }
    .notes p { font-size: 10px; color: #4a5568; }
    .qr-section { text-align: center; }
    .qr-section img { width: 72px; height: 72px; border: 2px solid #e2e8f0; border-radius: 4px; padding: 4px; }
    .qr-section p { font-size: 8px; color: #718096; margin-top: 4px; }
    .bank-section { margin-top: 32px; padding: 20px; background: #edf2f7; border-radius: 8px; border-left: 4px solid #1e3a5f; }
    .bank-section h4 { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #1e3a5f; font-weight: 700; margin-bottom: 12px; }
    .bank-section p { font-size: 10px; color: #4a5568; margin-bottom: 4px; }
    @media print { .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      ${logoBase64 ? `<img src="${logoBase64}" style="max-height: 50px; max-width: 180px; margin-bottom: 8px; display: block; filter: brightness(0) invert(1);" alt="Logo" />` : ''}
      <h1>${invoice.seller.businessName}</h1>
      ${invoice.seller.businessAddress ? `<p>${invoice.seller.businessAddress}</p>` : ''}
      <p>${invoice.seller.email}${invoice.seller.phone ? ` • ${invoice.seller.phone}` : ''}</p>
    </div>
    <div class="invoice-badge">
      <p class="label">Tax Invoice</p>
      <p class="number">${invoice.invoiceNumber}</p>
      ${invoice.seller.taxId ? `<p style="margin-top: 8px; font-size: 9px;">GSTIN: ${invoice.seller.taxId}</p>` : ''}
    </div>
  </div>

  <div class="container">
    <div class="info-grid">
      <div class="info-box">
        <h3>Bill To</h3>
        ${invoice.buyer ? `
          <p class="name">${invoice.buyer.name}</p>
          ${invoice.buyer.address ? `<p>${invoice.buyer.address}</p>` : ''}
          ${invoice.buyer.email ? `<p>${invoice.buyer.email}</p>` : ''}
          ${invoice.buyer.phone ? `<p>${invoice.buyer.phone}</p>` : ''}
        ` : '<p class="name">Walk-in Customer</p>'}
      </div>
      <div class="info-box">
        <h3>Invoice Details</h3>
        <div class="meta-grid">
          <div class="meta-item">
            <p class="label">Issue Date</p>
            <p class="value">${formatDate(invoice.issueDate)}</p>
          </div>
          ${invoice.dueDate ? `
            <div class="meta-item">
              <p class="label">Due Date</p>
              <p class="value">${formatDate(invoice.dueDate)}</p>
            </div>
          ` : ''}
        </div>
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
      <div class="qr-section">
        <img src="${qrCodeDataUrl}" alt="QR" />
        <p>Scan to verify authenticity</p>
      </div>
    </div>


  </div>
</body>
</html>
    `;
  }
};
