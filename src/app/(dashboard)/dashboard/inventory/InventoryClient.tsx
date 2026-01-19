
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Textarea, Card, CardBody, Badge, EmptyState, Modal, FormRow, BarcodeScanner } from '@/components/ui';
import { Plus, Package, Search, Pencil, Trash2, AlertCircle, ScanBarcode, Loader2 } from 'lucide-react';
import { getCurrencySymbol, getCurrencyTaxName } from '@/lib/currencies';
// import { InventoryItem } from '@prisma/client'; 

interface InventoryItem {
    id: string;
    sellerId: string;
    description: string; // Was name
    note: string | null; // Was description
    sku: string | null;
    hsnCode: string | null;
    barcode: string | null; // Scanned barcode
    quantity: number;
    unit: string;
    price: any; // Decimal
    taxRate: any; // Decimal
    createdAt: Date;
    updatedAt: Date;
}

interface InventoryClientProps {
    initialData: InventoryItem[];
}

export default function InventoryClient({ initialData }: InventoryClientProps) {
    const router = useRouter();
    const [items, setItems] = useState<InventoryItem[]>(initialData);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currency, setCurrency] = useState('INR'); // Default currency
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [scanLoading, setScanLoading] = useState(false);

    // Fetch default currency from profile/preferences
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/profile')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data?.invoiceDefaults?.currency) {
                    setCurrency(data.data.invoiceDefaults.currency);
                }
            })
            .catch(console.error);
    }, []);

    // Form State
    const [formData, setFormData] = useState({
        description: '', // Was name
        note: '', // Was description
        sku: '',
        hsnCode: '',
        barcode: '',
        price: '',
        quantity: '',
        unit: 'pcs',
        taxRate: ''
    });

    const filteredItems = items.filter(item =>
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) || // name -> description
        item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openModal = (item?: InventoryItem) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                description: item.description,
                note: item.note || '',
                sku: item.sku || '',
                hsnCode: item.hsnCode || '',
                barcode: item.barcode || '',
                price: item.price.toString(),
                quantity: item.quantity.toString(),
                unit: item.unit,
                taxRate: item.taxRate.toString()
            });
        } else {
            setEditingItem(null);
            setFormData({
                description: '',
                note: '',
                sku: '',
                hsnCode: '',
                barcode: '',
                price: '',
                quantity: '0',
                unit: 'pcs',
                taxRate: '0'
            });
        }
        setError('');
        setIsModalOpen(true);
    };

    const handleBarcodeScan = async (barcode: string) => {
        setScanLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/barcode/lookup?barcode=${encodeURIComponent(barcode)}`);
            const data = await response.json();

            if (data.success && data.data) {
                if (data.data.source === 'inventory') {
                    // Product already exists in inventory - Open validation/edit modal
                    const existingItem = items.find(item => item.id === data.data.inventoryItem.id);

                    if (existingItem) {
                        setEditingItem(existingItem);
                        setFormData({
                            description: existingItem.description,
                            note: existingItem.note || '',
                            sku: existingItem.sku || '',
                            hsnCode: existingItem.hsnCode || '',
                            barcode: existingItem.barcode || '',
                            price: existingItem.price.toString(),
                            quantity: existingItem.quantity.toString(),
                            unit: existingItem.unit,
                            taxRate: existingItem.taxRate.toString()
                        });
                        setIsModalOpen(true);
                    } else {
                        // If for some reason not in local state, show error or fetch?
                        // For now fallback to error to be safe, or just use API data
                        setError(`Product exists but not found in local list. Please refresh.`);
                    }
                } else if (data.data.found && data.data.product) {
                    // External API found product - pre-fill form
                    const product = data.data.product;
                    setFormData({
                        description: product.name || '',
                        note: product.description || (product.brand ? `Brand: ${product.brand}` : ''),
                        sku: '',
                        hsnCode: '',
                        barcode: barcode,
                        price: '',
                        quantity: '0',
                        unit: product.quantity?.includes('kg') ? 'kg' : 'pcs',
                        taxRate: '0'
                    });
                    setIsModalOpen(true);
                } else {
                    // Product not found - open modal with barcode pre-filled
                    setFormData({
                        description: '',
                        note: '',
                        sku: '',
                        hsnCode: '',
                        barcode: barcode,
                        price: '',
                        quantity: '0',
                        unit: 'pcs',
                        taxRate: '0'
                    });
                    setIsModalOpen(true);
                }
            }
        } catch (err) {
            console.error('Barcode lookup error:', err);
            setError('Failed to lookup barcode. Please enter details manually.');
            setFormData(prev => ({ ...prev, barcode }));
            setIsModalOpen(true);
        } finally {
            setScanLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const url = editingItem ? `/api/inventory/${editingItem.id}` : '/api/inventory';
            const method = editingItem ? 'PUT' : 'POST';

            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                quantity: parseInt(formData.quantity) || 0,
                taxRate: parseFloat(formData.taxRate) || 0,
            };

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to save item');
            }

            if (editingItem) {
                setItems(items.map(i => i.id === editingItem.id ? data.data : i));
            } else {
                setItems([data.data, ...items]);
            }

            setIsModalOpen(false);
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            const response = await fetch(`/api/inventory/${deleteId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete item');
            }

            setItems(items.filter(i => i.id !== deleteId));
            router.refresh();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 w-5 h-5 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full h-10 pl-10 pr-4 rounded-xl border border-neutral-200 focus:outline-none focus:border-neutral-900 transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                        variant="secondary"
                        onClick={() => setIsScannerOpen(true)}
                        disabled={scanLoading}
                        className="flex-1 sm:flex-none border-2 border-neutral-400 hover:border-neutral-600 shadow-sm"
                    >
                        {scanLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanBarcode className="w-4 h-4" />}
                        <span className="hidden sm:inline">Scan Barcode</span>
                        <span className="sm:hidden">Scan</span>
                    </Button>
                    <Button onClick={() => openModal()} className="flex-1 sm:flex-none">
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Add Product</span>
                        <span className="sm:hidden">Add</span>
                    </Button>
                </div>
            </div>

            {/* List */}
            {items.length === 0 ? (
                <Card>
                    <CardBody>
                        <EmptyState
                            icon={<Package className="w-12 h-12" />}
                            title="No products yet"
                            description="Add products to your inventory to speed up invoicing"
                            action={
                                <Button onClick={() => openModal()}>
                                    <Plus className="w-4 h-4" />
                                    Add Product
                                </Button>
                            }
                        />
                    </CardBody>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredItems.map((item) => (
                        <Card key={item.id} className="group hover:border-neutral-300 transition-colors">
                            <CardBody className="flex items-center justify-between p-4 md:p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-500">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <div>
                                        {/* item.name became item.description */}
                                        <h3 className="font-semibold text-neutral-900">{item.description}</h3>
                                        {/* item.description became item.note */}
                                        {item.note && (
                                            <p className="text-sm text-neutral-500 line-clamp-1">{item.note}</p>
                                        )}
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {item.sku && <Badge variant="draft" className="text-xs">SKU: {item.sku}</Badge>}
                                            <Badge variant={item.quantity > 0 ? 'success' : 'error'} className="text-xs">
                                                {item.quantity} {item.unit} in stock
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden md:block">
                                        <p className="font-bold text-neutral-900">
                                            {getCurrencySymbol(currency)}{Number(item.price).toLocaleString()}
                                        </p>
                                        {Number(item.taxRate) > 0 && (
                                            <p className="text-xs text-neutral-500">+{Number(item.taxRate)}% Tax</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => openModal(item)}
                                            className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? 'Edit Product' : 'Add New Product'}
            >
                <form onSubmit={handleSave} className="space-y-3">
                    {error && (
                        <div className="p-2 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span className="text-xs">{error}</span>
                        </div>
                    )}

                    <Input
                        label="Item Description / Name"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                        placeholder="e.g. Wireless Mouse"
                    />

                    <FormRow>
                        <Input
                            label="Price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                        />
                        <Input
                            label={`${getCurrencyTaxName(currency)} (%)`}
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={formData.taxRate}
                            onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                        />
                    </FormRow>

                    <FormRow>
                        <Input
                            label="Stock Qty"
                            type="number"
                            min="0"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        />
                        <Input
                            label="Unit"
                            value={formData.unit}
                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                            placeholder="pcs, kg"
                        />
                        <Input
                            label="Barcode"
                            value={formData.barcode}
                            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                            placeholder="EAN/UPC"
                        />
                    </FormRow>

                    <FormRow>
                        <Input
                            label="SKU"
                            value={formData.sku}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            placeholder="Optional"
                        />
                        <Input
                            label="HSN Code"
                            value={formData.hsnCode}
                            onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                            placeholder="Optional"
                        />
                    </FormRow>

                    <Input
                        label="Note (Optional)"
                        value={formData.note}
                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                        placeholder="Internal details..."
                    />

                    <div className="flex justify-end gap-3 pt-3 border-t border-neutral-100">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={loading}>
                            {editingItem ? 'Save Changes' : 'Add Product'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                title="Confirm Deletion"
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-sm text-neutral-600">
                        Are you sure you want to delete this item? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="secondary" onClick={() => setDeleteId(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Barcode Scanner Modal */}
            <BarcodeScanner
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScan={handleBarcodeScan}
                title="Scan Product Barcode"
            />
        </div>
    );
}
