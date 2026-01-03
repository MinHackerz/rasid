import { formatCurrency, formatDate } from '@/lib/utils';
import { INVOICE_TEMPLATES } from '@/lib/invoice-templates';
import { getCurrencyTaxName, getCurrencyTaxIdLabel } from '@/lib/currencies';

interface InvoiceRendererProps {
    invoice: any;
    templateId?: string;
    businessProfile: {
        name: string;
        address?: string | null;
        phone?: string | null;
        email?: string | null;
        logo?: string | null;
        taxId?: string | null;
    };
}

export default function InvoiceRenderer({ invoice, templateId = 'classic', businessProfile }: InvoiceRendererProps) {
    const template = INVOICE_TEMPLATES.find(t => t.id === templateId) || INVOICE_TEMPLATES[0];

    // Design Configuration (can be expanded based on more template properties)
    const isDarkBg = template.id === 'luxury';
    const headerColor = isDarkBg ? template.colors.secondary : template.colors.primary;
    const subTextColor = isDarkBg ? '#a8a29e' : template.colors.secondary;
    const bodyTextColor = isDarkBg ? '#faf5ef' : '#1f2937';
    // For light accent backgrounds (like executive's yellow), ensure dark text
    const accentBgColor = template.colors.accent;

    return (
        <div
            className="p-10 min-h-[800px] shadow-sm"
            style={{
                background: isDarkBg
                    ? template.colors.primary
                    : `linear-gradient(180deg, ${accentBgColor} 0%, white 300px)`
            }}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-10 pb-8" style={{ borderBottom: `2px solid ${template.colors.primary}20` }}>
                <div>
                    {businessProfile.logo && (
                        <div className="mb-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={businessProfile.logo}
                                alt="Business Logo"
                                className="h-16 w-auto object-contain"
                            />
                        </div>
                    )}
                    <h2
                        className="text-2xl font-bold mb-2"
                        style={{ color: headerColor }}
                    >
                        {businessProfile.name}
                    </h2>
                    <div
                        className="space-y-0.5 text-sm"
                        style={{ color: subTextColor }}
                    >
                        {businessProfile.address && <p className="max-w-xs">{businessProfile.address}</p>}
                        {businessProfile.phone && <p>{businessProfile.phone}</p>}
                        <p>{businessProfile.email}</p>
                        {businessProfile.taxId && (
                            <p className="mt-2 font-medium" style={{ color: headerColor }}>
                                {getCurrencyTaxIdLabel(invoice.currency)}: {businessProfile.taxId}
                            </p>
                        )}
                    </div>
                </div>
                <div className="text-right">
                    <p
                        className="text-4xl font-light tracking-widest mb-3 opacity-50"
                        style={{ color: headerColor }}
                    >
                        INVOICE
                    </p>
                    <p
                        className="text-xl font-semibold"
                        style={{ color: bodyTextColor }}
                    >
                        {invoice.invoiceNumber}
                    </p>
                </div>
            </div>

            {/* Billed To & Dates */}
            <div className="grid grid-cols-2 gap-12 mb-10">
                <div>
                    <p
                        className="text-xs font-semibold uppercase tracking-wider mb-3 opacity-70"
                        style={{ color: headerColor }}
                    >
                        Billed To
                    </p>
                    <p
                        className="text-lg font-semibold"
                        style={{ color: bodyTextColor }}
                    >
                        {invoice.buyer?.name || 'Walk-in Customer'}
                    </p>
                    <div
                        className="mt-1 text-sm space-y-0.5"
                        style={{ color: subTextColor }}
                    >
                        {invoice.buyer?.address && <p>{invoice.buyer.address}</p>}
                        {invoice.buyer?.email && <p>{invoice.buyer.email}</p>}
                        {invoice.buyer?.phone && <p>{invoice.buyer.phone}</p>}
                    </div>
                </div>
                <div className="text-right">
                    <div className="inline-block text-left">
                        <div className="mb-4">
                            <p
                                className="text-xs font-semibold uppercase tracking-wider mb-1 opacity-70"
                                style={{ color: headerColor }}
                            >
                                Invoice Date
                            </p>
                            <p className="font-medium" style={{ color: bodyTextColor }}>{formatDate(invoice.issueDate)}</p>
                        </div>
                        {invoice.dueDate && (
                            <div>
                                <p
                                    className="text-xs font-semibold uppercase tracking-wider mb-1 opacity-70"
                                    style={{ color: headerColor }}
                                >
                                    Due Date
                                </p>
                                <p className="font-medium" style={{ color: bodyTextColor }}>{formatDate(invoice.dueDate)}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <div className="mb-10 rounded-xl overflow-hidden" style={{ border: `1px solid ${template.colors.primary}15` }}>
                <table className="w-full">
                    <thead>
                        <tr style={{ backgroundColor: `${template.colors.primary}08`, borderBottom: `1px solid ${template.colors.primary}15` }}>
                            <th className="text-left px-5 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: headerColor }}>
                                Description
                            </th>
                            <th className="text-center px-5 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: headerColor }}>
                                Qty
                            </th>
                            <th className="text-center px-5 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: headerColor }}>
                                Unit
                            </th>
                            <th className="text-right px-5 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: headerColor }}>
                                Rate
                            </th>
                            <th className="text-right px-5 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: headerColor }}>
                                {getCurrencyTaxName(invoice.currency)}
                            </th>
                            <th className="text-right px-5 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: headerColor }}>
                                Amount
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map((item: any, index: number) => (
                            <tr
                                key={item.id}
                                style={{
                                    borderBottom: index !== invoice.items.length - 1 ? `1px solid ${template.colors.primary}10` : 'none',
                                    color: bodyTextColor
                                }}
                            >
                                <td className="px-5 py-4 font-medium">{item.description}</td>
                                <td className="px-5 py-4 text-center tabular-nums opacity-80">{item.quantity}</td>
                                <td className="px-5 py-4 text-center opacity-80">{item.unit}</td>
                                <td className="px-5 py-4 text-right tabular-nums opacity-80">
                                    {formatCurrency(item.unitPrice, invoice.currency)}
                                </td>
                                <td className="px-5 py-4 text-right tabular-nums opacity-80">{item.taxRate}%</td>
                                <td className="px-5 py-4 text-right font-semibold tabular-nums">
                                    {formatCurrency(item.amount, invoice.currency)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-10">
                <div className="w-80">
                    <div className="space-y-3 pb-4">
                        <div className="flex justify-between text-sm" style={{ color: subTextColor }}>
                            <span>Subtotal</span>
                            <span className="font-medium tabular-nums" style={{ color: bodyTextColor }}>
                                {formatCurrency(invoice.subtotal, invoice.currency)}
                            </span>
                        </div>
                        {invoice.taxAmount > 0 && (
                            <div className="flex justify-between text-sm" style={{ color: subTextColor }}>
                                <span>{getCurrencyTaxName(invoice.currency)}</span>
                                <span className="font-medium tabular-nums" style={{ color: bodyTextColor }}>
                                    {formatCurrency(invoice.taxAmount, invoice.currency)}
                                </span>
                            </div>
                        )}
                        {invoice.discountAmount > 0 && (
                            <div className="flex justify-between text-sm" style={{ color: subTextColor }}>
                                <span>Discount</span>
                                <span className="font-medium tabular-nums text-emerald-600">
                                    -{formatCurrency(invoice.discountAmount, invoice.currency)}
                                </span>
                            </div>
                        )}
                    </div>
                    <div
                        className="flex justify-between pt-4"
                        style={{ borderTop: `2px solid ${template.colors.primary}` }}
                    >
                        <span className="text-lg font-semibold" style={{ color: headerColor }}>Total</span>
                        <span className="text-2xl font-bold tabular-nums" style={{ color: headerColor }}>
                            {formatCurrency(invoice.totalAmount, invoice.currency)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Notes & Terms */}
            {(invoice.notes || invoice.terms) && (
                <div
                    className="pt-8 grid grid-cols-2 gap-8"
                    style={{ borderTop: `1px solid ${template.colors.primary}15` }}
                >
                    {invoice.notes && (
                        <div>
                            <p
                                className="text-xs font-semibold uppercase tracking-wider mb-2 opacity-70"
                                style={{ color: headerColor }}
                            >
                                Notes
                            </p>
                            <p className="text-sm leading-relaxed" style={{ color: subTextColor }}>{invoice.notes}</p>
                        </div>
                    )}
                    {invoice.terms && (
                        <div>
                            <p
                                className="text-xs font-semibold uppercase tracking-wider mb-2 opacity-70"
                                style={{ color: headerColor }}
                            >
                                Terms & Conditions
                            </p>
                            <p className="text-sm leading-relaxed" style={{ color: subTextColor }}>{invoice.terms}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
