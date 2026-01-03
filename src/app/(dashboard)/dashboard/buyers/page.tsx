import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardBody, Badge, EmptyState, Button } from '@/components/ui';
import { Users, Plus, Mail, Phone, MapPin, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

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
                <Button>
                    <Plus className="w-4 h-4" />
                    Add Buyer
                </Button>
            </div>

            {/* Buyers Grid */}
            {buyers.length === 0 ? (
                <Card>
                    <CardBody>
                        <EmptyState
                            icon={<Users className="w-12 h-12" />}
                            title="No buyers yet"
                            description="Buyers are automatically created when you create invoices"
                            action={
                                <Link
                                    href="/dashboard/invoices/new"
                                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create Invoice
                                </Link>
                            }
                        />
                    </CardBody>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {buyers.map((buyer: any) => (
                        <Card key={buyer.id} hover className="group">
                            <CardBody>
                                <Link href={`/dashboard/invoices?buyerId=${buyer.id}`} className="block group-hover:opacity-80 transition-opacity">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl flex items-center justify-center text-white text-lg font-semibold shadow-sm">
                                                {buyer.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-neutral-900">{buyer.name}</h3>
                                                <Badge className="mt-1">
                                                    <FileText className="w-3 h-3" />
                                                    {buyer._count.invoices} invoices
                                                </Badge>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-2.5 text-sm">
                                        {buyer.email && (
                                            <div className="flex items-center gap-3 text-neutral-600">
                                                <Mail className="w-4 h-4 text-neutral-400" />
                                                <span className="truncate">{buyer.email}</span>
                                            </div>
                                        )}
                                        {buyer.phone && (
                                            <div className="flex items-center gap-3 text-neutral-600">
                                                <Phone className="w-4 h-4 text-neutral-400" />
                                                <span>{buyer.phone}</span>
                                            </div>
                                        )}
                                        {buyer.address && (
                                            <div className="flex items-center gap-3 text-neutral-600">
                                                <MapPin className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                                                <span className="truncate">{buyer.address}</span>
                                            </div>
                                        )}
                                        {!buyer.email && !buyer.phone && !buyer.address && (
                                            <p className="text-neutral-400 italic">No contact details</p>
                                        )}
                                    </div>
                                </Link>

                                {/* Actions */}
                                <div className="mt-5 pt-4 border-t border-neutral-100 flex gap-2">
                                    <Link
                                        href={`/dashboard/invoices/new?buyerId=${buyer.id}`}
                                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium bg-neutral-100 text-neutral-900 rounded-lg hover:bg-neutral-200 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        New Invoice
                                    </Link>

                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
