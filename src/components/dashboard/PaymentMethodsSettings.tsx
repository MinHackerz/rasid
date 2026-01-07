'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button, Input, Modal, ImageUpload, Select, Badge, EmptyState, Spinner } from '@/components/ui';
import { Plus, Trash2, CheckCircle2, Circle, CreditCard, Banknote, QrCode, Smartphone, Edit2, AlertCircle } from 'lucide-react';

interface PaymentMethod {
    id: string;
    type: 'BANK_TRANSFER' | 'UPI' | 'PAYPAL' | 'QR_CODE';
    details: any;
    isEnabled: boolean;
}

export function PaymentMethodsSettings() {
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState<{
        type: string;
        details: any;
        isEnabled: boolean;
    }>({
        type: 'BANK_TRANSFER',
        details: {},
        isEnabled: false
    });

    useEffect(() => {
        fetchMethods();
    }, []);

    const fetchMethods = async () => {
        try {
            const res = await fetch('/api/payment-methods');
            const data = await res.json();
            console.log('Fetched Payment Methods:', data);
            if (data.success) {
                setMethods(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch payment methods:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch('/api/payment-methods', {
                method: 'POST', // We only support adding new ones for simplicity in this flow, deletion handles removal. Editing could be added.
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (data.success) {
                setIsModalOpen(false);
                setFormData({ type: 'BANK_TRANSFER', details: {}, isEnabled: false });
                fetchMethods(); // Refresh
            }
        } catch (error) {
            console.error('Failed to save:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this payment method?')) return;
        try {
            await fetch(`/api/payment-methods/${id}`, { method: 'DELETE' });
            fetchMethods();
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    const toggleEnabled = async (method: PaymentMethod) => {
        if (method.isEnabled) return; // Already enabled
        try {
            // Optimistic update
            setMethods(methods.map(m => ({ ...m, isEnabled: m.id === method.id })));

            await fetch(`/api/payment-methods/${method.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isEnabled: true }),
            });
            fetchMethods(); // Sync to be sure
        } catch (error) {
            console.error('Failed to toggle:', error);
            fetchMethods(); // Revert on error
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'BANK_TRANSFER': return <Banknote className="w-5 h-5" />;
            case 'UPI': return <Smartphone className="w-5 h-5" />;
            case 'PAYPAL': return <CreditCard className="w-5 h-5" />;
            case 'QR_CODE': return <QrCode className="w-5 h-5" />;
            default: return <CreditCard className="w-5 h-5" />;
        }
    };

    const getLabel = (type: string) => {
        switch (type) {
            case 'BANK_TRANSFER': return 'Bank Transfer';
            case 'UPI': return 'UPI';
            case 'PAYPAL': return 'PayPal';
            case 'QR_CODE': return 'QR Code';
            default: return type;
        }
    };

    return (
        <Card>
            <CardHeader
                title="Payment Methods"
                description="Manage payment options displayed on your invoices."
                action={
                    <Button size="sm" onClick={() => setIsModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Method
                    </Button>
                }
            />
            <CardBody className="space-y-4">
                {loading ? (
                    <div className="flex justify-center py-8"><Spinner /></div>
                ) : methods.length === 0 ? (
                    <EmptyState
                        title="No Payment Methods"
                        description="Add a payment method to allow customers to pay you easily."
                        icon={<CreditCard className="w-8 h-8" />}
                        action={
                            <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                                Add First Method
                            </Button>
                        }
                    />
                ) : (
                    <div className="grid gap-4">
                        {methods.map((method) => (
                            <div
                                key={method.id}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${method.isEnabled
                                    ? 'border-neutral-900 bg-neutral-900/5 ring-1 ring-neutral-900/10'
                                    : 'border-neutral-200 bg-white hover:border-neutral-300'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => toggleEnabled(method)}
                                        className={`flex-shrink-0 transition-colors ${method.isEnabled ? 'text-neutral-900' : 'text-neutral-300 hover:text-neutral-500'
                                            }`}
                                    >
                                        {method.isEnabled ? (
                                            <CheckCircle2 className="w-6 h-6 fill-neutral-900 text-white" />
                                        ) : (
                                            <Circle className="w-6 h-6" />
                                        )}
                                    </button>

                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${method.isEnabled ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500'
                                        }`}>
                                        {getIcon(method.type)}
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-neutral-900">{getLabel(method.type)}</h4>
                                            {method.isEnabled && <Badge variant="default" className="bg-neutral-900 text-white border-none py-0.5 px-2 text-[10px]">Active</Badge>}
                                        </div>
                                        <p className="text-sm text-neutral-500 line-clamp-1 mt-0.5">
                                            {method.type === 'BANK_TRANSFER' ? `${method.details.bankName} • ${method.details.accountNumber}` :
                                                method.type === 'UPI' ? method.details.upiId :
                                                    method.type === 'PAYPAL' ? method.details.email :
                                                        'Scan to Pay'}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDelete(method.id)}
                                    className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">How Payment Methods Work</p>
                            <p className="leading-relaxed opacity-90">
                                Adding a payment method is optional. If you enable one, it will be automatically included in emails and WhatsApp messages when you mark an invoice as <strong>Pending</strong>. This helps you get paid faster!
                            </p>
                        </div>
                    </div>
                </div>
            </CardBody>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Payment Method">
                <form onSubmit={handleSave} className="space-y-4 md:space-y-6 max-h-[70vh] overflow-y-auto pr-2 no-scrollbar">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Payment Type</label>
                        <div className="grid grid-cols-2 gap-2 md:grid-cols-2 md:gap-3">
                            {[
                                { id: 'BANK_TRANSFER', label: 'Bank', icon: Banknote },
                                { id: 'UPI', label: 'UPI', icon: Smartphone },
                                { id: 'QR_CODE', label: 'QR', icon: QrCode },
                                { id: 'PAYPAL', label: 'PayPal', icon: CreditCard },
                            ].map(t => (
                                <button
                                    type="button"
                                    key={t.id}
                                    onClick={() => setFormData({ ...formData, type: t.id, details: {} })}
                                    className={`flex flex-col md:flex-row items-center justify-center md:justify-start gap-1.5 md:gap-2 p-2.5 md:p-3 rounded-xl border text-xs md:text-sm font-medium transition-all ${formData.type === t.id
                                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-md'
                                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
                                        }`}
                                >
                                    <t.icon className="w-4 h-4" />
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {formData.type === 'BANK_TRANSFER' && (
                            <>
                                <Input
                                    label="Account Holder Name"
                                    required
                                    value={formData.details.accountName || ''}
                                    onChange={e => setFormData({ ...formData, details: { ...formData.details, accountName: e.target.value } })}
                                />
                                <Input
                                    label="Bank Name"
                                    required
                                    value={formData.details.bankName || ''}
                                    onChange={e => setFormData({ ...formData, details: { ...formData.details, bankName: e.target.value } })}
                                />
                                <Input
                                    label="Account Number"
                                    required
                                    value={formData.details.accountNumber || ''}
                                    onChange={e => setFormData({ ...formData, details: { ...formData.details, accountNumber: e.target.value } })}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="IFSC Code"
                                        placeholder="Optional"
                                        value={formData.details.ifsc || ''}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, ifsc: e.target.value } })}
                                    />
                                    <Input
                                        label="SWIFT / IBAN"
                                        placeholder="Optional"
                                        value={formData.details.swift || ''}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, swift: e.target.value } })}
                                    />
                                </div>
                            </>
                        )}

                        {formData.type === 'UPI' && (
                            <Input
                                label="UPI ID / VPA"
                                placeholder="username@upi"
                                required
                                value={formData.details.upiId || ''}
                                onChange={e => setFormData({ ...formData, details: { ...formData.details, upiId: e.target.value } })}
                            />
                        )}

                        {formData.type === 'PAYPAL' && (
                            <Input
                                label="PayPal Email / Link"
                                type="email"
                                required
                                value={formData.details.email || ''}
                                onChange={e => setFormData({ ...formData, details: { ...formData.details, email: e.target.value } })}
                            />
                        )}

                        {formData.type === 'QR_CODE' && (
                            <ImageUpload
                                label="Upload QR Code Image"
                                value={formData.details.qrCode || null}
                                onChange={(base64) => setFormData({ ...formData, details: { ...formData.details, qrCode: base64 } })}
                                onRemove={() => setFormData({ ...formData, details: { ...formData.details, qrCode: null } })}
                            />
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" loading={saving}>Save Method</Button>
                    </div>
                </form>
            </Modal>
        </Card>
    );
}
