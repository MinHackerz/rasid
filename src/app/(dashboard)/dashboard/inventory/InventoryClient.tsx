
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Textarea, Card, CardBody, Badge, EmptyState, Modal, FormRow } from '@/components/ui';
import { Plus, Package, Search, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { getCurrencySymbol, getCurrencyTaxName } from '@/lib/currencies';
// import { InventoryItem } from '@prisma/client'; 

interface InventoryItem {
    id: string;
    sellerId: string;
    description: string; // Was name
    note: string | null; // Was description
    sku: string | null;
    hsnCode: string | null;
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

    // Fetch default currency from profile/preferences
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
                description: item.description, // description -> name (in form)
                note: item.note || '', // note -> description (in form)
                sku: item.sku || '',
                hsnCode: item.hsnCode || '',
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
                price: '',
                quantity: '0',
                unit: 'pcs',
                taxRate: '0'
            });
        }
        setError('');
        setIsModalOpen(true);
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

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            const response = await fetch(`/api/inventory/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete item');
            }

            setItems(items.filter(i => i.id !== id));
            router.refresh();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'An error occurred');
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
                <Button onClick={() => openModal()}>
                    <Plus className="w-4 h-4" />
                    Add Product
                </Button>
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
                <form onSubmit={handleSave} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <Input
                        label="Item Description / Name"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                        placeholder="e.g. Wireless Mouse"
                    />

                    <Textarea
                        label="Internal Note / Details"
                        value={formData.note}
                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                        placeholder="Extra details..."
                        rows={2}
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
                            label="Stock Quantity"
                            type="number"
                            min="0"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        />
                        <Input
                            label="Unit"
                            value={formData.unit}
                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                            placeholder="e.g. pcs, kg"
                        />
                    </FormRow>

                    <FormRow>
                        <Input
                            label="SKU (Optional)"
                            value={formData.sku}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        />
                        <Input
                            label="HSN Code (Optional)"
                            value={formData.hsnCode}
                            onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                        />
                    </FormRow>

                    <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={loading}>
                            {editingItem ? 'Save Changes' : 'Add Product'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
