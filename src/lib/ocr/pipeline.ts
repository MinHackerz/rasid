/**
 * OCR Pipeline for Rasid Invoice Platform
 * 
 * Uses free Hugging Face models for:
 * - Text extraction (TrOCR, Donut)
 * - Document understanding (LayoutLMv3)
 * 
 * Design: Model-agnostic pipeline that can swap models easily
 */

import { HfInference } from '@huggingface/inference';
import type { ExtractedInvoiceData, ExtractedLineItem, OCRResult } from '@/types';

// ============================================
// Model Configuration
// ============================================
interface OCRModel {
    name: string;
    endpoint: string;
    type: 'ocr' | 'document-understanding';
}

const AVAILABLE_MODELS: Record<string, OCRModel> = {
    // TrOCR - Transformer-based OCR (Best for printed text like invoices)
    trocr: {
        name: 'microsoft/trocr-base-printed',
        endpoint: 'microsoft/trocr-base-printed',
        type: 'ocr',
    },
    // Donut - Document Understanding (Good but heavy)
    donut: {
        name: 'naver-clova-ix/donut-base-finetuned-cord-v2',
        endpoint: 'naver-clova-ix/donut-base-finetuned-cord-v2',
        type: 'document-understanding',
    },
    // LayoutLMv3 - Visual Document Understanding
    layoutlm: {
        name: 'microsoft/layoutlmv3-base',
        endpoint: 'microsoft/layoutlmv3-base',
        type: 'document-understanding',
    },
};

// Default model preference order - TrOCR is most reliable for pure text
const MODEL_PRIORITY = ['trocr', 'donut', 'layoutlm'];

// ============================================
// OCR Pipeline Class
// ============================================
import OpenAI from 'openai';

export class OCRPipeline {
    private hf?: HfInference;
    private openai: OpenAI | null = null;
    private currentModel: OCRModel;

