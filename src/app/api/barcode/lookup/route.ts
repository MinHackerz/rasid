import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
import { getSession } from '@/lib/auth';
import OpenAI from 'openai';

interface ProductLookupResult {
    found: boolean;
    source: 'inventory' | 'openai_web' | 'openfoodfacts' | 'upcitemdb' | 'manual';
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

// ──────────────────────────────────────────────
// In-memory barcode cache (instant repeat lookups)
// TTL: 24 hours — same product scanned again = 0ms
// ──────────────────────────────────────────────
const barcodeCache = new Map<string, { result: ProductLookupResult; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function getCachedResult(barcode: string): ProductLookupResult | null {
    const cached = barcodeCache.get(barcode);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`[Barcode] ⚡ Cache HIT for: ${barcode} → "${cached.result.product?.name}"`);
        return cached.result;
    }
    if (cached) barcodeCache.delete(barcode); // expired
    return null;
}

function setCacheResult(barcode: string, result: ProductLookupResult) {
    barcodeCache.set(barcode, { result, timestamp: Date.now() });
    // Evict oldest entries if cache grows too large (prevent memory leaks)
    if (barcodeCache.size > 5000) {
        const firstKey = barcodeCache.keys().next().value;
        if (firstKey) barcodeCache.delete(firstKey);
    }
}

// ──────────────────────────────────────────────
// Open*Facts lookup (Food + Beauty + Products — parallel)
// ──────────────────────────────────────────────
async function lookupOpenFacts(barcode: string): Promise<ProductLookupResult | null> {
    const databases = [
        `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
        `https://world.openbeautyfacts.org/api/v2/product/${barcode}.json`,
        `https://world.openproductsfacts.org/api/v2/product/${barcode}.json`,
    ];

    // Race — first successful result wins
    const results = await Promise.allSettled(
        databases.map(async (url) => {
            const response = await fetch(url, {
                headers: { 'User-Agent': 'RasidInvoice/1.0 (menajul99mhq@gmail.com)' },
                signal: AbortSignal.timeout(4000),
            });
            if (!response.ok) return null;
            const data = await response.json();
            if (data.status !== 1 || !data.product) return null;
            const product = data.product;
            const name = product.product_name || product.product_name_en || '';
            if (!name) return null;
            return {
                found: true as const,
                source: 'openfoodfacts' as const,
                product: {
                    name,
                    brand: product.brands || '',
                    description: product.generic_name || product.categories || '',
                    category: product.categories?.split(',')[0]?.trim() || '',
                    quantity: product.quantity || '',
                    barcode,
                    imageUrl: product.image_front_small_url || product.image_url || '',
                    price: '',
                },
            };
        })
    );

    for (const r of results) {
        if (r.status === 'fulfilled' && r.value) {
            console.log(`[Barcode] Open*Facts found: "${r.value.product?.name}"`);
            return r.value;
        }
    }
    return null;
}

// ──────────────────────────────────────────────
// UPCitemdb lookup (free trial: 100 req/day)
// ──────────────────────────────────────────────
async function lookupUPCitemdb(barcode: string): Promise<ProductLookupResult | null> {
    const response = await fetch(
        `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`,
        {
            headers: { 'Accept': 'application/json', 'User-Agent': 'RasidInvoice/1.0' },
            signal: AbortSignal.timeout(4000),
        }
    );

    if (!response.ok) return null;
    const data = await response.json();
    if (!data.items || data.items.length === 0) return null;

    const item = data.items[0];
    const name = item.title || '';
    if (!name) return null;

    let price = '';
    if (item.offers && item.offers.length > 0) {
        const validPrices = item.offers
            .map((o: { price?: number }) => o.price)
            .filter((p: number | undefined): p is number => typeof p === 'number' && p > 0);
        if (validPrices.length > 0) {
            validPrices.sort((a: number, b: number) => a - b);
            price = validPrices[Math.floor(validPrices.length / 2)].toString();
        }
    }

    console.log(`[Barcode] UPCitemdb found: "${name}"`);
    return {
        found: true,
        source: 'upcitemdb',
        product: {
            name,
            brand: item.brand || '',
            description: item.description || '',
            category: item.category || '',
            quantity: item.size || item.weight || '',
            barcode,
            imageUrl: (item.images && item.images.length > 0) ? item.images[0] : '',
            price,
        },
    };
}

