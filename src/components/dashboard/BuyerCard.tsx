'use client';

import { useState } from 'react';
import { Card, CardBody, Badge, Modal, Input, Button, Select, Textarea } from '@/components/ui';
import { Mail, Phone, MapPin, FileText, Edit2, Plus } from 'lucide-react';
import Link from 'next/link';
import { updateBuyer } from '@/app/actions/buyers';
import { INDIAN_STATES } from '@/lib/constants/indian-states';

interface BuyerCardProps {
    buyer: any;
    variant?: 'grid' | 'list';
}

export function BuyerCard({ buyer, variant = 'grid' }: BuyerCardProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: buyer.name,
        email: buyer.email || '',
        phone: buyer.phone || '',
        address: buyer.address || '',
        state: buyer.state || '',
        taxId: buyer.taxId || '',
    });

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await updateBuyer(buyer.id, formData);
        setLoading(false);
        if (res.success) {
            setIsEditOpen(false);
        } else {
            alert(res.error);
        }
    };

    const isList = variant === 'list';

    return (
        <>
            <Card hover className="group relative">
                <CardBody className={isList ? "p-4 flex flex-col md:flex-row md:items-center gap-4" : ""}>
                    {/* Header with Edit Button */}
                    <div className={isList ? "flex items-center gap-4 w-1/3 min-w-[200px]" : "flex items-start justify-between mb-5"}>
                        <div className="flex items-center gap-3 w-full">
                            <div className="w-12 h-12 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl flex items-center justify-center text-white text-lg font-semibold shadow-sm shrink-0">
                                {buyer.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 pr-4">
                                <h3 className="font-semibold text-neutral-900 truncate">{buyer.name}</h3>
                                <Badge className="mt-1 shrink-0">
                                    <FileText className="w-3 h-3" />
                                    {buyer._count.invoices} invoices
                                </Badge>
                            </div>
                        </div>
                        {!isList && (
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setIsEditOpen(true);
                                    }}
                                    className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit Buyer"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    <Link href={`/dashboard/invoices?buyerId=${buyer.id}`} className={isList ? "flex-1 group-hover:opacity-80 transition-opacity w-full overflow-hidden" : "block group-hover:opacity-80 transition-opacity"}>
                        {/* Details */}
                        <div className={isList ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm" : "space-y-2.5 text-sm"}>
                            {buyer.email && (
                                <div className="flex items-center gap-3 text-neutral-600">
                                    <Mail className="w-4 h-4 text-neutral-400 shrink-0" />
                                    <span className="truncate" title={buyer.email}>{buyer.email}</span>
                                </div>
                            )}
                            {buyer.phone && (
                                <div className="flex items-center gap-3 text-neutral-600">
                                    <Phone className="w-4 h-4 text-neutral-400 shrink-0" />
                                    <span className="truncate">{buyer.phone}</span>
                                </div>
                            )}
                            {buyer.address && (
                                <div className="flex items-center gap-3 text-neutral-600">
                                    <MapPin className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                                    <span className="truncate" title={buyer.address}>{buyer.address}</span>
                                </div>
                            )}
                            {!buyer.email && !buyer.phone && !buyer.address && (
                                <p className="text-neutral-400 italic">No contact details</p>
                            )}
                        </div>
                    </Link>

                    {/* Actions */}
                    <div className={isList ? "flex items-center gap-2 pt-0 mt-0 ml-auto" : "mt-5 pt-4 border-t border-neutral-100 flex gap-2"}>
                        {isList && (
                            <div className="flex gap-2 transition-opacity mr-2">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setIsEditOpen(true);
                                    }}
                                    className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit Buyer"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        <Link
                            href={`/dashboard/invoices/new?buyerId=${buyer.id}`}
                            className={isList ? "inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium bg-neutral-100 text-neutral-900 rounded-lg hover:bg-neutral-200 transition-colors shrink-0" : "flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium bg-neutral-100 text-neutral-900 rounded-lg hover:bg-neutral-200 transition-colors"}
                        >
                            <Plus className="w-4 h-4" />
                            <span className={isList ? "hidden xl:inline" : ""}>New Invoice</span>
                        </Link>
                    </div>
                </CardBody>
            </Card>

            <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Buyer">
                <form onSubmit={handleUpdate} className="space-y-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
                    <Input
                        label="Buyer Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Email Address"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <Input
                            label="Phone Number"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <Textarea
                        label="Address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        rows={2}
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
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
                        <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button type="submit" loading={loading}>Save Changes</Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
