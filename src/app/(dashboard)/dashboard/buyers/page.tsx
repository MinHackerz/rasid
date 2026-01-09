import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardBody, Badge, EmptyState, Button } from '@/components/ui';
import { Users, Plus, Mail, Phone, MapPin, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { BuyerCard } from '@/components/dashboard/BuyerCard';
import { AddBuyerButton } from '@/components/dashboard/AddBuyerButton';

export default async function BuyersPage() {
    const session = await getSession();
    if (!session) return null;

    const buyers = await prisma.buyer.findMany({
        where: { sellerId: session.sellerId },
        include: {
            _count: {
                select: { invoices: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Buyers</h1>
                    <p className="text-neutral-500 mt-1">Manage your customers and their details</p>
                </div>
                <AddBuyerButton />
            </div>

            {/* Buyers Grid */}
            {buyers.length === 0 ? (
                <Card>
                    <CardBody>
                        <EmptyState
                            icon={<Users className="w-12 h-12" />}
                            title="No buyers yet"
                            description="Buyers are automatically created when you create invoices, or you can add them manually."
                            action={
                                <div className="flex gap-3">
                                    <Link
                                        href="/dashboard/invoices/new"
                                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Create Invoice
                                    </Link>
                                    <AddBuyerButton />
                                </div>
                            }
                        />
                    </CardBody>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {buyers.map((buyer: any) => (
                        <BuyerCard key={buyer.id} buyer={buyer} />
                    ))}
                </div>
            )}
        </div>
    );
}