// ──────────────────────────────────────────────
// OpenAI Web Search (real-time, grounded)
// ──────────────────────────────────────────────
async function lookupOpenAIWebSearch(barcode: string): Promise<ProductLookupResult | null> {
    const response = await openai.responses.create({
        model: "gpt-4o-mini",
        tools: [
            {
                type: "web_search_preview",
                search_context_size: "low",
                user_location: { type: "approximate", country: "IN" },
            },
        ],
        instructions: `You are a barcode product identification assistant. The user gives a barcode number.
Use web search to find the EXACT product. Search for the barcode on product databases and e-commerce sites.

RULES:
- You MUST search the web. Do NOT guess.
- Only return if you find a CONFIRMED match.
- If unsure, return {"found": false}
- Indian barcodes start with 890.

Return ONLY valid JSON:
{"found":true,"name":"Full product name","brand":"Brand","description":"Short desc","category":"Category","quantity":"Weight/volume","price":"MRP number only"}`,
        input: `Find the exact product for barcode: ${barcode}`,
        text: { format: { type: "text" } },
        temperature: 0,
        store: false,
    });

    const outputText = response.output_text;
    if (!outputText) return null;

    let jsonStr = outputText.trim();
    if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
    }

    const data = JSON.parse(jsonStr);
    if (!data.found || !data.name) return null;

    console.log(`[Barcode] OpenAI Web Search found: "${data.name}"`);
    return {
        found: true,
        source: 'openai_web',
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
}

// ──────────────────────────────────────────────
// Main handler: ALL lookups race in parallel
// ──────────────────────────────────────────────
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

        // ── Step 0: In-memory cache (instant — 0ms) ──
        const cached = getCachedResult(barcode);
        if (cached) {
            return NextResponse.json({ success: true, data: cached });
        }

        // ── Step 1: Check local inventory (fast DB query) ──
        const inventoryItem = await prisma.inventoryItem.findFirst({
            where: { sellerId: session.sellerId, barcode },
        });

        if (inventoryItem) {
            console.log(`[Barcode] Found in inventory: ${inventoryItem.description}`);
            const result: ProductLookupResult = {
                found: true,
                source: 'inventory',
                inventoryItem: {
                    id: inventoryItem.id,
                    description: inventoryItem.description,
                    note: inventoryItem.note ?? undefined,
                    price: inventoryItem.price.toString(),
                    unit: inventoryItem.unit,
                    taxRate: inventoryItem.taxRate.toString(),
                    quantity: inventoryItem.quantity,
                },
            };
            return NextResponse.json({ success: true, data: result });
        }

        // ── Step 2: Race ALL external sources in parallel ──
        // First result to resolve wins — no waiting for slow ones
        console.log(`[Barcode] Racing all sources for: ${barcode}`);
        const startTime = Date.now();

        const result = await raceForFirstResult(barcode);

        const elapsed = Date.now() - startTime;
        console.log(`[Barcode] Resolved in ${elapsed}ms`);

        if (result) {
            // Cache for instant repeat lookups
            setCacheResult(barcode, result);
            return NextResponse.json({ success: true, data: result });
        }

        // ── Step 3: Nothing found — manual entry ──
        console.log(`[Barcode] No product found for: ${barcode}, falling back to manual entry`);
        return NextResponse.json({
            success: true,
            data: {
                found: false,
                source: 'manual',
                product: { name: '', barcode },
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

// ──────────────────────────────────────────────
// Race pattern: all sources start simultaneously,
// return the FIRST successful result immediately.
// Remaining promises are abandoned (not awaited).
// ──────────────────────────────────────────────
async function raceForFirstResult(barcode: string): Promise<ProductLookupResult | null> {
    return new Promise((resolve) => {
        let settled = false;
        let completedCount = 0;
        const totalSources = 3;

        const tryResolve = (result: ProductLookupResult | null) => {
            completedCount++;
            if (settled) return;

            if (result && result.found) {
                settled = true;
                resolve(result);
                return;
            }

            // All sources finished without a result
            if (completedCount >= totalSources) {
                settled = true;
                resolve(null);
            }
        };

        // Fire all lookups simultaneously
        lookupOpenFacts(barcode).then(tryResolve).catch(() => tryResolve(null));
        lookupUPCitemdb(barcode).then(tryResolve).catch(() => tryResolve(null));
        lookupOpenAIWebSearch(barcode).then(tryResolve).catch(() => tryResolve(null));
    });
}
