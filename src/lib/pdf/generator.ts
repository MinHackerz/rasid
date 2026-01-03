/**
 * PDF Generation Service for Rasid Invoice Platform
 * 
 * Generates professional, printer-friendly invoice PDFs
 * Uses Puppeteer for HTML → PDF conversion
 * Supports multiple premium invoice templates
 */

import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import { prisma } from '@/lib/prisma';
import { getTemplateById } from './templates';
import type { InvoiceWithRelations } from '@/types';

const PDF_OUTPUT_DIR = process.env.UPLOAD_DIR || './uploads';

// ============================================
// QR Code Generation
// ============================================
async function generateQRCode(data: string): Promise<string> {
  return QRCode.toDataURL(data, {
    width: 120,
    margin: 1,
    color: {
      dark: '#1a1a1a',
      light: '#ffffff',
    },
  });
}

// ============================================
// Helper: Load image as base64
// ============================================
async function getImageAsBase64(imagePath: string): Promise<string | null> {
  if (!imagePath) return null;

  // If it's already a data URL or http URL, return as is
  if (imagePath.startsWith('data:') || imagePath.startsWith('http')) {
    return imagePath;
  }

  try {
    // Assume local path in public directory
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    const fullPath = path.join(process.cwd(), 'public', cleanPath);

    const fileData = await fs.readFile(fullPath);
    const ext = path.extname(fullPath).substring(1);
    const mimeType = ext === 'svg' ? 'image/svg+xml' : `image/${ext}`;

    return `data:${mimeType};base64,${fileData.toString('base64')}`;
  } catch (error) {
    console.error(`Failed to load image: ${imagePath}`, error);
    return null;
  }
}

// ============================================
// PDF Generation
// ============================================
export async function generateInvoicePDF(invoiceId: string): Promise<string> {
  // Fetch invoice with all relations
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      seller: true,
      buyer: true,
      items: {
        orderBy: { sortOrder: 'asc' },
      },
      sourceDocument: { select: { extractedData: true } },
    },
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  // Get seller's template preference
  const invoiceDefaults = invoice.seller.invoiceDefaults as Record<string, unknown> | null;
  const templateId = (invoiceDefaults?.templateId as string) || 'classic';
  const template = getTemplateById(templateId);

  // Generate verification URL and QR code
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verificationUrl = `${appUrl}/verify/${invoice.verificationHash}`;
  const qrCodeDataUrl = await generateQRCode(verificationUrl);

  // Get logo as base64
  let logoBase64 = invoice.seller.logo ? await getImageAsBase64(invoice.seller.logo) : null;

  // Apply digitized invoice overrides if available
  let seller = invoice.seller;
  if (invoice.sourceType === 'OCR' && (invoice as any).sourceDocument?.extractedData) {
    const extracted = (invoice as any).sourceDocument.extractedData as any;

    // Only apply overrides if user did NOT choose "Use My Business Profile"
    if (extracted.useProfile !== true) {
      // Disable Profile Logo for Digitized Invoices
      logoBase64 = null;

      // Handle both nested seller object and flat properties
      const extractedSeller = extracted.seller || {};

      // Merge with precedence: Extracted > Profile
      // STRICT OVERRIDE: Do NOT fallback to seller.* profile details
      seller = {
        ...seller,
        businessName: extractedSeller.businessName || extracted.sellerName || '',
        businessAddress: extractedSeller.businessAddress || extracted.sellerAddress || null,
        phone: extractedSeller.phone || extracted.sellerPhone || null,
        email: extractedSeller.email || extracted.sellerEmail || '', // Email is required string
        taxId: extractedSeller.taxId || extracted.sellerTaxId || null,
      };
    }
  }

  // Cast invoice to expected type
  const invoiceData = {
    ...invoice,
    subtotal: Number(invoice.subtotal),
    taxAmount: Number(invoice.taxAmount),
    discountAmount: Number(invoice.discountAmount),
    totalAmount: Number(invoice.totalAmount),
    paymentStatus: (invoice as any).paymentStatus || 'DRAFT',
    deliveryStatus: (invoice as any).deliveryStatus || 'DRAFT',
    items: invoice.items.map((item: any) => ({
      ...item,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      taxRate: Number(item.taxRate),
      discount: Number(item.discount),
      amount: Number(item.amount),
    })),
    seller: {
      ...seller,
      bankDetails: seller.bankDetails as Record<string, string> | null,
    },
  } as InvoiceWithRelations;

  // Generate HTML using selected template
  const html = template.generateHTML(invoiceData, qrCodeDataUrl, logoBase64);

  // Launch Puppeteer and generate PDF
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
    });

    // Save PDF to disk
    const pdfDir = path.join(PDF_OUTPUT_DIR, invoice.sellerId, 'invoices');
    await fs.mkdir(pdfDir, { recursive: true });

    const pdfFilename = `${invoice.invoiceNumber.replace(/[^a-zA-Z0-9-]/g, '_')}.pdf`;
    const pdfPath = path.join(pdfDir, pdfFilename);
    await fs.writeFile(pdfPath, pdfBuffer);

    // Update invoice with PDF URL
    const pdfUrl = `/api/invoices/${invoice.id}/pdf`;
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { pdfUrl },
    });

    return pdfPath;
  } finally {
    await browser.close();
  }
}

// ============================================
// Get PDF Buffer (for serving)
// ============================================
export async function getInvoicePDFBuffer(invoiceId: string): Promise<Buffer | null> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: {
      id: true,
      invoiceNumber: true,
      sellerId: true,
    },
  });

  if (!invoice) {
    return null;
  }

  const pdfFilename = `${invoice.invoiceNumber.replace(/[^a-zA-Z0-9-]/g, '_')}.pdf`;
  const pdfPath = path.join(PDF_OUTPUT_DIR, invoice.sellerId, 'invoices', pdfFilename);

  try {
    return await fs.readFile(pdfPath);
  } catch {
    // PDF doesn't exist, generate it
    await generateInvoicePDF(invoiceId);
    return await fs.readFile(pdfPath);
  }
}