    constructor(modelKey?: string) {
        const apiKey = process.env.HUGGINGFACE_API_KEY;
        // Not throwing here anymore to allow OpenAI-only usage if needed, 
        // but keeping it structural for now since HF is primary.
        // if (!apiKey) throw new Error... (kept as is in original for structure, but ideally we relax this if OpenAI is present)
        if (!apiKey && !process.env.OPENAI_API_KEY) {
            console.warn('No OCR API keys found (HF or OpenAI). Features may fail.');
        }

        if (apiKey) {
            this.hf = new HfInference(apiKey);
        }

        if (process.env.OPENAI_API_KEY) {
            this.openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
                dangerouslyAllowBrowser: true // Since we might run in Next.js edge/serverless
            });
        }

        this.currentModel = AVAILABLE_MODELS[modelKey || MODEL_PRIORITY[0]];
    }

    /**
     * Switch to a different OCR model
     */
    switchModel(modelKey: string): void {
        if (!AVAILABLE_MODELS[modelKey]) {
            throw new Error(`Unknown model: ${modelKey}. Available: ${Object.keys(AVAILABLE_MODELS).join(', ')}`);
        }
        this.currentModel = AVAILABLE_MODELS[modelKey];
    }

    /**
     * Process an image and extract text
     */
    async extractText(imageData: Buffer | Blob, triedModels: string[] = []): Promise<OCRResult> {
        // Validation for HF
        if (!this.hf) {
            throw new Error('Hugging Face client not initialized (missing API key)');
        }

        // Track current model as tried
        const currentModelKey = Object.keys(AVAILABLE_MODELS).find(key => AVAILABLE_MODELS[key] === this.currentModel) || 'unknown';
        if (!triedModels.includes(currentModelKey)) {
            triedModels.push(currentModelKey);
        }

        try {

            // Use the image-to-text pipeline
            const result = await this.hf.imageToText({
                model: this.currentModel.endpoint,
                data: Buffer.isBuffer(imageData) ? (imageData.buffer as ArrayBuffer) : imageData,
            });

            return {
                text: result.generated_text || '',
                confidence: 0.85, // HF doesn't always return confidence
            };
        } catch (error) {
            console.error(`OCR extraction failed with ${this.currentModel.name}:`, error instanceof Error ? error.message : error);

            // Find next model that hasn't been tried
            const nextModel = MODEL_PRIORITY.find(m => !triedModels.includes(m));

            if (nextModel) {
                this.switchModel(nextModel);
                return this.extractText(imageData, triedModels);
            }

            // Fallback to Tesseract.js -> REMOVED because it crashes with MODULE_NOT_FOUND in this environment
            // triggering an uncaught exception that prevents OpenAI fallback.
            // console.log('All HF models failed. Falling back to local Tesseract.js');
            // try { ... } 

            // Proceed directly to throwing error so extractInvoiceData can catch it and try OpenAI
            throw new Error(`All OCR models failed. Last error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Process document and extract structured invoice data
     */
    async extractInvoiceData(imageData: Buffer | Blob): Promise<ExtractedInvoiceData> {
        try {
            // Priority 1: Try Hugging Face / Tesseract Pipeline
            const ocrResult = await this.extractText(imageData);

            // Parse the extracted text into structured data
            const structuredData = this.parseInvoiceText(ocrResult.text);

            return {
                ...structuredData,
                confidence: ocrResult.confidence,
                rawText: ocrResult.text,
            };
        } catch (error) {
            console.error('Primary OCR pipeline failed:', error);

            // Priority 2: Fallback to OpenAI if configured
            if (this.openai) {
                return this.extractWithOpenAI(imageData);
            }

            throw error;
        }
    }

    /**
     * Fallback: Use OpenAI GPT-4o to extract structured data directly from image
     */
    private async extractWithOpenAI(imageData: Buffer | Blob): Promise<ExtractedInvoiceData> {
        if (!this.openai) throw new Error('OpenAI API key not configured');

        try {
            // Convert to base64
            const buffer = Buffer.isBuffer(imageData) ? imageData : Buffer.from(await (imageData as Blob).arrayBuffer());
            const base64Image = buffer.toString('base64');
            const dataUrl = `data:image/jpeg;base64,${base64Image}`; // Assuming JPEG/PNG, GPT-4o typically handles standard image formats

            const completion = await this.openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: `You are an expert invoice parser. Extract the following fields from the invoice image and return ONLY a JSON object:
                        - invoiceNumber (string)
                        - invoiceDate (string, standardized YYYY-MM-DD)
                        - sellerName (string)
                        - buyerName (string)
                        - totalAmount (number)
                        - taxAmount (number)
                        - subtotal (number)
                        - items (array of objects with: name, quantity, unitPrice, amount)
                        
                        If a field is missing, omit it or use null. Return pure JSON without markdown backticks.`
                    },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "Parse this invoice." },
                            {
                                type: "image_url",
                                image_url: {
                                    url: dataUrl
                                }
                            }
                        ],
                    },
                ],
                response_format: { type: "json_object" },
                temperature: 0,
            });

            const content = completion.choices[0].message.content;
            if (!content) throw new Error('OpenAI returned empty response');

            const parsed = JSON.parse(content);

            return {
                invoiceNumber: parsed.invoiceNumber,
                invoiceDate: parsed.invoiceDate,
                sellerName: parsed.sellerName,
                buyerName: parsed.buyerName,
                totalAmount: parsed.totalAmount,
                taxAmount: parsed.taxAmount,
                subtotal: parsed.subtotal,
                items: Array.isArray(parsed.items) ? parsed.items.map((i: any) => ({
                    name: i.name || 'Unknown Item',
                    quantity: Number(i.quantity) || 1,
                    unitPrice: Number(i.unitPrice) || 0,
                    amount: Number(i.amount) || 0,
                    confidence: 0.95
                })) : [],
                confidence: 0.9,
                rawText: 'Extracted via OpenAI Vision',
            };

        } catch (err) {
            console.error('OpenAI fallback failed:', err);
            throw new Error(`All methods failed. Primary OCR error: see logs. OpenAI error: ${err instanceof Error ? err.message : 'Unknown'}`);
        }
    }

    /**
     * Parse raw OCR text into structured invoice fields
     * This uses pattern matching and heuristics
     */
    private parseInvoiceText(text: string): Omit<ExtractedInvoiceData, 'confidence' | 'rawText'> {
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

        const result: Omit<ExtractedInvoiceData, 'confidence' | 'rawText'> = {
            items: [],
        };

        // Extract invoice number
        const invoiceNumberPatterns = [
            /invoice\s*(?:#|no\.?|number)?[:\s]*([A-Z0-9\-]+)/i,
            /(?:#|no\.?)[:\s]*([A-Z0-9\-]+)/i,
            /bill\s*(?:#|no\.?)?[:\s]*([A-Z0-9\-]+)/i,
        ];

        for (const pattern of invoiceNumberPatterns) {
            const match = text.match(pattern);
            if (match) {
                result.invoiceNumber = match[1].trim();
                break;
            }
        }

        // Extract date
        const datePatterns = [
            /date[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
            /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/,
            /(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4})/i,
        ];

        for (const pattern of datePatterns) {
            const match = text.match(pattern);
            if (match) {
                result.invoiceDate = match[1].trim();
                break;
            }
        }

        // Extract total amount
        const totalPatterns = [
            /total[:\s]*(?:₹|rs\.?|inr)?\s*([\d,]+\.?\d*)/i,
            /grand\s*total[:\s]*(?:₹|rs\.?|inr)?\s*([\d,]+\.?\d*)/i,
            /amount\s*(?:due|payable)?[:\s]*(?:₹|rs\.?|inr)?\s*([\d,]+\.?\d*)/i,
        ];

        for (const pattern of totalPatterns) {
            const match = text.match(pattern);
            if (match) {
                result.totalAmount = parseFloat(match[1].replace(/,/g, ''));
                break;
            }
        }

        // Extract tax amount
        const taxPatterns = [
            /(?:gst|tax|vat)[:\s]*(?:₹|rs\.?|inr)?\s*([\d,]+\.?\d*)/i,
            /(?:cgst|sgst|igst)[:\s]*(?:₹|rs\.?|inr)?\s*([\d,]+\.?\d*)/i,
        ];

        for (const pattern of taxPatterns) {
            const match = text.match(pattern);
            if (match) {
                result.taxAmount = parseFloat(match[1].replace(/,/g, ''));
                break;
            }
        }

        // Extract line items (this is the tricky part)
        // Look for patterns like: "Item Name    Qty    Price    Amount"
        const itemPatterns = [
            /^(.+?)\s+(\d+(?:\.\d+)?)\s*(?:x|@|×)?\s*(?:₹|rs\.?)?\s*([\d,]+\.?\d*)\s*(?:=|:)?\s*(?:₹|rs\.?)?\s*([\d,]+\.?\d*)$/i,
            /^(.+?)\s+(\d+)\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)$/,
        ];

        for (const line of lines) {
            for (const pattern of itemPatterns) {
                const match = line.match(pattern);
                if (match) {
                    const item: ExtractedLineItem = {
                        name: match[1].trim(),
                        quantity: parseFloat(match[2]),
                        unitPrice: parseFloat(match[3].replace(/,/g, '')),
                        amount: parseFloat(match[4].replace(/,/g, '')),
                        confidence: 0.7,
                    };
                    result.items.push(item);
                    break;
                }
            }
        }

        // Try to extract seller/buyer names from top of invoice
        // Usually first few lines contain business name
        if (lines.length > 0) {
            // First non-date, non-number line is likely the seller/business name
            for (const line of lines.slice(0, 5)) {
                if (!line.match(/^\d/) && !line.match(/date|invoice|bill|total/i) && line.length > 3) {
                    result.sellerName = line;
                    break;
                }
            }
        }

        // Calculate subtotal if we have items but no total
        if (result.items.length > 0 && !result.subtotal) {
            result.subtotal = result.items.reduce((sum, item) => sum + (item.amount || 0), 0);
        }

        return result;
    }

    /**
     * Batch process multiple images
     */
    async batchProcess(images: Array<Buffer | Blob>): Promise<ExtractedInvoiceData[]> {
        const results: ExtractedInvoiceData[] = [];

        for (const image of images) {
            try {
                const data = await this.extractInvoiceData(image);
                results.push(data);
            } catch (error) {
                console.error('Failed to process image:', error);
                results.push({
                    items: [],
                    confidence: 0,
                    rawText: '',
                });
            }
        }

        return results;
    }
}

// ============================================
// Singleton instance for the default pipeline
// ============================================
let defaultPipeline: OCRPipeline | null = null;

export function getOCRPipeline(): OCRPipeline {
    if (!defaultPipeline) {
        defaultPipeline = new OCRPipeline();
    }
    return defaultPipeline;
}

// ============================================
// Helper function to process uploaded file
// ============================================
export async function processUploadedDocument(
    fileBuffer: Buffer,
    mimeType: string
): Promise<ExtractedInvoiceData[]> {
    const pipeline = getOCRPipeline();

    // If it's a PDF, we'd need to convert pages to images first
    // For now, we'll handle single images
    if (mimeType === 'application/pdf') {
        // PDF processing would require pdf-to-image conversion
        // This is handled by the document processor
        throw new Error('PDF processing requires page extraction first');
    }

    const result = await pipeline.extractInvoiceData(fileBuffer);
    return [result];
}
