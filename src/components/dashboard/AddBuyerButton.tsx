'use client';

import { useState } from 'react';
import { Button, Modal, Input, Select, Textarea } from '@/components/ui';
import { Plus } from 'lucide-react';
import { addBuyer } from '@/app/actions/buyers';
import { INDIAN_STATES } from '@/lib/constants/indian-states';

export function AddBuyerButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        state: '',
        taxId: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await addBuyer(formData);
        setLoading(false);
        if (res.success) {
            setIsOpen(false);
            setFormData({ name: '', email: '', phone: '', address: '', state: '', taxId: '' });
        } else {
            alert(res.error);
        }
    };

    return (
        <>
            <Button onClick={() => setIsOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Buyer
            </Button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add New Buyer">
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
                    <Input
                        label="Buyer Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="e.g. Acme Corp"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Email Address"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="name@company.com"
                        />
                        <Input
                            label="Phone Number"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+91 98765 43210"
                        />
                    </div>
                    <Textarea
                        label="Address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        rows={2}
                        placeholder="Street address"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="State"
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        >
                            <option value="">Select State</option>
                            {INDIAN_STATES.map((state) => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </Select>
                        <Input
                            label="Tax ID / GSTIN"
                            value={formData.taxId}
                            onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                            placeholder="GSTIN"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button type="submit" loading={loading}>Add Buyer</Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
