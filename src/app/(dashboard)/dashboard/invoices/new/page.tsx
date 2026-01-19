'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, Textarea, Card, CardHeader, CardBody, CardFooter, FormRow, Select, BarcodeScanner } from '@/components/ui';
import { Plus, Trash2, ArrowLeft, AlertCircle, ScanBarcode, Search, UserCheck } from 'lucide-react';
import Link from 'next/link';

import { CURRENCIES, getCurrencySymbol, getCurrencyTaxName, getCurrencyTaxIdLabel } from '@/lib/currencies';
import { INDIAN_STATES } from '@/lib/constants/indian-states';

interface LineItem {
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number | string;
    taxRate: number | string;
    discount: number | string;
    discountType: 'AMOUNT' | 'PERCENT';
    isManual: boolean;
    inventoryItemId?: string; // Track inventory item for stock deduction
}

interface InvoiceFormData {
    buyerName: string;
    buyerEmail: string;
    buyerPhone: string;
    buyerAddress: string;
    buyerState: string;
    buyerTaxId: string;
    issueDate: string;
    dueDate: string;
    notes: string;
    terms: string;
    currency: string;
    status: 'DRAFT' | 'PENDING' | 'PAID';
}

import InventorySelector from './InventorySelector';

interface InventoryItem {
    id: string;
    description: string;
    note?: string;
    price: string;
    unit: string;
    taxRate: string;
    quantity: number;
}

