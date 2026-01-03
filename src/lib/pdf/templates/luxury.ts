/**
 * Luxury Template - Gold accents, high-end aesthetic
 */

import type { InvoiceTemplateConfig } from './types';
import type { InvoiceWithRelations } from '@/types';
import { formatCurrency, formatDate, BANK_LABELS } from './helpers';

export const luxuryTemplate: InvoiceTemplateConfig = {
  id: 'luxury',
  name: 'Luxury Premium',
  description: 'Sophisticated design with gold accents for premium brands',
  category: 'creative',
  colors: {
    primary: '#1c1917',
    secondary: '#b59f6f',
    accent: '#faf5ef',
  },
  thumbnail: `<svg viewBox="0 0 200 260" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="260" fill="#1c1917"/>
    <rect x="16" y="16" width="168" height="1" fill="#b59f6f"/>
    <rect x="16" y="24" width="80" height="12" rx="1" fill="#b59f6f"/>
    <rect x="16" y="40" width="60" height="5" rx="1" fill="#78716c"/>
    <rect x="140" y="24" width="44" height="20" fill="none" stroke="#b59f6f"/>
    <rect x="16" y="64" width="168" height="1" fill="#b59f6f"/>
    <rect x="16" y="80" width="40" height="5" rx="1" fill="#b59f6f"/>
    <rect x="16" y="90" width="70" height="5" rx="1" fill="#78716c"/>
    <rect x="16" y="120" width="168" height="14" rx="1" fill="#b59f6f"/>
    <rect x="16" y="140" width="168" height="12" rx="1" fill="#292524"/>
    <rect x="16" y="156" width="168" height="12" rx="1" fill="#1c1917"/>
    <rect x="16" y="172" width="168" height="12" rx="1" fill="#292524"/>
    <rect x="104" y="200" width="80" height="35" fill="#b59f6f"/>
    <rect x="112" y="208" width="64" height="6" rx="1" fill="#1c1917"/>
    <rect x="112" y="220" width="64" height="8" rx="1" fill="#1c1917"/>
    <rect x="16" y="242" width="168" height="1" fill="#b59f6f"/>
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
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Montserrat', sans-serif;
      font-size: 10px;
      line-height: 1.6;
      color: #faf5ef;
      background: #1c1917;
      padding: 48px;
    }
    h1, h2, h3 { font-family: 'Cormorant Garamond', serif; font-weight: 500; }
    .container { max-width: 780px; margin: 0 auto; }
    .gold-line { height: 1px; background: linear-gradient(90deg, transparent 0%, #b59f6f 50%, transparent 100%); margin-bottom: 32px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
    .brand h1 { font-size: 32px; color: #b59f6f; margin-bottom: 8px; letter-spacing: 4px; text-transform: uppercase; }
    .brand p { font-size: 9px; color: #78716c; letter-spacing: 2px; text-transform: uppercase; }
    .invoice-badge { border: 1px solid #b59f6f; padding: 16px 24px; text-align: center; }
    .invoice-badge .label { font-size: 8px; text-transform: uppercase; letter-spacing: 3px; color: #b59f6f; }
    .invoice-badge .number { font-family: 'Cormorant Garamond', serif; font-size: 18px; color: #faf5ef; margin-top: 4px; letter-spacing: 2px; }
    .gold-divider { height: 1px; background: linear-gradient(90deg, transparent 0%, #b59f6f 50%, transparent 100%); margin: 32px 0; }
    .info-section { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-bottom: 40px; }
    .info-box h3 { font-size: 10px; color: #b59f6f; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 12px; }
    .info-box .name { font-family: 'Cormorant Garamond', serif; font-size: 18px; color: #faf5ef; margin-bottom: 8px; }
    .info-box p { font-size: 10px; color: #a8a29e; margin-bottom: 4px; }
    .dates { display: flex; gap: 40px; }
    .date-item .label { font-size: 8px; color: #78716c; text-transform: uppercase; letter-spacing: 2px; }
    .date-item .value { font-family: 'Cormorant Garamond', serif; font-size: 14px; color: #faf5ef; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
    thead { background: linear-gradient(135deg, #b59f6f 0%, #d4c4a8 50%, #b59f6f 100%); }
    th { padding: 14px 16px; text-align: left; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #1c1917; }
    th:last-child { text-align: right; }
    td { padding: 16px; border-bottom: 1px solid #292524; font-size: 10px; color: #d6d3d1; }
    td:last-child { text-align: right; }
    tbody tr { background: #292524; }
    tbody tr:nth-child(even) { background: #1c1917; }
    .item-name { font-weight: 500; color: #faf5ef; }
    .totals { display: flex; justify-content: flex-end; margin-bottom: 40px; }
    .totals-box { width: 280px; background: linear-gradient(135deg, #b59f6f 0%, #d4c4a8 50%, #b59f6f 100%); padding: 24px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 10px; color: #1c1917; }
    .total-row.final { padding-top: 16px; margin-top: 8px; border-top: 1px solid rgba(28,25,23,0.3); font-size: 16px; font-weight: 600; }
    .footer { display: flex; justify-content: space-between; align-items: flex-start; }
    .notes { max-width: 360px; }
    .notes h4 { font-size: 9px; color: #b59f6f; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
    .notes p { font-size: 10px; color: #a8a29e; font-style: italic; }
    .qr { text-align: center; padding: 20px; border: 1px solid #b59f6f; }
    .qr img { width: 72px; height: 72px; filter: sepia(30%) brightness(1.1); }
    .qr p { font-size: 7px; color: #b59f6f; margin-top: 8px; text-transform: uppercase; letter-spacing: 2px; }
    .bank { margin-top: 32px; padding: 20px; background: #292524; border-left: 2px solid #b59f6f; }
    .bank h4 { font-size: 9px; color: #b59f6f; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
    .bank p { font-size: 10px; color: #a8a29e; margin-bottom: 4px; }
    .gold-line-bottom { height: 1px; background: linear-gradient(90deg, transparent 0%, #b59f6f 50%, transparent 100%); margin-top: 40px; }
    @media print { 
      body { background: #1c1917; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      thead, .totals-box { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="gold-line"></div>
    
    <div class="header">
      <div class="brand">
        ${logoBase64 ? `<img src="${logoBase64}" style="max-height: 56px; max-width: 180px; margin-bottom: 12px; display: block; filter: sepia(20%) brightness(0.9);" alt="Logo" />` : ''}
        <h1>${invoice.seller.businessName}</h1>
        <p>${invoice.seller.email}</p>
        ${invoice.seller.taxId ? `<p style="margin-top: 8px;">GSTIN: ${invoice.seller.taxId}</p>` : ''}
      </div>
      <div class="invoice-badge">
        <p class="label">Invoice</p>
        <p class="number">${invoice.invoiceNumber}</p>
      </div>
    </div>

    <div class="gold-divider"></div>

    <div class="info-section">
      <div class="info-box">
        <h3>Billed To</h3>
        ${invoice.buyer ? `
          <p class="name">${invoice.buyer.name}</p>
          ${invoice.buyer.address ? `<p>${invoice.buyer.address}</p>` : ''}
          ${invoice.buyer.email ? `<p>${invoice.buyer.email}</p>` : ''}
          ${invoice.buyer.phone ? `<p>${invoice.buyer.phone}</p>` : ''}
        ` : '<p class="name">Valued Customer</p>'}
      </div>
      <div class="info-box">
        <h3>Invoice Details</h3>
        <div class="dates">
          <div class="date-item">
            <p class="label">Date</p>
            <p class="value">${formatDate(invoice.issueDate)}</p>
          </div>
          ${invoice.dueDate ? `
            <div class="date-item">
              <p class="label">Due</p>
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
          <span>Total Due</span>
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
        <p>Verify Authenticity</p>
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
