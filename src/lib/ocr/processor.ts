/**
 * Document Processor for Rasid Invoice Platform
 * 
 * Handles file storage, PDF page extraction, and batch processing
 */

import { promises as fs } from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { getOCRPipeline } from './pipeline';
import type { ExtractedInvoiceData, ProcessingStatus, UploadedFile } from '@/types';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

// ============================================
// File Storage
// ============================================
export async function ensureUploadDir(): Promise<void> {
    const uploadsPath = path.resolve(UPLOAD_DIR);
    try {
        await fs.access(uploadsPath);
    } catch {
        await fs.mkdir(uploadsPath, { recursive: true });
    }
}

export async function saveUploadedFile(
    sellerId: string,
    file: File
): Promise<UploadedFile> {
    await ensureUploadDir();

    // Create seller-specific directory
    const sellerDir = path.join(UPLOAD_DIR, sellerId);
    await fs.mkdir(sellerDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const ext = path.extname(file.name);
    const filename = `${timestamp}-${Math.random().toString(36).substring(7)}${ext}`;
    const storagePath = path.join(sellerDir, filename);

    // Convert File to Buffer and save
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(storagePath, buffer);

    // Determine page count (for PDFs, this would require parsing)
    let pageCount = 1;
    if (file.type === 'application/pdf') {
        // TODO: Use pdf-parse or similar to get page count
        pageCount = await getPdfPageCount(buffer);
    }

    // Create database record
    const document = await prisma.uploadedDocument.create({
        data: {
            sellerId,
            originalName: file.name,
            storagePath,
            mimeType: file.type,
            fileSize: file.size,
            pageCount,
            processingStatus: 'PENDING',
        },
    });

    return {
        id: document.id,
        originalName: document.originalName,
        storagePath: document.storagePath,
        mimeType: document.mimeType,
        fileSize: document.fileSize,
        pageCount: document.pageCount,
    };
}

// ============================================
// PDF Processing
// ============================================
async function getPdfPageCount(buffer: Buffer): Promise<number> {
    // Simple PDF page count by counting page objects
    // For production, use a proper PDF library
    const content = buffer.toString('binary');
    const matches = content.match(/\/Type\s*\/Page[^s]/g);
    return matches ? matches.length : 1;
}

export async function extractPdfPages(pdfBuffer: Buffer): Promise<Buffer[]> {
    // This would require a library like pdf-lib or pdf-poppler
    // For MVP, we'll process the PDF as a whole
    // In production, convert each page to image using puppeteer or pdf-poppler

    // Placeholder: return the original buffer
    // TODO: Implement proper PDF to image conversion
    return [pdfBuffer];
}

// ============================================
// Document Processing
// ============================================
export async function processDocument(documentId: string): Promise<void> {
    // Update status to processing
    await prisma.uploadedDocument.update({
        where: { id: documentId },
        data: { processingStatus: 'PROCESSING' },
    });

    try {
        const document = await prisma.uploadedDocument.findUnique({
            where: { id: documentId },
        });

        if (!document) {
            throw new Error('Document not found');
        }

        // Read the file
        const fileBuffer = await fs.readFile(document.storagePath);
        const pipeline = getOCRPipeline();

        let extractedData: ExtractedInvoiceData;

        if (document.mimeType === 'application/pdf') {
            // Extract pages and process each
            const pageBuffers = await extractPdfPages(fileBuffer);
            const results = await pipeline.batchProcess(pageBuffers);

            // Merge results (for multi-page invoices)
            extractedData = mergeExtractionResults(results);
        } else {
            // Process single image
            extractedData = await pipeline.extractInvoiceData(fileBuffer);
        }

        // Save the results
        const status: ProcessingStatus = extractedData.confidence > 0.6 ? 'COMPLETED' : 'REVIEW_NEEDED';

        await prisma.uploadedDocument.update({
            where: { id: documentId },
            data: {
                processingStatus: status,
                extractedData: extractedData as any,
                ocrResult: { rawText: extractedData.rawText },
                confidence: extractedData.confidence,
                processedAt: new Date(),
            },
        });
    } catch (error) {
        console.error('Document processing failed:', error);

        await prisma.uploadedDocument.update({
            where: { id: documentId },
            data: {
                processingStatus: 'FAILED',
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
                processedAt: new Date(),
            },
        });

        throw error;
    }
}

// ============================================
// Result Merging
// ============================================
function mergeExtractionResults(results: ExtractedInvoiceData[]): ExtractedInvoiceData {
    if (results.length === 0) {
        return {
            items: [],
            confidence: 0,
            rawText: '',
        };
    }

    if (results.length === 1) {
        return results[0];
    }

    // Merge multiple page results
    const merged: ExtractedInvoiceData = {
        items: [],
        confidence: 0,
        rawText: '',
    };

    let totalConfidence = 0;

    for (const result of results) {
        // Take first non-empty values for header fields
        if (!merged.sellerName && result.sellerName) merged.sellerName = result.sellerName;
        if (!merged.buyerName && result.buyerName) merged.buyerName = result.buyerName;
        if (!merged.invoiceDate && result.invoiceDate) merged.invoiceDate = result.invoiceDate;
        if (!merged.invoiceNumber && result.invoiceNumber) merged.invoiceNumber = result.invoiceNumber;

        // Merge items from all pages
        merged.items.push(...result.items);

        // Take the highest totals (usually on last page)
        if (result.totalAmount && (!merged.totalAmount || result.totalAmount > merged.totalAmount)) {
            merged.totalAmount = result.totalAmount;
        }
        if (result.taxAmount && (!merged.taxAmount || result.taxAmount > merged.taxAmount)) {
            merged.taxAmount = result.taxAmount;
        }
        if (result.subtotal && (!merged.subtotal || result.subtotal > merged.subtotal)) {
            merged.subtotal = result.subtotal;
        }

        // Concatenate raw text
        merged.rawText += '\n---PAGE BREAK---\n' + result.rawText;
        totalConfidence += result.confidence;
    }

    merged.confidence = totalConfidence / results.length;
    merged.rawText = merged.rawText.trim();

    return merged;
}

// ============================================
// Batch Processing Queue
// ============================================
export async function queueDocumentForProcessing(documentId: string): Promise<void> {
    // In a production app, this would add to a job queue (Bull, etc.)
    // For MVP, we'll process immediately but asynchronously
    setImmediate(() => {
        processDocument(documentId).catch(console.error);
    });
}

export async function getDocumentStatus(documentId: string) {
    const document = await prisma.uploadedDocument.findUnique({
        where: { id: documentId },
        select: {
            id: true,
            processingStatus: true,
            extractedData: true,
            confidence: true,
            errorMessage: true,
            processedAt: true,
        },
    });

    return document;
}

// ============================================
// Cleanup
// ============================================
export async function deleteDocument(documentId: string): Promise<void> {
    const document = await prisma.uploadedDocument.findUnique({
        where: { id: documentId },
    });

    if (document) {
        // Delete file from storage
        try {
            await fs.unlink(document.storagePath);
        } catch {
            console.warn('Failed to delete file:', document.storagePath);
        }

        // Delete database record
        await prisma.uploadedDocument.delete({
            where: { id: documentId },
        });
    }
}
