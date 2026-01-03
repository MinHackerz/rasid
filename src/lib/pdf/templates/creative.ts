/**
 * Creative Template - Asymmetric layout, colorful
 */

import type { InvoiceTemplateConfig } from './types';
import type { InvoiceWithRelations } from '@/types';
import { formatCurrency, formatDate, BANK_LABELS } from './helpers';

export const creativeTemplate: InvoiceTemplateConfig = {
  id: 'creative',
  name: 'Creative Agency',
  description: 'Bold asymmetric design for creative businesses',
  category: 'creative',
  colors: {
    primary: '#ec4899',
    secondary: '#f97316',
    accent: '#fef3c7',
  },
  thumbnail: `<svg viewBox="0 0 200 260" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="260" fill="white"/>
    <rect width="60" height="260" fill="#fef3c7"/>
    <rect x="8" y="16" width="44" height="12" rx="2" fill="#ec4899"/>
    <rect x="8" y="36" width="36" height="5" rx="1" fill="#f97316"/>
    <rect x="72" y="16" width="112" height="16" rx="2" fill="#1f2937"/>
    <rect x="72" y="40" width="80" height="6" rx="1" fill="#9ca3af"/>
    <rect x="8" y="70" width="44" height="30" rx="4" fill="white" stroke="#ec4899"/>
    <rect x="72" y="70" width="112" height="30" rx="4" fill="#fef3c7"/>
    <rect x="72" y="120" width="112" height="12" rx="2" fill="#ec4899"/>
    <rect x="72" y="138" width="112" height="10" rx="1" fill="#fef3c7"/>
    <rect x="72" y="152" width="112" height="10" rx="1" fill="white"/>
    <rect x="72" y="166" width="112" height="10" rx="1" fill="#fef3c7"/>
    <rect x="120" y="195" width="64" height="35" rx="4" fill="linear-gradient(135deg, #ec4899, #f97316)"/>
    <rect x="120" y="195" width="64" height="35" rx="4" fill="#ec4899"/>
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
      font-family: 'Poppins', -apple-system, sans-serif;
      font-size: 11px;
      line-height: 1.5;
      color: #1f2937;
      background: #ffffff;
    }
    .layout { display: flex; min-height: 100vh; }
    .sidebar { width: 200px; background: #fef3c7; padding: 32px 24px; flex-shrink: 0; }
    .main { flex: 1; padding: 32px 40px; }
    .logo-area { margin-bottom: 32px; }
    .logo-area h2 { font-size: 14px; font-weight: 700; color: #ec4899; margin-bottom: 4px; }
    .logo-area p { font-size: 9px; color: #f97316; text-transform: uppercase; letter-spacing: 1px; }
    .sidebar-section { margin-bottom: 28px; }
    .sidebar-section h4 { font-size: 8px; text-transform: uppercase; letter-spacing: 1.5px; color: #ec4899; font-weight: 700; margin-bottom: 8px; }
    .sidebar-section p { font-size: 10px; color: #78350f; margin-bottom: 2px; }
    .sidebar-section .value { font-size: 12px; font-weight: 600; color: #1f2937; }
    .qr-box { background: white; padding: 16px; border-radius: 12px; border: 2px solid #ec4899; text-align: center; }
    .qr-box img { width: 80px; height: 80px; }
    .qr-box p { font-size: 7px; color: #ec4899; margin-top: 8px; text-transform: uppercase; letter-spacing: 1px; }
    .header { margin-bottom: 32px; }
    .header h1 { font-size: 28px; font-weight: 800; color: #1f2937; margin-bottom: 4px; }
    .header p { font-size: 11px; color: #6b7280; }
    .invoice-badge { display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f97316 100%); color: white; padding: 8px 16px; border-radius: 20px; font-size: 11px; font-weight: 700; margin-bottom: 24px; }
    .client-box { background: #fef3c7; padding: 20px; border-radius: 12px; margin-bottom: 24px; }
    .client-box h3 { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #f97316; font-weight: 700; margin-bottom: 8px; }
    .client-box .name { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
    .client-box p { font-size: 10px; color: #78350f; margin-bottom: 2px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead { background: linear-gradient(135deg, #ec4899 0%, #f97316 100%); color: white; }
    th { padding: 12px 14px; text-align: left; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    th:first-child { border-radius: 8px 0 0 8px; }
    th:last-child { border-radius: 0 8px 8px 0; text-align: right; }
    td { padding: 14px; font-size: 11px; }
    td:last-child { text-align: right; font-weight: 600; }
    tbody tr { background: #fef3c7; }
    tbody tr:nth-child(even) { background: white; }
    .item-name { font-weight: 600; color: #1f2937; }
    .totals { display: flex; justify-content: flex-end; margin-bottom: 32px; }
    .totals-box { width: 260px; background: linear-gradient(135deg, #ec4899 0%, #f97316 100%); border-radius: 12px; padding: 20px; color: white; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 11px; opacity: 0.9; }
    .total-row.final { padding-top: 12px; margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.4); font-size: 16px; font-weight: 800; opacity: 1; }
    .notes { padding: 16px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #ec4899; }
    .notes h4 { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #ec4899; font-weight: 700; margin-bottom: 6px; }
    .notes p { font-size: 10px; color: #78350f; }
    .bank { margin-top: 20px; padding: 16px; background: #fff7ed; border-radius: 8px; }
    .bank h4 { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #f97316; font-weight: 700; margin-bottom: 8px; }
    .bank p { font-size: 10px; color: #78350f; margin-bottom: 2px; }
    @media print { 
      .layout { min-height: auto; }
      thead, .totals-box, .invoice-badge { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="layout">
    <div class="sidebar">
      <div class="logo-area">
        ${logoBase64 ? `<img src="${logoBase64}" style="max-height: 48px; max-width: 150px; margin-bottom: 8px; display: block;" alt="Logo" />` : ''}
        <h2>${invoice.seller.businessName}</h2>
        <p>Invoice</p>
      </div>

      <div class="sidebar-section">
        <h4>From</h4>
        ${invoice.seller.businessAddress ? `<p>${invoice.seller.businessAddress}</p>` : ''}
        <p>${invoice.seller.email}</p>
        ${invoice.seller.phone ? `<p>${invoice.seller.phone}</p>` : ''}
        ${invoice.seller.taxId ? `<p style="margin-top: 8px; font-size: 9px;">GSTIN: ${invoice.seller.taxId}</p>` : ''}
      </div>

      <div class="sidebar-section">
        <h4>Date</h4>
        <p class="value">${formatDate(invoice.issueDate)}</p>
      </div>

      ${invoice.dueDate ? `
        <div class="sidebar-section">
          <h4>Due</h4>
          <p class="value">${formatDate(invoice.dueDate)}</p>
        </div>
      ` : ''}

      <div class="qr-box">
        <img src="${qrCodeDataUrl}" alt="QR" />
        <p>Scan to verify</p>
      </div>
    </div>

    <div class="main">
      <div class="header">
        <span class="invoice-badge">${invoice.invoiceNumber}</span>
        <h1>Invoice</h1>
        <p>Thank you for your business!</p>
      </div>

      <div class="client-box">
        <h3>Billed To</h3>
        ${invoice.buyer ? `
          <p class="name">${invoice.buyer.name}</p>
          ${invoice.buyer.address ? `<p>${invoice.buyer.address}</p>` : ''}
          ${invoice.buyer.email ? `<p>${invoice.buyer.email}</p>` : ''}
          ${invoice.buyer.phone ? `<p>${invoice.buyer.phone}</p>` : ''}
        ` : '<p class="name">Walk-in Customer</p>'}
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

      ${invoice.notes || invoice.terms ? `
        <div class="notes">
          ${invoice.notes ? `<h4>Notes</h4><p>${invoice.notes}</p>` : ''}
          ${invoice.terms ? `<h4 style="margin-top: 12px;">Terms</h4><p>${invoice.terms}</p>` : ''}
        </div>
      ` : ''}

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
  </div>
</body>
</html>
    `;
  }
};
