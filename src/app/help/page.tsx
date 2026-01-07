'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, BookOpen, HelpCircle, FileText, Settings, Users, Shield, Upload, CheckCircle2, ArrowLeft, Sparkles, Lightbulb, ExternalLink, Hash } from 'lucide-react';
import { Button } from '@/components/ui';

interface HelpSection {
    id: string;
    title: string;
    icon: React.ReactNode;
    description: string;
    subsections: {
        id: string;
        title: string;
        content: string;
        tips?: string[];
    }[];
}

const helpContent: HelpSection[] = [
    {
        id: 'getting-started',
        title: 'Getting Started',
        description: 'Set up your account and create your first invoice',
        icon: <BookOpen className="w-5 h-5" />,
        subsections: [
            {
                id: 'onboarding',
                title: 'Onboarding Process',
                content: `When you first sign up for Rasid, you'll be guided through an onboarding process to set up your business profile.

**What You'll Need:**
- Business name
- Business address
- Phone number
- Email address
- Tax ID/GST number (optional)
- Business logo (optional)

**Steps:**
1. After signing up, you'll be redirected to the onboarding page
2. Upload your business logo (optional but recommended)
3. Fill in your business details:
   - **Business Name**: Your company or business name
   - **Business Address**: Complete address including city, state, and PIN
   - **Phone**: Contact phone number (required)
   - **Email**: Business email address (required)
   - **Tax ID/GST**: Your tax identification number (optional)
4. Click "Continue to Dashboard" to complete setup

**Note:** You can update all these details later in Settings.`,
                tips: [
                    'Upload a high-quality logo for professional invoices',
                    'Complete all fields for faster invoice creation later'
                ]
            },
            {
                id: 'first-steps',
                title: 'First Steps After Sign Up',
                content: `Once you complete onboarding:

1. **Review Your Dashboard**: Familiarize yourself with the overview page
2. **Configure Settings**: Set up your default preferences in Settings
3. **Set Up Integrations**: Configure email or WhatsApp for sending invoices (optional)
4. **Create Your First Invoice**: Either manually or by uploading a document`,
                tips: [
                    'Set default currency and tax rate to speed up invoice creation',
                    'Configure integrations early to enable automatic sending'
                ]
            }
        ]
    },
    {
        id: 'dashboard',
        title: 'Dashboard Overview',
        description: 'Understand your dashboard and key metrics',
        icon: <FileText className="w-5 h-5" />,
        subsections: [
            {
                id: 'understanding',
                title: 'Understanding Your Dashboard',
                content: `The dashboard is your command center, providing a comprehensive view of your invoice business at a glance.

**Key Components:**

1. **Welcome Header**
   - Personalized greeting based on time of day
   - Quick access to create a new invoice

2. **Statistics Grid**
   - **Total Invoices**: Count of all invoices created
   - **Total Revenue**: Sum of all invoice amounts
   - **Monthly Revenue**: Revenue generated in the current month
   - **Pending Amount**: Number of invoices with pending status

3. **Recent Invoices List**
   - Shows your most recent invoices
   - Quick access to view, download, or send invoices
   - Displays invoice number, buyer, amount, status, and date

4. **Invoice Breakdown**
   - Visual breakdown of invoices by status
   - Helps you understand your invoice distribution`,
                tips: [
                    'Use the dashboard to quickly identify overdue invoices',
                    'Monitor monthly revenue trends for business insights'
                ]
            },
            {
                id: 'quick-actions',
                title: 'Quick Actions',
                content: `The dashboard provides quick access to frequently used features:

- **Upload Invoice**: Digitize handwritten invoices using AI
- **Manage Buyers**: Access your customer database
- **Create New Invoice**: Start creating a digital invoice from scratch`,
                tips: [
                    'Use quick actions to save time on common tasks',
                    'Upload multiple invoices at once for batch processing'
                ]
            },
            {
                id: 'statistics',
                title: 'Statistics and Metrics',
                content: `**Total Invoices**: Tracks all invoices regardless of status or source.

**Total Revenue**: Calculates the sum of all invoice totals across all time.

**Monthly Revenue**: Shows revenue generated in the current calendar month.

**Pending Amount**: Counts invoices with "PENDING" status, helping you track outstanding payments.`,
                tips: [
                    'Review statistics regularly to track business growth',
                    'Use pending amount to follow up on unpaid invoices'
                ]
            }
        ]
    },
    {
        id: 'creating-invoices',
        title: 'Creating Invoices',
        description: 'Learn how to create and manage invoices',
        icon: <FileText className="w-5 h-5" />,
        subsections: [
            {
                id: 'manual-creation',
                title: 'Creating a New Invoice Manually',
                content: `To create an invoice from scratch:

1. Click "Create New Invoice" from the dashboard or invoices page
2. Fill in buyer details:
   - **Buyer Name** (required)
   - **Email** (optional, needed for email delivery)
   - **Phone** (optional, needed for WhatsApp delivery)
   - **Address** (optional)
3. Set invoice details:
   - **Issue Date**: Date the invoice is issued (defaults to today)
   - **Due Date**: Payment due date (optional)
   - **Currency**: Select from supported currencies
   - **Status**: Choose Draft, Pending, or Paid
4. Add line items:
   - Click "Add Item" to add more products/services
   - For each item, specify:
     - Description
     - Quantity
     - Unit (e.g., pcs, hrs, kg)
     - Unit Price
     - Tax Rate (%)
     - Discount (amount or percentage)
5. Add notes and terms:
   - **Notes**: Optional message to the buyer
   - **Terms & Conditions**: Payment terms (defaults to your settings)
6. Click "Create Invoice"

**Tips:**
- Use your default tax rate from settings to speed up entry
- You can pre-fill buyer details if selecting from existing buyers
- Currency defaults to your preference in settings`,
                tips: [
                    'Save time by selecting existing buyers from the dropdown',
                    'Use keyboard shortcuts: Tab to navigate, Enter to add items'
                ]
            },
            {
                id: 'digitized',
                title: 'Creating from Digitized Documents',
                content: `When creating an invoice from an uploaded document:

1. After uploading and processing, click "Create Invoice" on a completed scan
2. The system will pre-fill data extracted by AI:
   - Buyer information
   - Invoice date
   - Line items
   - Business details (if extracted)
3. **Business Details Source**: Choose between:
   - **Use Extracted Details**: Use business info from the document
   - **Use My Business Profile**: Use your saved business profile
4. Review and edit all fields as needed
5. Click "Create Invoice"

**Note:** Digitized invoices default to "DRAFT" status for review.`,
                tips: [
                    'Always review AI-extracted data for accuracy',
                    'Use extracted details for one-time vendors, profile for your business'
                ]
            },
            {
                id: 'line-items',
                title: 'Invoice Details and Line Items',
                content: `**Line Item Fields:**

- **Description**: Name or description of the product/service
- **Quantity**: Number of units
- **Unit**: Measurement unit (pcs, hrs, kg, etc.)
- **Unit Price**: Price per unit
- **Tax Rate**: Percentage tax applied (e.g., 18% for GST)
- **Discount**: Can be set as:
  - Fixed amount (e.g., ₹100)
  - Percentage (e.g., 10%)

**Calculations:**
- Subtotal = (Quantity × Unit Price) - Discount
- Tax = Subtotal × (Tax Rate / 100)
- Total = Subtotal + Tax

**Adding/Removing Items:**
- Click "Add Item" to add more line items
- Hover over an item and click the trash icon to remove it
- At least one valid item is required`,
                tips: [
                    'Use consistent units (pcs, hrs) for better organization',
                    'Apply discounts at item level for detailed tracking'
                ]
            },
            {
                id: 'statuses',
                title: 'Invoice Statuses',
                content: `**DRAFT**: Invoice is being prepared and not yet finalized. Can be edited freely.

**PENDING**: Invoice has been sent to the buyer and payment is awaited.

**SENT**: Invoice has been delivered to the buyer (via email/WhatsApp).

**PAID**: Payment has been received for this invoice.

**Changing Status:**
- Use the status dropdown on the invoice detail page
- Status changes are saved automatically`,
                tips: [
                    'Keep invoices in DRAFT until ready to send',
                    'Update status to PAID when payment is received'
                ]
            }
        ]
    },
    {
        id: 'managing-invoices',
        title: 'Managing Invoices',
        description: 'View, filter, and send invoices',
        icon: <FileText className="w-5 h-5" />,
        subsections: [
            {
                id: 'viewing',
                title: 'Viewing Invoices',
                content: `**All Invoices Page:**
- Access via "Invoices" in the sidebar
- View all invoices in a table format
- See invoice number, buyer, amount, status, date, and source

**Invoice Detail Page:**
- Click any invoice to view full details
- See complete invoice preview
- Access all actions (send, download, edit status)

**Source Types:**
- **Digital Invoices**: Created manually in the system
- **Digitized Invoices**: Created from uploaded documents via OCR`,
                tips: [
                    'Use the table view to quickly scan multiple invoices',
                    'Click invoice number to view full details'
                ]
            },
            {
                id: 'filtering',
                title: 'Filtering and Searching',
                content: `**Status Filters:**
- **All Invoices**: Shows all invoices
- **Draft**: Only draft invoices
- **Pending**: Only pending invoices
- **Sent**: Only sent invoices
- **Paid**: Only paid invoices

**Source Filters:**
- Toggle between "Digital Invoices" and "Digitized Invoices"
- Combine with status filters for precise filtering

**Search:**
- Use the search bar in the header to find invoices by:
  - Invoice number
  - Buyer name
  - Amount`,
                tips: [
                    'Combine filters for precise invoice searches',
                    'Search works across invoice numbers and buyer names'
                ]
            },
            {
                id: 'sending',
                title: 'Sending Invoices',
                content: `**Prerequisites:**
- Buyer must have email address for email delivery
- Buyer must have phone number for WhatsApp delivery
- Integrations must be configured in Settings

**Methods:**

1. **Email Delivery:**
   - Requires SMTP configuration in Settings
   - Click the email icon on invoice detail page
   - Invoice PDF is attached automatically

2. **WhatsApp Delivery:**
   - Requires WhatsApp Cloud API configuration
   - Click the WhatsApp icon on invoice detail page
   - Invoice is sent as a message with PDF link

**Auto-Send Feature:**
- Enable in Settings → Preferences
- Invoices are automatically sent when created
- Send buttons are hidden when auto-send is enabled

**Manual Send:**
- Use action buttons on invoice detail page
- Or use quick actions in the invoices table`,
                tips: [
                    'Test email/WhatsApp integration before sending important invoices',
                    'Enable auto-send to streamline your workflow'
                ]
            }
        ]
    },
    {
        id: 'digitizing',
        title: 'Digitizing Invoices (OCR)',
        description: 'Convert paper invoices to digital format using AI',
        icon: <Upload className="w-5 h-5" />,
        subsections: [
            {
                id: 'uploading',
                title: 'Uploading Documents',
                content: `Transform handwritten or printed invoices into digital format using AI-powered OCR.

**Supported Formats:**
- Images: JPG, PNG, WEBP
- PDFs: PDF documents

**Steps:**
1. Navigate to "Upload & Convert" from dashboard or sidebar
2. Drag and drop files or click to browse
3. You can upload up to 10 files at once
4. Click "Process with AI" to start digitization

**Best Practices:**
- Use clear, well-lit images
- Ensure text is readable
- Avoid blurry or low-resolution images
- For handwritten invoices, use clear handwriting`,
                tips: [
                    'Take photos in good lighting for better OCR accuracy',
                    'Upload multiple invoices at once for batch processing'
                ]
            },
            {
                id: 'processing',
                title: 'AI Processing',
                content: `After uploading:

1. **Processing Status**: Documents move through stages:
   - **PENDING**: Waiting to be processed
   - **PROCESSING**: AI is extracting data
   - **COMPLETED**: Successfully processed
   - **REVIEW_NEEDED**: Needs manual review
   - **FAILED**: Processing unsuccessful

2. **Processing Time**: Usually takes a few seconds per document

3. **What Gets Extracted:**
   - Invoice number
   - Invoice date
   - Buyer name
   - Line items (description, quantity, price)
   - Total amount
   - Business details (if present)

4. **Confidence Score**: Each extraction includes a confidence percentage`,
                tips: [
                    'Processing typically completes in 5-10 seconds per document',
                    'Higher confidence scores indicate more accurate extraction'
                ]
            },
            {
                id: 'reviewing',
                title: 'Reviewing Extracted Data',
                content: `Once processing completes:

1. **Review Screen**: Shows extracted data for each document
2. **Verify Information**:
   - Check invoice number
   - Verify dates
   - Review line items
   - Confirm amounts
3. **Create Invoice**: Click "Create Invoice" to proceed
4. **Edit Data**: Click "Edit Data" to modify before creating

**Important:** Always review extracted data for accuracy before creating invoices.`,
                tips: [
                    'Review all extracted data, especially amounts and dates',
                    'Edit any incorrect fields before creating the invoice'
                ]
            }
        ]
    },
    {
        id: 'buyers',
        title: 'Buyer Management',
        description: 'Organize and manage your customers',
        icon: <Users className="w-5 h-5" />,
        subsections: [
            {
                id: 'understanding-buyers',
                title: 'Understanding Buyers',
                content: `Buyers are automatically created when you create invoices. Each unique buyer (identified by name, email, or phone) becomes a contact in your system.

**Buyer Information Stored:**
- Name
- Email address
- Phone number
- Address
- Invoice count (number of invoices created for them)`,
                tips: [
                    'Buyers are created automatically - no manual setup needed',
                    'Use consistent buyer names for better organization'
                ]
            },
            {
                id: 'viewing-buyers',
                title: 'Viewing Buyer Information',
                content: `**Buyers Page:**
- Access via "Buyers" in the sidebar
- View all buyers in a grid layout
- See buyer card with:
  - Initial avatar
  - Name
  - Invoice count badge
  - Contact details (email, phone, address)

**Buyer Details:**
- Click on a buyer card to filter invoices by that buyer
- See all invoices associated with the buyer`,
                tips: [
                    'Click buyer cards to quickly view all their invoices',
                    'Use buyer page to find contact information quickly'
                ]
            }
        ]
    },
    {
        id: 'settings',
        title: 'Settings and Configuration',
        description: 'Customize your account and preferences',
        icon: <Settings className="w-5 h-5" />,
        subsections: [
            {
                id: 'general',
                title: 'General Settings',
                content: `Access Settings from the sidebar to manage your business profile.

**Business Information:**
- **Logo Upload**: Upload or update your business logo
- **Business Name**: Your company name
- **Business Email**: Contact email
- **Business Address**: Full address
- **Phone Number**: Contact phone
- **Tax ID/GST**: Your tax identification number

**Changes:**
- All changes take effect immediately
- Logo appears on all new invoices
- Information is used in invoice generation`,
                tips: [
                    'Keep business information up to date for accurate invoices',
                    'Upload a high-resolution logo for best results'
                ]
            },
            {
                id: 'payment-methods',
                title: 'Payment Methods',
                content: `Configure how you want to receive payments from your customers.
                
**Setting Up Payment Methods:**
1. Go to Settings > General
2. Scroll to "Payment Methods"
3. Click "Add Method" to add Bank Transfer, UPI, QR Code, or PayPal
4. Toggle the "Active" switch to enable a method

**How it Works:**
- The active payment method is automatically included in your invoice emails and WhatsApp messages
- When you mark an invoice as **PENDING** or **SENT**, the system attaches these payment details
- This makes it easier for customers to pay you immediately

**Note:** Adding a payment method is optional. You can still create and send invoices without one, but adding it helps you get paid faster.`,
                tips: [
                    'You can only have one active payment method at a time',
                    'Payment details are shown on the invoice PDF and in the email/message body'
                ]
            },
            {
                id: 'integrations',
                title: 'Integrations',
                content: `Configure external services to send invoices automatically.

**WhatsApp Integration:**

1. **Requirements:**
   - Meta Developer account
   - WhatsApp Cloud API access
   - System User Access Token

2. **Configuration:**
   - **Phone Number ID**: From Meta Business Manager
   - **Permanent Access Token**: System User token with \`whatsapp_business_messaging\` permission
   - **Business Account ID**: Optional, for multi-account setups

**Email Integration (SMTP):**

1. **Supported Providers:**
   - Gmail
   - Outlook/Office 365
   - Hostinger
   - Custom SMTP servers

2. **Configuration:**
   - **SMTP Host**: Server address (auto-filled for presets)
   - **SMTP Port**: Usually 587 or 465
   - **SMTP User**: Your email address
   - **SMTP Password**: App password (for Gmail with 2FA)
   - **From Email**: Sender email address`,
                tips: [
                    'Use App Passwords for Gmail if 2FA is enabled',
                    'Test integrations after configuration to ensure they work'
                ]
            },
            {
                id: 'preferences',
                title: 'Invoice Preferences',
                content: `Set default values for new invoices to speed up creation.

**Default Currency:**
- Choose your primary currency
- Applied to all new invoices
- Can be changed per invoice

**Default Tax Rate:**
- Set your standard tax percentage
- Applied to new line items
- Can be adjusted per item

**Default Terms & Conditions:**
- Set standard payment terms
- Pre-filled in new invoices
- Can be edited per invoice

**Auto-Send Invoices:**
- Enable to automatically send invoices when created
- Requires buyer contact info (email or phone)
- Requires configured integration
- Send buttons hidden when enabled

**Invoice Templates:**
- Choose from premium templates
- Preview each template before selecting
- Selected template applies to all PDFs`,
                tips: [
                    'Set defaults that match your most common invoice settings',
                    'Preview templates before selecting to find your preferred style'
                ]
            }
        ]
    },
    {
        id: 'verification',
        title: 'Invoice Verification',
        description: 'Verify invoice authenticity and security',
        icon: <Shield className="w-5 h-5" />,
        subsections: [
            {
                id: 'how-it-works',
                title: 'How Verification Works',
                content: `Every invoice in Rasid is cryptographically signed for authenticity verification.

**Security Features:**
- **Verification Hash**: Unique 12-character code for each invoice
- **Cryptographic Signature**: Prevents tampering
- **Public Verification**: Anyone can verify without login

**What Gets Verified:**
- Invoice number
- Total amount
- Issue date
- Seller information
- Data integrity (tamper detection)`,
                tips: [
                    'Share verification links with customers for transparency',
                    'Verification works without requiring account access'
                ]
            },
            {
                id: 'sharing',
                title: 'Sharing Verification Links',
                content: `**Finding Your Verification Link:**
1. Open any invoice detail page
2. Scroll to "Invoice Verification" section
3. Copy the verification URL

**Verification URL Format:**
\`\`\`
https://yourdomain.com/verify/[12-character-hash]
\`\`\`

**Sharing Options:**
- Copy link to clipboard
- Share via email
- Include in invoice PDF
- Share via messaging apps

**Use Cases:**
- Customers can verify invoice authenticity
- Auditors can validate invoices
- Build trust with transparent verification`,
                tips: [
                    'Include verification links in invoice PDFs for easy access',
                    'Verification links never expire and remain valid permanently'
                ]
            }
        ]
    }
];

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSection, setSelectedSection] = useState<string | null>(null);
    const [selectedSubsection, setSelectedSubsection] = useState<string | null>(null);

    // Add structured data for SEO
    useEffect(() => {
        const structuredData = {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: helpContent.flatMap(section =>
                section.subsections.map(subsection => ({
                    '@type': 'Question',
                    name: subsection.title,
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: subsection.content.replace(/\*\*/g, '').substring(0, 500) + '...'
                    }
                }))
            )
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(structuredData);
        document.head.appendChild(script);

        return () => {
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
        };
    }, []);

    const filteredSections = useMemo(() => {
        if (!searchQuery.trim()) return helpContent;

        const query = searchQuery.toLowerCase();
        return helpContent
            .map(section => {
                const matchingSubsections = section.subsections.filter(sub =>
                    sub.title.toLowerCase().includes(query) ||
                    sub.content.toLowerCase().includes(query)
                );

                if (section.title.toLowerCase().includes(query) || matchingSubsections.length > 0) {
                    return {
                        ...section,
                        subsections: matchingSubsections.length > 0 ? matchingSubsections : section.subsections
                    };
                }
                return null;
            })
            .filter(Boolean) as HelpSection[];
    }, [searchQuery]);

    const selectedSectionData = helpContent.find(s => s.id === selectedSection);
    const selectedSubsectionData = selectedSectionData?.subsections.find(s => s.id === selectedSubsection);

    const formatContent = (content: string) => {
        const parts = content.split('\n\n');
        return parts.map((paragraph, idx) => {
            if (!paragraph.trim()) return null;

            // Handle numbered lists
            if (/^\d+\./.test(paragraph.trim())) {
                const lines = paragraph.split('\n');
                return (
                    <ol key={idx} className="list-decimal list-inside space-y-2 mb-4 ml-4">
                        {lines.map((line, lineIdx) => {
                            if (/^\d+\./.test(line.trim())) {
                                const content = line.replace(/^\d+\.\s*/, '');
                                return (
                                    <li key={lineIdx} className="mb-2">
                                        {formatInlineContent(content)}
                                    </li>
                                );
                            }
                            return null;
                        })}
                    </ol>
                );
            }

            // Handle bullet lists
            if (paragraph.includes('\n-') || paragraph.trim().startsWith('-')) {
                const lines = paragraph.split('\n');
                return (
                    <ul key={idx} className="list-none space-y-2 mb-4">
                        {lines.map((line, lineIdx) => {
                            if (line.trim().startsWith('-')) {
                                const content = line.replace(/^-\s*/, '');
                                return (
                                    <li key={lineIdx} className="flex gap-3 mb-2">
                                        <span className="text-primary mt-1.5 flex-shrink-0">•</span>
                                        <span className="flex-1">{formatInlineContent(content)}</span>
                                    </li>
                                );
                            }
                            if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
                                return (
                                    <h3 key={lineIdx} className="text-foreground font-semibold text-lg mt-6 mb-3">
                                        {line.replace(/\*\*/g, '')}
                                    </h3>
                                );
                            }
                            if (line.trim()) {
                                return (
                                    <p key={lineIdx} className="mb-2">
                                        {formatInlineContent(line)}
                                    </p>
                                );
                            }
                            return null;
                        })}
                    </ul>
                );
            }

            // Handle bold headers
            if (paragraph.trim().startsWith('**') && paragraph.trim().endsWith('**') && paragraph.split('**').length === 3) {
                return (
                    <h3 key={idx} className="text-foreground font-semibold text-lg mt-6 mb-3">
                        {paragraph.replace(/\*\*/g, '')}
                    </h3>
                );
            }

            // Regular paragraph
            return (
                <p key={idx} className="mb-4 leading-relaxed">
                    {formatInlineContent(paragraph)}
                </p>
            );
        });
    };

    const formatInlineContent = (text: string) => {
        return text.split(/(\*\*.*?\*\*|`.*?`)/g).map((part, idx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return (
                    <strong key={idx} className="text-foreground font-semibold">
                        {part.replace(/\*\*/g, '')}
                    </strong>
                );
            }
            if (part.startsWith('`') && part.endsWith('`')) {
                return (
                    <code key={idx} className="px-1.5 py-0.5 bg-neutral-100 text-neutral-900 rounded text-sm font-mono">
                        {part.replace(/`/g, '')}
                    </code>
                );
            }
            return <span key={idx}>{part}</span>;
        });
    };

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <header className="border-b border-neutral-200/50 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
                <div className="container-app">
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/"
                                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors -ml-2"
                                aria-label="Back to home"
                            >
                                <ArrowLeft className="w-5 h-5 text-neutral-600" />
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-neutral-900 flex items-center justify-center">
                                    <HelpCircle className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Help Center</h1>
                                    <p className="text-xs text-neutral-500 mt-0.5">Find answers and guides</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container-app py-8 lg:py-12">
                {/* Search Section */}
                <div className="mb-8">
                    <div className="relative max-w-2xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search for help articles, guides, or topics..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                            >
                                ×
                            </button>
                        )}
                    </div>
                    {searchQuery && (
                        <p className="text-sm text-neutral-500 mt-3">
                            Found {filteredSections.reduce((acc, s) => acc + s.subsections.length, 0)} article{filteredSections.reduce((acc, s) => acc + s.subsections.length, 0) !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>

                <div className="grid lg:grid-cols-[280px_1fr] gap-8">
                    {/* Sidebar Navigation */}
                    <aside className="lg:sticky lg:top-24 h-fit">
                        <nav className="space-y-1 bg-white rounded-xl border border-neutral-200 p-2">
                            {filteredSections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => {
                                        setSelectedSection(section.id);
                                        setSelectedSubsection(section.subsections[0]?.id || null);
                                    }}
                                    className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-all group ${selectedSection === section.id
                                            ? 'bg-neutral-900 text-white'
                                            : 'text-neutral-700 hover:bg-neutral-50'
                                        }`}
                                >
                                    <div className={`mt-0.5 flex-shrink-0 ${selectedSection === section.id ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-600'}`}>
                                        {section.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`font-medium text-sm ${selectedSection === section.id ? 'text-white' : 'text-neutral-900'}`}>
                                            {section.title}
                                        </div>
                                        <div className={`text-xs mt-0.5 ${selectedSection === section.id ? 'text-neutral-300' : 'text-neutral-500'}`}>
                                            {section.subsections.length} article{section.subsections.length !== 1 ? 's' : ''}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="min-w-0">
                        {selectedSectionData && selectedSubsectionData ? (
                            <article className="space-y-6">
                                {/* Breadcrumb */}
                                <nav className="flex items-center gap-2 text-sm text-neutral-500">
                                    <Link href="/help" className="hover:text-neutral-900 transition-colors">Help</Link>
                                    <ChevronRight className="w-4 h-4" />
                                    <span>{selectedSectionData.title}</span>
                                    <ChevronRight className="w-4 h-4" />
                                    <span className="text-neutral-900 font-medium">{selectedSubsectionData.title}</span>
                                </nav>

                                {/* Article Header */}
                                <div className="bg-white rounded-xl border border-neutral-200 p-8">
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="w-12 h-12 rounded-lg bg-neutral-900 flex items-center justify-center flex-shrink-0">
                                            {selectedSectionData.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                                                {selectedSubsectionData.title}
                                            </h2>
                                            <p className="text-sm text-neutral-500">
                                                {selectedSectionData.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="prose prose-sm max-w-none text-neutral-700">
                                        {formatContent(selectedSubsectionData.content)}
                                    </div>

                                    {/* Tips Section */}
                                    {selectedSubsectionData.tips && selectedSubsectionData.tips.length > 0 && (
                                        <div className="mt-8 pt-6 border-t border-neutral-200">
                                            <div className="flex items-start gap-3">
                                                <div className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <Lightbulb className="w-3 h-3 text-blue-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-sm font-semibold text-neutral-900 mb-3">Pro Tips</h3>
                                                    <ul className="space-y-2">
                                                        {selectedSubsectionData.tips.map((tip, idx) => (
                                                            <li key={idx} className="flex gap-2 text-sm text-neutral-600">
                                                                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                                                <span>{tip}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Related Articles */}
                                <div className="bg-white rounded-xl border border-neutral-200 p-6">
                                    <h3 className="text-sm font-semibold text-neutral-900 mb-4">Related Articles</h3>
                                    <div className="space-y-2">
                                        {selectedSectionData.subsections
                                            .filter(sub => sub.id !== selectedSubsection)
                                            .map((sub) => (
                                                <button
                                                    key={sub.id}
                                                    onClick={() => setSelectedSubsection(sub.id)}
                                                    className={`w-full text-left px-4 py-3 rounded-lg transition-all text-sm ${selectedSubsection === sub.id
                                                            ? 'bg-neutral-900 text-white'
                                                            : 'text-neutral-700 hover:bg-neutral-50'
                                                        }`}
                                                >
                                                    {sub.title}
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            </article>
                        ) : (
                            <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
                                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                                    <Sparkles className="w-8 h-8 text-neutral-400" />
                                </div>
                                <h2 className="text-xl font-bold text-neutral-900 mb-2">Welcome to Help Center</h2>
                                <p className="text-neutral-600 mb-8 max-w-md mx-auto">
                                    Select a topic from the sidebar to get started, or use the search bar above to find specific information.
                                </p>
                                <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                                    {helpContent.slice(0, 4).map((section) => (
                                        <button
                                            key={section.id}
                                            onClick={() => {
                                                setSelectedSection(section.id);
                                                setSelectedSubsection(section.subsections[0]?.id || null);
                                            }}
                                            className="p-5 border border-neutral-200 rounded-xl text-left hover:border-neutral-900 hover:bg-neutral-50 transition-all group"
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="text-neutral-400 group-hover:text-neutral-900 transition-colors">
                                                    {section.icon}
                                                </div>
                                                <h3 className="font-semibold text-neutral-900 text-sm">
                                                    {section.title}
                                                </h3>
                                            </div>
                                            <p className="text-xs text-neutral-500 mb-2">{section.description}</p>
                                            <p className="text-xs text-neutral-400">
                                                {section.subsections.length} article{section.subsections.length !== 1 ? 's' : ''}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
