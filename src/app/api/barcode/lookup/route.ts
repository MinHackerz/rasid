import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import OpenAI from 'openai';
// puppeteer is unused now, but kept in case robust fallback is needed later. 
// Ideally remove if not needed.

interface ProductLookupResult {
    found: boolean;
    source: 'inventory' | 'openai' | 'manual';
    product?: {
        name: string;
        brand?: string;
        description?: string;
        quantity?: string;
        category?: string;
        imageUrl?: string;
        barcode: string;
        price?: string;
    };
    inventoryItem?: {
        id: string;
        description: string;
        note?: string;
        price: string;
        unit: string;
        taxRate: string;
        quantity: number;
    };
}

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Query OpenAI for product details (augmented with Fetch & Raw Text Search)
async function queryOpenAI(barcode: string): Promise<ProductLookupResult | null> {
    try {
        console.log(`[Barcode] Fast Scrape+AI Lookup for: ${barcode}`);

        let searchContext = "";

        try {
            // 1. Fetch DuckDuckGo HTML directly (No Puppeteer overhead)
            // Using HTML version which is lighter and faster
            const response = await fetch(`https://duckduckgo.com/html/?q=${barcode}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                },
                cache: 'no-store'
            });

            if (!response.ok) {
                console.error(`[Barcode] Fetch failed: ${response.status} ${response.statusText}`);
                throw new Error('Failed to fetch search results');
            }

            const html = await response.text();

            // 2. Robust HTML-to-Text (Avoid fragile Regex selectors)
            // Just strip tags and let OpenAI find the needle in the haystack
            const text = html
                .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '') // Remove scripts
                .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '')   // Remove styles
                .replace(/<[^>]+>/g, ' ')                           // Remove all tags
                .replace(/\s+/g, ' ')                               // Compress whitespace
                .trim();

            // Truncate to reasonable length (e.g. 1000 chars) as per user optimization
            searchContext = text.slice(0, 1000);

            console.log(`[Barcode] Fast Raw context (length: ${searchContext.length})`);

        } catch (scrapeError) {
            console.error('[Barcode] Scraping failed:', scrapeError);
        }

        if (!searchContext || searchContext.length < 100) {
            console.log('[Barcode] Insufficient search context found.');
            return null;
        }

        // 3. Query OpenAI with Context
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are an expert product database assistant. Your goal is to identify commercial products based on raw search result text for their barcode.
                    
                    I will provide raw text content from a search result page. Analyze it to identify the EXACT product.
                    - Look for patterns like "Title: ...", "Results for...", or product listings.
                    - If you find a clear product match (e.g. "Tata Tea Gold 250g"), extract the details.
                    - If the text is generic, unrelated, or doesn't identify a product, return null.
                    - Do NOT guess.
                    
                    Result format (JSON):
                    - name: The full product name
                    - brand: The brand name
                    - description: A short, concise description
                    - category: The general category
                    - quantity: The net quantity if identifiable
                    - price: Extract the price NUMBER only. Scan for patterns like "₹ 500", "Rs. 250", "INR 999", "$10". If multiple exist, prioritize the MRP.
                    `
                },
                {
                    role: "user",
                    content: `Barcode: ${barcode}\n\nSearch Page Content:\n${searchContext}`
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0,
        });

        const content = completion.choices[0].message.content;
        if (!content) return null;

        const data = JSON.parse(content);

        if (!data.name || data.name.toLowerCase().includes('unknown')) return null;

        console.log(`[Barcode] OpenAI identified: "${data.name}"`);

        return {
            found: true,
            source: 'openai',
            product: {
                name: data.name,
                brand: data.brand || '',
                description: data.description || '',
                category: data.category || '',
                quantity: data.quantity || '',
                barcode,
                imageUrl: '',
                price: data.price || '',
            },
        };
    } catch (error) {
        console.error('OpenAI API error:', error);
        return null;
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const barcode = searchParams.get('barcode');

        if (!barcode) {
            return NextResponse.json(
                { success: false, error: 'Barcode is required' },
                { status: 400 }
            );
        }

        // 1. Check local inventory first
        const inventoryItem = await prisma.inventoryItem.findFirst({
            where: {
                sellerId: session.sellerId,
                barcode: barcode,
            },
        });

        if (inventoryItem) {
            return NextResponse.json({
                success: true,
                data: {
                    found: true,
                    source: 'inventory',
                    inventoryItem: {
                        id: inventoryItem.id,
                        description: inventoryItem.description,
                        note: inventoryItem.note,
                        price: inventoryItem.price.toString(),
                        unit: inventoryItem.unit,
                        taxRate: inventoryItem.taxRate.toString(),
                        quantity: inventoryItem.quantity,
                    },
                } as ProductLookupResult,
            });
        }

        // 2. Query OpenAI
        const openAIResult = await queryOpenAI(barcode);
        if (openAIResult) {
            return NextResponse.json({
                success: true,
                data: openAIResult,
            });
        }

        // 3. Product not found - return manual entry
        console.log(`[Barcode] No product found for: ${barcode}, falling back to manual entry`);
        return NextResponse.json({
            success: true,
            data: {
                found: false,
                source: 'manual',
                product: {
                    name: '',
                    barcode,
                },
            } as ProductLookupResult,
        });
    } catch (error) {
        console.error('Barcode lookup error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to lookup barcode' },
            { status: 500 }
        );
    }
}