export default function NewInvoicePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const fromUpload = searchParams.get('fromUpload');
    const buyerIdFromQuery = searchParams.get('buyerId');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [defaultTaxRate, setDefaultTaxRate] = useState(0);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [scannerOpen, setScannerOpen] = useState(false);
    const [scanningItemIndex, setScanningItemIndex] = useState<number | null>(null);

    // Customer search
    const [customerSearch, setCustomerSearch] = useState('');
    const [customerResults, setCustomerResults] = useState<Array<{
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        address: string | null;
        state: string | null;
        taxId: string | null;
    }>>([]);
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [searchingCustomers, setSearchingCustomers] = useState(false);

    const [formData, setFormData] = useState<InvoiceFormData>({
        buyerName: '',
        buyerEmail: '',
        buyerPhone: '',
        buyerAddress: '',
        buyerState: '',
        buyerTaxId: '',
        issueDate: (() => {
            const d = new Date();
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        })(),
        dueDate: (() => {
            const d = new Date();
            d.setDate(d.getDate() + 30);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        })(),
        notes: '',
        terms: 'Payment is due within 30 days of invoice date.',
        currency: 'INR',
        status: 'PAID',
    });

    const [items, setItems] = useState<LineItem[]>([
        { description: '', quantity: 1, unit: 'pcs', unitPrice: 0, taxRate: 0, discount: 0, discountType: 'AMOUNT', isManual: false, inventoryItemId: undefined },
    ]);

    const [sellerDetails, setSellerDetails] = useState({
        businessName: '',
        businessAddress: '',
        phone: '',
        email: '',
        taxId: ''
    });

    useEffect(() => {
        // Fetch Inventory
        fetch('/api/inventory')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setInventory(data.data);
                }
            })
            .catch(console.error);
    }, []);

    const [profileDetails, setProfileDetails] = useState<any>(null);

    const [businessSource, setBusinessSource] = useState<'EXTRACTED' | 'PROFILE'>('EXTRACTED');
    const [isEditingExtracted, setIsEditingExtracted] = useState(false);

    useEffect(() => {
        // Fetch User Preference for Tax Rate
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/profile');
                const data = await response.json();
                if (data.success) {
                    if (data.data) {
                        setProfileDetails(data.data);
                    }
                    if (data.data?.invoiceDefaults?.currency) {
                        const defaultCurrency = data.data.invoiceDefaults.currency;
                        setFormData(prev => ({ ...prev, currency: defaultCurrency }));
                    }
                    if (data.data?.invoiceDefaults?.taxRate) {
                        const rate = Number(data.data.invoiceDefaults.taxRate);
                        setDefaultTaxRate(rate);
                        // Update initial item if it appears redundant (default state check)
                        setItems(prev => {
                            if (prev.length === 1 && prev[0].description === '' && prev[0].unitPrice === 0) {
                                return [{ ...prev[0], taxRate: rate }];
                            }
                            return prev;
                        });
                    }
                }
            } catch (err) {
                console.error('Failed to fetch settings:', err);
            }
        };
        fetchSettings();
    }, []);

    useEffect(() => {
        // Handle Buyer Pre-fill
        if (buyerIdFromQuery) {
            const fetchBuyer = async () => {
                try {
                    setLoading(true);
                    const response = await fetch(`/api/buyers/${buyerIdFromQuery}`);
                    const data = await response.json();

                    if (data.success && data.data) {
                        const buyer = data.data;
                        setFormData(prev => ({
                            ...prev,
                            buyerName: buyer.name || '',
                            buyerEmail: buyer.email || '',
                            buyerPhone: buyer.phone || '',
                            buyerAddress: buyer.address || '',
                            buyerState: buyer.state || '',
                            buyerTaxId: buyer.taxId || '',
                        }));
                    }
                } catch (err) {
                    console.error('Failed to fetch buyer details:', err);
                } finally {
                    setLoading(false);
                }
            };
            fetchBuyer();
        }

        // Handle OCR Pre-fill
        if (fromUpload) {
            const fetchExtractedData = async () => {
                setLoading(true);
                try {
                    const response = await fetch(`/api/upload?documentId=${fromUpload}`);
                    const data = await response.json();
                    if (data.success && data.data.extractedData) {
                        const extracted = data.data.extractedData;
                        setFormData(prev => ({
                            ...prev,
                            buyerName: extracted.buyerName || '',
                            issueDate: extracted.invoiceDate || prev.issueDate,
                            status: 'DRAFT', // Digitized invoices default to DRAFT
                        }));

                        // Populate business details from extracted data
                        if (extracted.seller || extracted.sellerName) {
                            const seller = extracted.seller || {};
                            setSellerDetails({
                                businessName: seller.businessName || extracted.sellerName || '',
                                businessAddress: seller.businessAddress || extracted.sellerAddress || '',
                                phone: seller.phone || extracted.sellerPhone || '',
                                email: seller.email || extracted.sellerEmail || '',
                                taxId: seller.taxId || extracted.sellerTaxId || ''
                            });
                        }

                        if (extracted.items && extracted.items.length > 0) {
                            setItems(extracted.items.map((item: any) => ({
                                description: item.name || '',
                                quantity: item.quantity || 1,
                                unit: 'pcs',
                                unitPrice: item.unitPrice || 0,
                                taxRate: 0, // Fallback, could verify if we want to apply default here too
                                discount: 0,
                                discountType: 'AMOUNT',
                                isManual: true // Digitized items are manual by default
                            })));
                        }
                    }
                } catch (err) {
                    console.error('Failed to fetch extracted data:', err);
                } finally {
                    setLoading(false);
                }
            };
            fetchExtractedData();
        }
    }, [fromUpload, buyerIdFromQuery]);

    const addItem = () => {
        setItems([...items, { description: '', quantity: 1, unit: 'pcs', unitPrice: 0, taxRate: defaultTaxRate, discount: 0, discountType: 'AMOUNT', isManual: inventory.length === 0, inventoryItemId: undefined }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        } else {
            // Reset the single item to default state
            setItems([{
                description: '',
                quantity: 1,
                unit: 'pcs',
                unitPrice: 0,
                taxRate: defaultTaxRate,
                discount: 0,
                discountType: 'AMOUNT',
                isManual: inventory.length === 0,
                inventoryItemId: undefined
            }]);
        }
    };

    const updateItem = (index: number, field: keyof LineItem | Partial<LineItem>, value?: string | number | boolean) => {
        const currentItem = items[index];
        let newItem: LineItem = { ...currentItem };

        if (typeof field === 'object') {
            newItem = { ...newItem, ...field };
        } else {
            newItem = {
                ...newItem,
                [field]: value,
            };
        }

        // Validate Stock if Inventory Item
        if (!newItem.isManual && newItem.inventoryItemId && inventory.length > 0) {
            const invItem = inventory.find(i => i.id === newItem.inventoryItemId);
            if (invItem) {
                if (Number(newItem.quantity) > invItem.quantity) {
                    setError(`Cannot exceed available stock (${invItem.quantity} ${invItem.unit}) for ${invItem.description}`);

                    // Revert to max stock or previous value? 
                    // Let's force it to max stock to be helpful
                    newItem = { ...newItem, quantity: invItem.quantity };
                } else {
                    // Clear error checks if we were previously invalid? 
                    if (error && error.includes('Cannot exceed available stock')) {
                        setError('');
                    }
                }
            }
        }

        const updated = [...items];
        updated[index] = newItem;
        setItems(updated);
    };

    const calculateItemTotal = (item: LineItem) => {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unitPrice) || 0;
        const discountVal = Number(item.discount) || 0;
        const taxRate = Number(item.taxRate) || 0;

        const discountAmount = item.discountType === 'PERCENT'
            ? (quantity * unitPrice * discountVal / 100)
            : discountVal;

        const subtotal = quantity * unitPrice - discountAmount;
        const tax = subtotal * (taxRate / 100);
        return { subtotal, tax, total: subtotal + tax, discountAmount };
    };

    const subtotal = items.reduce((sum, item) => sum + calculateItemTotal(item).subtotal, 0);
    const taxTotal = items.reduce((sum, item) => sum + calculateItemTotal(item).tax, 0);
    const grandTotal = subtotal + taxTotal;

    const formatAmount = (amount: number) => {
        const symbol = getCurrencySymbol(formData.currency);
        return `${symbol}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const handleBarcodeScanForItem = async (barcode: string) => {
        if (scanningItemIndex === null) return;

        try {
            const response = await fetch(`/api/barcode/lookup?barcode=${encodeURIComponent(barcode)}`);
            const data = await response.json();

            if (data.success && data.data) {
                let productData: Partial<LineItem> | null = null;
                let matchId: string | undefined = undefined;

                if (data.data.source === 'inventory') {
                    // Product exists in inventory
                    const invItem = data.data.inventoryItem;
                    matchId = invItem.id;
                    productData = {
                        description: invItem.description,
                        unitPrice: Number(invItem.price),
                        unit: invItem.unit,
                        taxRate: Number(invItem.taxRate),
                        quantity: 1,
                        inventoryItemId: invItem.id,
                        isManual: false
                    };
                } else if (data.data.found && data.data.product) {
                    // External API found product
                    const product = data.data.product;
                    productData = {
                        description: product.name,
                        unitPrice: product.price ? Number(product.price) : 0,
                        unit: product.unit || 'pcs',
                        quantity: 1,
                        isManual: true,
                        inventoryItemId: undefined
                    };
                }

                if (productData) {
                    // Check if product already exists in items
                    const existingIndex = items.findIndex((item, idx) => {
                        if (idx === scanningItemIndex) return false; // Don't match self (the placeholder)

                        // Match by Inventory ID
                        if (matchId && item.inventoryItemId === matchId) return true;

                        // Match by Description (for external items or robust fallback)
                        if (item.description.trim().toLowerCase() === productData!.description?.trim().toLowerCase()) {
                            // Optional: also check price equality to avoid merging if price differs?
                            // For now, let's assume description match is sufficient for scan aggregation intent
                            return true;
                        }
                        return false;
                    });

                    if (existingIndex !== -1) {
                        // Check stock before incrementing
                        const existingItem = items[existingIndex];
                        const newQuantity = Number(existingItem.quantity) + 1;

                        if (!existingItem.isManual && existingItem.inventoryItemId) {
                            const invItem = inventory.find(i => i.id === existingItem.inventoryItemId);
                            if (invItem && newQuantity > invItem.quantity) {
                                setError(`Cannot exceed available stock (${invItem.quantity} ${invItem.unit}) for ${invItem.description}`);
                                setScanningItemIndex(null);
                                return; // Stop here
                            }
                        }

                        // Increment existing item
                        const newItems = [...items];
                        newItems[existingIndex] = {
                            ...existingItem,
                            quantity: newQuantity
                        };

                        // Check if the current scanning placeholder is empty/unused, if so remove it
                        const placeholder = newItems[scanningItemIndex];
                        if (!placeholder.description && !placeholder.unitPrice) {
                            // Remove the placeholder. 
                            // CAUTION: Removing changes indices. 
                            // If scanningItemIndex > existingIndex, strict splice is fine.
                            // If scanningItemIndex < existingIndex, existingIndex would have shifted? No, we accessed it before splice.
                            // But usually usage pattern: Scan -> Add Row (last) -> Scan fills last.
                            // Existing item is usually above.
                            newItems.splice(scanningItemIndex, 1);
                        } else {
                            // If placeholder had some data, maybe we shouldn't delete it?
                            // But user intended to scan INTO this line.
                            // Since we merged into another line, this line is now "abandoned" regarding this scan.
                            // If it was empty, deleting is correct.
                            // If it wasn't empty (user clicked scan on a filled row?), then we probably shouldn't merge?
                            // Actually, if user Scans on a filled row A, and gets Product B (which is already in row C).
                            // We should probably increment C. And what happens to A?
                            // Logic: The scan was successful. The result is aggregated into C. 
                            // Row A remains as it was before the scan?
                            // But the user physically clicked "Scan" on Row A.
                            // If Row A was empty, delete. If not, leave alone.
                        }

                        setItems(newItems);
                        // Maybe show toast: "Added to existing line item"
                    } else {
                        // New item
                        updateItem(scanningItemIndex, productData);
                    }
                } else {
                    // Not found
                    updateItem(scanningItemIndex, { isManual: true });
                    setError(`Product not found for barcode: ${barcode}. Please enter manually.`);
                }
            }
        } catch (err) {
            console.error('Barcode lookup error:', err);
            setError('Failed to lookup barcode.');
        } finally {
            setScanningItemIndex(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const validItems = items.filter(item => item.description.trim() && item.quantity > 0);
            if (validItems.length === 0) {
                throw new Error('At least one valid item is required');
            }

            const response = await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    buyerId: buyerIdFromQuery || undefined,
                    buyerEmail: formData.buyerEmail || undefined,
                    buyerState: formData.buyerState || undefined,
                    buyerTaxId: formData.buyerTaxId || undefined,
                    issueDate: formData.issueDate ? new Date(formData.issueDate) : undefined,
                    dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
                    items: validItems.map(item => {
                        const { discountAmount } = calculateItemTotal(item);
                        return {
                            ...item,
                            unitPrice: Number(item.unitPrice),
                            taxRate: Number(item.taxRate),
                            quantity: Number(item.quantity),
                            discount: discountAmount // Normalize to amount for backend
                        };
                    }),
                    sourceDocumentId: fromUpload || undefined,
                    sellerDetails: (fromUpload && businessSource === 'EXTRACTED') ? sellerDetails : undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create invoice');
            }

            router.push(`/dashboard/invoices/${data.data.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/invoices"
                    className="p-2.5 hover:bg-neutral-100 rounded-xl transition-colors text-neutral-500 hover:text-neutral-900"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Create Invoice</h1>
                    <p className="text-neutral-500 mt-0.5">Fill in the details to generate a new invoice</p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-4 h-4" />
                    </div>
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Business Details (Only for Digitized Invoices) */}
                {fromUpload && (
                    <Card className={`mb-6 ${businessSource === 'EXTRACTED' ? 'border-blue-200 bg-blue-50/30' : ''}`}>
                        <CardHeader
                            title="Business Details Source"
                            description="Choose whether to use extracted details or your profile"
                            action={
                                <select
                                    className="h-9 px-3 text-sm bg-white border border-neutral-200 rounded-lg text-neutral-900 focus:outline-none focus:border-neutral-900 transition-all font-medium"
                                    value={businessSource}
                                    onChange={(e) => setBusinessSource(e.target.value as 'EXTRACTED' | 'PROFILE')}
                                >
                                    <option value="EXTRACTED">Use Extracted Details</option>
                                    <option value="PROFILE">Use My Business Profile</option>
                                </select>
                            }
                        />
                        {businessSource === 'EXTRACTED' ? (
                            <CardBody>
                                {!isEditingExtracted ? (
                                    <div className="bg-blue-50/50 rounded-lg border border-blue-100 p-5">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                    <span className="text-xs font-bold font-mono">ED</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-neutral-900 text-sm">Extracted Details</h4>
                                                    <p className="text-xs text-neutral-500">From uploaded document</p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => setIsEditingExtracted(true)}
                                            >
                                                Edit
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                                            <div>
                                                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Business Name</p>
                                                <p className="font-medium text-neutral-900">{sellerDetails.businessName || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">{getCurrencyTaxIdLabel(formData.currency)}</p>
                                                <p className="font-medium text-neutral-900">{sellerDetails.taxId || '-'}</p>
                                            </div>
                                            <div className="md:col-span-2">
                                                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Address</p>
                                                <p className="text-neutral-700">{sellerDetails.businessAddress || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Email</p>
                                                <p className="text-neutral-700">{sellerDetails.email || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Phone</p>
                                                <p className="text-neutral-700">{sellerDetails.phone || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-5">
                                        <FormRow>
                                            <Input
                                                label="Business Name"
                                                value={sellerDetails.businessName}
                                                onChange={(e) => setSellerDetails({ ...sellerDetails, businessName: e.target.value })}
                                                placeholder="Business Name"
                                            />
                                            <Input
                                                label={getCurrencyTaxIdLabel(formData.currency)}
                                                value={sellerDetails.taxId}
                                                onChange={(e) => setSellerDetails({ ...sellerDetails, taxId: e.target.value })}
                                                placeholder={getCurrencyTaxIdLabel(formData.currency)}
                                            />
                                        </FormRow>
                                        <FormRow>
                                            <Input
                                                label="Address"
                                                value={sellerDetails.businessAddress}
                                                onChange={(e) => setSellerDetails({ ...sellerDetails, businessAddress: e.target.value })}
                                                placeholder="Business Address"
                                            />
                                            <Input
                                                label="Phone"
                                                value={sellerDetails.phone}
                                                onChange={(e) => setSellerDetails({ ...sellerDetails, phone: e.target.value })}
                                                placeholder="Phone"
                                            />
                                            <Input
                                                label="Email"
                                                value={sellerDetails.email}
                                                onChange={(e) => setSellerDetails({ ...sellerDetails, email: e.target.value })}
                                                placeholder="Email"
                                            />
                                        </FormRow>
                                        <div className="flex justify-end">
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={() => setIsEditingExtracted(false)}
                                            >
                                                Done
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardBody>
                        ) : (
                            <CardBody>
                                <div className="bg-neutral-50 rounded-lg border border-neutral-100 p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center">
                                            <span className="text-xs font-bold font-mono">BP</span>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-neutral-900 text-sm">Your Business Profile</h4>
                                            <p className="text-xs text-neutral-500">Currently active settings</p>
                                        </div>
                                    </div>

                                    {profileDetails ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                                            <div>
                                                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Business Name</p>
                                                <p className="font-medium text-neutral-900">{profileDetails.businessName || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">{getCurrencyTaxIdLabel(formData.currency)}</p>
                                                <p className="font-medium text-neutral-900">{profileDetails.taxId || '-'}</p>
                                            </div>
                                            <div className="md:col-span-2">
                                                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Address</p>
                                                <p className="text-neutral-700">{profileDetails.businessAddress || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Email</p>
                                                <p className="text-neutral-700">{profileDetails.email || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Phone</p>
                                                <p className="text-neutral-700">{profileDetails.phone || '-'}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-neutral-500 italic">Loading profile details...</div>
                                    )}
                                </div>
                            </CardBody>
                        )}
                    </Card>
                )}

                {/* Buyer Details */}
                <Card className="mb-6">
                    <CardHeader
                        title="Buyer Details"
                        description="Who is this invoice for?"
                    />
                    <CardBody className="space-y-5">
                        {/* Customer Search */}
                        <div className="relative mb-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Search existing customer (name, email or phone)..."
                                    value={customerSearch}
                                    onChange={async (e) => {
                                        const query = e.target.value;
                                        setCustomerSearch(query);
                                        if (query.length >= 2) {
                                            setSearchingCustomers(true);
                                            try {
                                                const res = await fetch(`/api/buyers/search?q=${encodeURIComponent(query)}`);
                                                const data = await res.json();
                                                if (data.success) {
                                                    setCustomerResults(data.data);
                                                    setShowCustomerDropdown(true);
                                                }
                                            } catch (err) {
                                                console.error('Search error:', err);
                                            } finally {
                                                setSearchingCustomers(false);
                                            }
                                        } else {
                                            setCustomerResults([]);
                                            setShowCustomerDropdown(false);
                                        }
                                    }}
                                    className="w-full h-10 pl-10 pr-3 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:border-neutral-400 bg-neutral-50/50 focus:bg-white transition-colors"
                                />
                                {searchingCustomers && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <div className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                            {showCustomerDropdown && customerResults.length > 0 && (
                                <div className="absolute left-0 right-0 top-full mt-1 bg-white/95 backdrop-blur-xl border border-neutral-200 rounded-xl shadow-2xl z-20 max-h-60 overflow-auto">
                                    {customerResults.map((customer) => (
                                        <button
                                            key={customer.id}
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    buyerName: customer.name,
                                                    buyerEmail: customer.email || '',
                                                    buyerPhone: customer.phone || '',
                                                    buyerAddress: customer.address || '',
                                                    buyerState: customer.state || '',
                                                    buyerTaxId: customer.taxId || '',
                                                }));
                                                setCustomerSearch('');
                                                setShowCustomerDropdown(false);
                                            }}
                                            className="w-full px-4 py-3 text-left hover:bg-neutral-50 border-b border-neutral-100 last:border-0 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                                                    <UserCheck className="w-4 h-4 text-green-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-sm text-neutral-900 truncate">{customer.name}</p>
                                                    <p className="text-xs text-neutral-500 truncate">
                                                        {customer.email || customer.phone || 'No contact info'}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="relative py-2 flex justify-center">
                            <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider">or enter details manually</span>
                        </div>
                        <FormRow>
                            <Input
                                label="Buyer Name"
                                name="buyerName"
                                placeholder="John Doe or Company Name"
                                value={formData.buyerName}
                                onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                                required
                            />
                            <Input
                                label="Email (optional)"
                                type="email"
                                name="buyerEmail"
                                placeholder="buyer@example.com"
                                value={formData.buyerEmail}
                                onChange={(e) => setFormData({ ...formData, buyerEmail: e.target.value })}
                            />
                        </FormRow>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <Input
                                label="Phone (optional)"
                                name="buyerPhone"
                                placeholder="+91 98765 43210"
                                value={formData.buyerPhone}
                                onChange={(e) => setFormData({ ...formData, buyerPhone: e.target.value })}
                            />
                            {formData.currency === 'INR' ? (
                                <Select
                                    label="State"
                                    name="buyerState"
                                    value={formData.buyerState}
                                    onChange={(e) => setFormData({ ...formData, buyerState: e.target.value })}
                                    className="appearance-none"
                                >
                                    <option value="">Select State</option>
                                    {INDIAN_STATES.map((state) => (
                                        <option key={state} value={state}>
                                            {state}
                                        </option>
                                    ))}
                                </Select>
                            ) : (
                                <Input
                                    label="State / Province"
                                    name="buyerState"
                                    placeholder="Enter state or province"
                                    value={formData.buyerState}
                                    onChange={(e) => setFormData({ ...formData, buyerState: e.target.value })}
                                />
                            )}
                            <Input
                                label="GSTIN / Tax ID"
                                name="buyerTaxId"
                                placeholder="GSTIN"
                                value={formData.buyerTaxId}
                                onChange={(e) => setFormData({ ...formData, buyerTaxId: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-5">
                            <Input
                                label="Address (optional)"
                                name="buyerAddress"
                                placeholder="123 Main St, City, State"
                                value={formData.buyerAddress}
                                onChange={(e) => setFormData({ ...formData, buyerAddress: e.target.value })}
                            />
                        </div>
                    </CardBody>
                </Card>

                {/* Invoice Details */}
                <Card className="mb-6">
                    <CardHeader title="Invoice Details" description="Date and currency settings" />
                    <CardBody>
                        <FormRow cols={3}>
                            <Input
                                label="Issue Date"
                                type="date"
                                name="issueDate"
                                value={formData.issueDate}
                                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                                required
                            />
                            <Input
                                label="Due Date (optional)"
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            />
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-neutral-700">Currency</label>
                                <select
                                    className="w-full h-11 px-3.5 text-sm bg-white border border-neutral-200 rounded-lg text-neutral-900 transition-all duration-200 hover:border-neutral-300 focus:outline-none focus:border-neutral-900 focus:ring-[3px] focus:ring-neutral-900/5"
                                    value={formData.currency}
                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                >
                                    {CURRENCIES.map((c) => (
                                        <option key={c.code} value={c.code}>
                                            {c.code} ({c.symbol}) - {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-neutral-700">Status</label>
                                <select
                                    className="w-full h-11 px-3.5 text-sm bg-white border border-neutral-200 rounded-lg text-neutral-900 transition-all duration-200 hover:border-neutral-300 focus:outline-none focus:border-neutral-900 focus:ring-[3px] focus:ring-neutral-900/5"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                >
                                    <option value="DRAFT">Draft</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="PAID">Paid</option>
                                </select>
                            </div>
                        </FormRow>
                    </CardBody>
                </Card>

                {/* Line Items */}
                <Card className="mb-6 overflow-visible">
                    <CardHeader
                        title="Line Items"
                        description="Add products or services"
                        action={
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                        // Check if last item is empty and reuse it
                                        const lastIndex = items.length - 1;
                                        const lastItem = items[lastIndex];
                                        const isEmpty = items.length > 0 && (!lastItem.description || lastItem.description === '') && Number(lastItem.unitPrice) === 0;

                                        if (isEmpty) {
                                            setScanningItemIndex(lastIndex);
                                            setScannerOpen(true);
                                        } else {
                                            // Add a new item and open scanner for it
                                            const newIndex = items.length;
                                            addItem();
                                            setTimeout(() => {
                                                setScanningItemIndex(newIndex);
                                                setScannerOpen(true);
                                            }, 100);
                                        }
                                    }}
                                    className="border-2 border-neutral-400 hover:border-neutral-600 shadow-sm"
                                >
                                    <ScanBarcode className="w-4 h-4" />
                                    <span className="hidden sm:inline">Scan Barcode</span>
                                    <span className="sm:hidden">Scan</span>
                                </Button>
                                <Button type="button" variant="secondary" size="sm" onClick={addItem}>
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden sm:inline">Add Item</span>
                                    <span className="sm:hidden">Add</span>
                                </Button>
                            </div>
                        }
                    />
                    <CardBody className="p-0">
                        <div className="divide-y divide-neutral-100">
                            {items.map((item, index) => (
                                <div key={index} className="group p-4 md:p-6 hover:bg-neutral-50/50 transition-colors relative">
                                    {/* Mobile Header: Item Label & Delete Button */}
                                    <div className="flex md:hidden justify-between items-center mb-3 pb-3 border-b border-neutral-100">
                                        <span className="text-[10px] font-bold text-neutral-400 tracking-wider">ITEM {index + 1}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-12 gap-x-3 gap-y-4">
                                            {/* Description - Full width */}
                                            <div className="col-span-12 md:col-span-4">
                                                <label className="block text-xs font-medium text-neutral-500 mb-1.5 flex justify-between">
                                                    <span>Item Description</span>
                                                    {inventory.length > 0 && item.isManual && (
                                                        <button
                                                            type="button"
                                                            onClick={() => updateItem(index, 'isManual', false)}
                                                            className="text-primary hover:underline text-[10px]"
                                                        >
                                                            Select from Inventory
                                                        </button>
                                                    )}
                                                </label>

                                                {!item.isManual && inventory.length > 0 ? (
                                                    <InventorySelector
                                                        inventory={inventory}
                                                        value={inventory.find(inv => inv.description === item.description && Number(inv.price) === item.unitPrice)?.id || ''}
                                                        currencySymbol={getCurrencySymbol(formData.currency)}
                                                        onChange={(product) => {
                                                            updateItem(index, {
                                                                description: product.description,
                                                                unitPrice: Number(product.price),
                                                                unit: product.unit,
                                                                taxRate: Number(product.taxRate),
                                                                quantity: 1,
                                                                inventoryItemId: product.id
                                                            });
                                                        }}
                                                        onManualSelect={() => {
                                                            updateItem(index, { isManual: true, description: '', inventoryItemId: undefined });
                                                        }}
                                                    />
                                                ) : (
                                                    <Input
                                                        name={`item-${index}-desc`}
                                                        placeholder="Item description"
                                                        value={item.description}
                                                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                        required
                                                    />
                                                )}
                                            </div>

                                            {/* Quantity */}
                                            <div className="col-span-6 md:col-span-2">
                                                <label className="block text-xs font-medium text-neutral-500 mb-1.5 ">Quantity</label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    step="1"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                                    required
                                                    className="text-center"
                                                />
                                            </div>

                                            {/* Unit */}
                                            <div className="col-span-6 md:col-span-1">
                                                <label className="block text-xs font-medium text-neutral-500 mb-1.5 ">Unit</label>
                                                <Input
                                                    placeholder="pcs"
                                                    value={item.unit}
                                                    onChange={(e) => updateItem(index, 'unit', e.target.value)}
                                                    className="text-center"
                                                />
                                            </div>

                                            {/* Price */}
                                            <div className="col-span-6 md:col-span-2">
                                                <label className="block text-xs font-medium text-neutral-500 mb-1.5 ">Unit Price</label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.unitPrice}
                                                    onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                                                    required
                                                    className="text-right"
                                                />
                                            </div>

                                            {/* Tax */}
                                            <div className="col-span-6 md:col-span-1">
                                                <label className="block text-xs font-medium text-neutral-500 mb-1.5 ">{getCurrencyTaxName(formData.currency)} (%)</label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                    value={item.taxRate}
                                                    onChange={(e) => updateItem(index, 'taxRate', e.target.value)}
                                                    className="text-center"
                                                />
                                            </div>

                                            {/* Discount */}
                                            <div className="col-span-6 md:col-span-2">
                                                <label className="block text-xs font-medium text-neutral-500 mb-1.5 ">Discount</label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={item.discount}
                                                        onChange={(e) => updateItem(index, 'discount', e.target.value)}
                                                        className="text-right flex-1"
                                                    />
                                                    <select
                                                        className="h-11 px-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 transition-all font-medium w-12 md:w-20"
                                                        value={item.discountType}
                                                        onChange={(e) => updateItem(index, 'discountType', e.target.value as any)}
                                                    >
                                                        <option value="AMOUNT">{getCurrencySymbol(formData.currency)}</option>
                                                        <option value="PERCENT">%</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Amount */}
                                            <div className="col-span-6 md:col-span-2 col-start-7 md:col-start-11 flex items-end justify-end">
                                                <div className="w-full bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-xl px-4 py-3 text-right shadow-sm">
                                                    <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-0.5">Line Total</p>
                                                    <p className="text-lg font-bold text-white tabular-nums">
                                                        {formatAmount(calculateItemTotal(item).total)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Desktop Remove Button */}
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="hidden md:block absolute top-4 right-4 p-2 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        title="Remove Item"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                    <CardFooter>
                        {/* Totals Section */}
                        <div className="flex justify-end">
                            <div className="w-72 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-600">Subtotal</span>
                                    <span className="font-medium text-neutral-900 tabular-nums">
                                        {formatAmount(subtotal)}
                                    </span>
                                </div>
                                {formData.currency === 'INR' ? (
                                    (() => {
                                        const sellerState = profileDetails?.state;
                                        const buyerState = formData.buyerState;
                                        // If either state is missing, default to Intra-state (safe assumption or user preference?)
                                        // Actually, if missing, usually assume local for simplicity, or maybe we shouldn't show breakdown? 
                                        // Let's stick to: if matches or missing => Intra (CGST+SGST), else Inter (IGST)
                                        // Only show split if taxTotal > 0 to avoid clutter
                                        const isIntraState = !sellerState || !buyerState || (sellerState.toLowerCase() === buyerState.toLowerCase());

                                        return isIntraState ? (
                                            <>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-neutral-600">CGST</span>
                                                    <span className="font-medium text-neutral-900 tabular-nums">
                                                        {formatAmount(taxTotal / 2)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-neutral-600">SGST</span>
                                                    <span className="font-medium text-neutral-900 tabular-nums">
                                                        {formatAmount(taxTotal / 2)}
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-600">IGST</span>
                                                <span className="font-medium text-neutral-900 tabular-nums">
                                                    {formatAmount(taxTotal)}
                                                </span>
                                            </div>
                                        );
                                    })()
                                ) : (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-600">{getCurrencyTaxName(formData.currency)}</span>
                                        <span className="font-medium text-neutral-900 tabular-nums">
                                            {formatAmount(taxTotal)}
                                        </span>
                                    </div>
                                )}
                                <div className="h-px bg-neutral-200" />
                                <div className="flex justify-between">
                                    <span className="text-base font-semibold text-neutral-900">Total</span>
                                    <span className="text-xl font-bold text-neutral-900 tabular-nums">
                                        {formatAmount(grandTotal)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardFooter>
                </Card>

                {/* Notes & Terms */}
                <Card className="mb-6">
                    <CardHeader title="Additional Information" description="Notes and terms for the invoice" />
                    <CardBody className="space-y-5">
                        <Textarea
                            label="Notes (optional)"
                            name="notes"
                            placeholder="Thank you for your business!"
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                        <Textarea
                            label="Terms & Conditions"
                            name="terms"
                            rows={3}
                            value={formData.terms}
                            onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                        />
                    </CardBody>
                </Card>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
                    <Link
                        href="/dashboard/invoices"
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-neutral-900 rounded-xl bg-white hover:bg-neutral-50 transition-colors"
                    >
                        Cancel
                    </Link>
                    <Button type="submit" loading={loading}>
                        Create Invoice
                    </Button>
                </div>
            </form>

            {/* Barcode Scanner Modal */}
            <BarcodeScanner
                isOpen={scannerOpen}
                onClose={() => {
                    setScannerOpen(false);
                    setScanningItemIndex(null);
                }}
                onScan={handleBarcodeScanForItem}
                title="Scan Product Barcode"
            />
        </div>
    );
}
