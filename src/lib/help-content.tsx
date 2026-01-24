import React from 'react';
import { BookOpen, FileText, Settings, Users, Shield, Upload, Package, BarChart3, Bell } from 'lucide-react';

export interface HelpSection {
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

export const helpContent: HelpSection[] = [
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
   - **Pending Amount**: Total value of all pending invoices awaiting payment

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

**Pending Amount**: Shows the total sum of all invoice amounts with "PENDING" status, helping you track outstanding payments and expected revenue.`,
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
   - ** Buyer Name** (required)
            - ** Email ** (optional, needed for email delivery)
   - ** Phone ** (optional, needed for WhatsApp delivery)
   - ** Address ** (optional)
3. Set invoice details:
   - ** Issue Date **: Date the invoice is issued(defaults to today)
    - ** Due Date **: Payment due date(optional)
        - ** Currency **: Select from supported currencies
            - ** Status **: Choose Draft, Pending, or Paid
4. Add line items:
- Click "Add Item" to add more products / services
    - For each item, specify:
- Description
    - Quantity
    - Unit(e.g., pcs, hrs, kg)
    - Unit Price
        - Tax Rate(%)
            - Discount(amount or percentage)
5. Add notes and terms:
   - ** Notes **: Optional message to the buyer
    - ** Terms & Conditions **: Payment terms(defaults to your settings)
6. Click "Create Invoice"

    ** Tips:**
        - Use your default tax rate from settings to speed up entry
            - You can pre - fill buyer details if selecting from existing buyers
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
2. The system will pre - fill data extracted by AI:
- Buyer information
    - Invoice date
        - Line items
            - Business details(if extracted)
    3. ** Business Details Source **: Choose between:
   - ** Use Extracted Details **: Use business info from the document
    - ** Use My Business Profile **: Use your saved business profile
4. Review and edit all fields as needed
5. Click "Create Invoice"

    ** Note:** Digitized invoices default to "DRAFT" status for review.`,
                tips: [
                    'Always review AI-extracted data for accuracy',
                    'Use extracted details for one-time vendors, profile for your business'
                ]
            },
            {
                id: 'line-items',
                title: 'Invoice Details and Line Items',
                content: `** Line Item Fields:**

- ** Description **: Name or description of the product / service
    - ** Quantity **: Number of units
        - ** Unit **: Measurement unit(pcs, hrs, kg, etc.)
            - ** Unit Price **: Price per unit
                - ** Tax Rate **: Percentage tax applied(e.g., 18 % for GST)
- ** Discount **: Can be set as:
- Fixed amount(e.g., ₹100)
    - Percentage(e.g., 10 %)

    ** Calculations:**
        - Subtotal = (Quantity × Unit Price) - Discount
            - Tax = Subtotal × (Tax Rate / 100)
- Total = Subtotal + Tax

    ** Adding / Removing Items:**
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
                content: `** DRAFT **: Invoice is being prepared and not yet finalized.Can be edited freely.

** PENDING **: Invoice has been sent to the buyer and payment is awaited.

** SENT **: Invoice has been delivered to the buyer(via email / WhatsApp).

** PAID **: Payment has been received for this invoice.

** Changing Status:**
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
                content: `** All Invoices Page:**
    - Access via "Invoices" in the sidebar
        - View all invoices in a table format
            - See invoice number, buyer, amount, status, date, and source

                ** Invoice Detail Page:**
                    - Click any invoice to view full details
                        - See complete invoice preview
                            - Access all actions(send, download, edit status)

                                ** Source Types:**
- ** Digital Invoices **: Created manually in the system
    - ** Digitized Invoices **: Created from uploaded documents via OCR`,
                tips: [
                    'Use the table view to quickly scan multiple invoices',
                    'Click invoice number to view full details'
                ]
            },
            {
                id: 'invoice-tabs',
                title: 'Invoice Tabs and Navigation',
                content: `The Invoices page features a powerful tabbed navigation system to help you quickly access and manage your invoices.

** Status Tabs:**
    Located at the top of the invoices list, these tabs filter invoices by their current status:

- ** All Invoices **: View all invoices regardless of status
    - ** Draft **: Invoices that are being prepared and not yet finalized
        - ** Pending **: Invoices sent to buyers awaiting payment
            - ** Sent **: Invoices that have been successfully delivered
                - ** Paid **: Invoices for which payment has been received

                    ** How to Use Tabs:**
                        1. Click on any status tab to filter the invoice list
2. The active tab is highlighted with a dark background
3. Invoice counts update based on your filters

    ** Source Dropdown:**
        Above the status tabs, you'll find a dropdown to switch between:
            - ** Digital Invoices **: Invoices created manually in the system
                - ** Digitized Invoices **: Invoices created from scanned documents via OCR

                    ** Combined Filtering:**
                        - Use status tabs + source dropdown together for precise filtering
                            - Example: View only "Pending" invoices from "Digitized" sources
                                - Filters are preserved when switching between tabs

                                    ** Quick Actions:**
- ** Pending Scans **: Access documents waiting to be converted to invoices
    - ** New Invoice **: Create a new invoice from scratch`,
                tips: [
                    'Use keyboard arrow keys to navigate between tabs',
                    'Tab filters work with search for powerful invoice discovery',
                    'The source dropdown helps separate manually created vs OCR invoices'
                ]
            },
            {
                id: 'filtering',
                title: 'Filtering and Searching',
                content: `** Status Filters:**
- ** All Invoices **: Shows all invoices
    - ** Draft **: Only draft invoices
        - ** Pending **: Only pending invoices
            - ** Sent **: Only sent invoices
                - ** Paid **: Only paid invoices

                    ** Source Filters:**
                        - Toggle between "Digital Invoices" and "Digitized Invoices"
                            - Combine with status filters for precise filtering

                                ** Search:**
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
                content: `** Prerequisites:**
    - Buyer must have email address for email delivery
        - Buyer must have phone number for WhatsApp delivery
            - Integrations must be configured in Settings

                ** Methods:**

                    1. ** Email Delivery:**
                        - Requires SMTP configuration in Settings
                            - Click the email icon on invoice detail page
                                - Invoice PDF is attached automatically

2. ** WhatsApp Delivery:**
    - Requires WhatsApp Cloud API configuration
        - Click the WhatsApp icon on invoice detail page
            - Invoice is sent as a message with PDF link

                ** Auto - Send Feature:**
                    - Enable in Settings → Preferences
                        - Invoices are automatically sent when created
                            - Send buttons are hidden when auto - send is enabled

                                ** Manual Send:**
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

** Supported Formats:**
    - Images: JPG, PNG, WEBP
        - PDFs: PDF documents

            ** Steps:**
                1. Navigate to "Upload & Convert" from dashboard or sidebar
2. Drag and drop files or click to browse
3. You can upload up to 10 files at once
4. Click "Process with AI" to start digitization

    ** Best Practices:**
        - Use clear, well - lit images
            - Ensure text is readable
                - Avoid blurry or low - resolution images
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

1. ** Processing Status **: Documents move through stages:
   - ** PENDING **: Waiting to be processed
    - ** PROCESSING **: AI is extracting data
        - ** COMPLETED **: Successfully processed
            - ** REVIEW_NEEDED **: Needs manual review
                - ** FAILED **: Processing unsuccessful

2. ** Processing Time **: Usually takes a few seconds per document

3. ** What Gets Extracted:**
    - Invoice number
        - Invoice date
            - Buyer name
                - Line items(description, quantity, price)
                    - Total amount
                        - Business details(if present)

    4. ** Confidence Score **: Each extraction includes a confidence percentage`,
                tips: [
                    'Processing typically completes in 5-10 seconds per document',
                    'Higher confidence scores indicate more accurate extraction'
                ]
            },
            {
                id: 'reviewing',
                title: 'Reviewing Extracted Data',
                content: `Once processing completes:

1. ** Review Screen **: Shows extracted data for each document
2. ** Verify Information **:
- Check invoice number
    - Verify dates
        - Review line items
            - Confirm amounts
3. ** Create Invoice **: Click "Create Invoice" to proceed
4. ** Edit Data **: Click "Edit Data" to modify before creating

    ** Important:** Always review extracted data for accuracy before creating invoices.`,
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
                content: `Buyers are automatically created when you create invoices.Each unique buyer(identified by name, email, or phone) becomes a contact in your system.

** Buyer Information Stored:**
    - Name
    - Email address
        - Phone number
            - Address
            - Invoice count(number of invoices created for them)`,
                tips: [
                    'Buyers are created automatically - no manual setup needed',
                    'Use consistent buyer names for better organization'
                ]
            },
            {
                id: 'viewing-buyers',
                title: 'Viewing Buyer Information',
                content: `** Buyers Page:**
    - Access via "Buyers" in the sidebar
        - View all buyers in a grid layout
            - See buyer card with:
            - Initial avatar
                - Name
                - Invoice count badge
                    - Contact details(email, phone, address)

                        ** Buyer Details:**
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
        id: 'inventory',
        title: 'Inventory Management',
        description: 'Manage products and services',
        icon: <Package className="w-5 h-5" />,
        subsections: [
            {
                id: 'managing-inventory',
                title: 'Managing Inventory',
                content: `** Accessing Inventory:**
    - Click "Inventory" in the sidebar
        - View all your products and services in one place

            ** Adding Products:**
                1. Click "Add Product" button
2. Enter details:
   - ** Name **: Product name(required)
    - ** Price **: Unit price(required)
        - ** Stock **: Current quantity in stock
            - ** Tax Rate **: Default tax percentage
3. Click "Add Product" to save

    ** Editing / Deleting:**
        - Click the pencil icon to edit details
            - Click the trash icon to remove a product`,
                tips: [
                    'Keep stock levels updated for accurate tracking',
                    'Use detailed descriptions for better searching'
                ]
            },
            {
                id: 'using-inventory',
                title: 'Using Inventory in Invoices',
                content: `** Auto - fill Line Items:**
    1. Create a new invoice
2. In the "Item Description" field, click "Select from Inventory"(or use the dropdown)
3. Select a product from your inventory
4. Price, tax, and unit are automatically filled

    ** Manual Entry:**
        - You can still enter items manually by selecting "Other" or just typing if not using inventory mode.`,
                tips: [
                    'Inventory items speed up invoice creation significantly',
                    'You can override auto-filled prices for specific invoices'
                ]
            },
            {
                id: 'barcode-scanning',
                title: 'Barcode Scanning',
                content: `**Barcode Scanner Feature (Pro, Premium, Lifetime):**

Quickly add products to your inventory or invoices by scanning barcodes using your device's camera.

**Adding Products via Barcode:**
1. Go to **Inventory** page
2. Click the **"Scan Barcode"** button
3. Point your camera at the product barcode
4. Product details are automatically fetched from global databases
5. Review and edit details, then save

**Supported Barcode Types:**
- EAN-13 / EAN-8 (retail products)
- UPC-A / UPC-E (US products)
- Code-128 / Code-39 (industrial)
- QR Codes

**Product Data Sources:**
- Your local inventory (checked first)
- Open Food Facts (global food database)
- UPCitemdb (consumer products)

**Tips for Better Scanning:**
- Hold the barcode steady in the green frame
- Ensure good lighting
- For laptop webcams, hold the barcode closer`,
                tips: [
                    'Laptop webcams work but may need the barcode held closer',
                    'Product data is cached for faster future lookups',
                    'Manual entry is always available if barcode not found'
                ]
            },
            {
                id: 'customer-search',
                title: 'Customer Search & Auto-fill',
                content: `**Quick Customer Lookup (Pro, Premium, Lifetime):**

Search and select existing customers when creating invoices to auto-fill all buyer details.

**How to Use:**
1. Go to **Invoices → Create New Invoice**
2. In the **Buyer Details** section, find the search box in the header
3. Type at least 2 characters (name, email, or phone)
4. Matching customers appear in a dropdown
5. Click a customer to auto-fill all fields

**Fields Auto-filled:**
- Buyer Name
- Email
- Phone
- Address
- State
- Tax ID / GSTIN

**Benefits:**
- No need to remember customer details
- Reduces data entry errors
- Consistent customer information across invoices`,
                tips: [
                    'Search works with name, email, or phone number',
                    'Customer data is saved automatically when you create invoices',
                    'Great for repeat customers - just search and select'
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

** Business Information:**
- ** Logo Upload **: Upload or update your business logo
    - ** Business Name **: Your company name
        - ** Business Email **: Contact email
            - ** Business Address **: Full address
                - ** Phone Number **: Contact phone
                    - ** Tax ID / GST **: Your tax identification number

                        ** Changes:**
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
                
** Setting Up Payment Methods:**
    1. Go to Settings > General
2. Scroll to "Payment Methods"
3. Click "Add Method" to add Bank Transfer, UPI, QR Code, or PayPal
4. Toggle the "Active" switch to enable a method

    ** How it Works:**
        - The active payment method is automatically included in your invoice emails and WhatsApp messages
            - When you mark an invoice as ** PENDING ** or ** SENT **, the system attaches these payment details
                - This makes it easier for customers to pay you immediately

                    ** Note:** Adding a payment method is optional.You can still create and send invoices without one, but adding it helps you get paid faster.`,
                tips: [
                    'You can only have one active payment method at a time',
                    'Payment details are shown on the invoice PDF and in the email/message body'
                ]
            },
            {
                id: 'integrations',
                title: 'Integrations',
                content: `Configure external services to send invoices automatically.

** WhatsApp Integration:**

    1. ** Requirements:**
        - Meta Developer account
            - WhatsApp Cloud API access
                - System User Access Token

2. ** Configuration:**
   - ** Phone Number ID **: From Meta Business Manager
    - ** Permanent Access Token **: System User token with \`whatsapp_business_messaging\` permission
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
        id: 'team-management',
        title: 'Team Management',
        description: 'Manage team members, roles, and access permissions',
        icon: <Users className="w-5 h-5" />,
        subsections: [
            {
                id: 'inviting-members',
                title: 'Inviting Team Members',
                content: `**Sending Invitations:**
1. Navigate to **Settings** > **Team Members**
2. Enter the email address of the person you want to invite
3. Click "Invite Member"
4. The system will send an invitation email to their inbox

**Joining Responsibilities:**
- **New Users**: Will be guided to create an account and then immediately added to your team
- **Existing Users**: Will see the new business in their dashboard immediately
- **Onboarding**: Invited members skip the business creation onboarding step

**Status Tracking:**
- **PENDING**: Invitation sent but not yet accepted
- **ACCEPTED**: Member has logged in and accessed the dashboard`,
                tips: [
                    'Double-check email addresses before sending invitations',
                    'Members receive an email notification with a direct login link'
                ]
            },
            {
                id: 'roles-permissions',
                title: 'Roles and Permissions',
                content: `Control what your team members can see and do within your business dashboard.

**Available Roles:**

1. **OWNER** (You):
   - Full access to all features
   - Can manage team members
   - Can edit all settings
   - Can delete the business profile

2. **VIEWER** (Invited Members):
   - **Read-Only Settings**: Can view but cannot modify business settings
   - **Dashboard Access**: Can view receipts, invoices, and customers
   - **Restricted Actions**: Cannot invite new members or change business details

**Read-Only Mode:**
When a member with "Viewer" access visits the Settings page, they will see a "Read-only Mode" badge and all input fields will be disabled and blurred to prevent accidental changes.`,
                tips: [
                    'Use Viewer role for accountants or auditors who need to verify records',
                    'Owners always retain full control over the business data'
                ]
            },
            {
                id: 'managing-team',
                title: 'Managing Your Team',
                content: `**Removing Members:**
1. Go to **Settings** > **Team Members**
2. Locate the member in the team list
3. Click the "Remove" (Trash) icon
4. Confirm the removal action

**Impact of Removal:**
- The user instantly loses access to your business dashboard
- They can no longer view invoices or data
- Their account remains active on Rasid, but the link to your business is severed

**Switching Businesses:**
Team members who belong to multiple businesses can switch between them using the business switcher in the sidebar.`,
                tips: [
                    'Regularly audit your team list to ensure security',
                    'Remove access immediately for employees who leave your organization'
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
    },
    {
        id: 'analytics',
        title: 'Advanced Analytics',
        description: 'Detailed insights into your business performance',
        icon: <BarChart3 className="w-5 h-5" />,
        subsections: [
            {
                id: 'analytics-overview',
                title: 'Analytics Overview',
                content: `**Advanced Analytics Dashboard:**
    - Access via the **Advanced Analytics** button on the Dashboard Overview
        - Available for **Pro, Premium, and Lifetime** plans
            - Provides visual charts and data to help you track your business growth
                
                ** Key Metrics:**
                    - ** Total Revenue **: Cumulative revenue from all PAID invoices
                        - ** Pending Amount **: Total potential revenue from PENDING invoices
                            - ** Overdue Amount **: Total value of overdue invoices needing attention
                                - ** Average Invoice Value **: The average amount of your invoices
                                    
                                    ** Charts:**
                                        - ** Revenue Trend **: Visualizes your monthly revenue growth over time
                                            - ** Invoice Status Distribution **: Pie chart showing the ratio of Paid, Pending, and Overdue invoices
                                                - ** Top Performing Clients **: Bar chart showing your top 5 clients by revenue`,
                tips: [
                    'Use analytics to identify your best customers',
                    'Monitor overdue amounts to improve cash flow',
                    'Check revenue trends to plan for busy or slow months'
                ]
            }
        ]
    },
    {
        id: 'payment-reminders',
        title: 'Payment Reminders',
        description: 'Automate payment follow-ups and get paid faster',
        icon: <Bell className="w-5 h-5" />,
        subsections: [
            {
                id: 'reminder-overview',
                title: 'Smart Payment Reminders',
                content: `**Available on Basic, Pro, Premium, and Lifetime plans**

Smart Payment Reminders help you get paid faster by automatically sending payment reminders to your customers before, on, and after invoice due dates.

**Key Features:**
- **Automated Scheduling**: Reminders are automatically scheduled based on invoice due dates
- **Multi-Channel Delivery**: Send reminders via Email or WhatsApp
- **Smart Timing**: Customize when reminders are sent (before, on, or after due date)
- **Intelligent Skipping**: Reminders are automatically skipped if invoice is already paid
- **Escalating Messages**: Different message tones for friendly reminders vs. overdue notices

**Default Reminder Schedule:**
When you enable reminders for an invoice, the system creates:
1. **3 days before due date** - Friendly heads-up reminder
2. **1 day before due date** - Urgent reminder
3. **On due date** - Payment due today notice
4. **1 day after due date** - First overdue reminder
5. **3 days after due date** - Follow-up overdue reminder
6. **7 days after due date** - Final overdue notice`,
                tips: [
                    'Invoices must have a due date set to use payment reminders',
                    'Configure email/WhatsApp integrations in Settings first',
                    'Reminders are automatically cancelled when invoice is marked as PAID'
                ]
            },
            {
                id: 'setting-up-reminders',
                title: 'Setting Up Reminders',
                content: `**Prerequisites:**
1. You must be on a **paid plan** (Basic or higher)
2. Invoice must have a **due date** set
3. Buyer must have **email** (for email) or **phone** (for WhatsApp)
4. You must have configured **email/WhatsApp integration** in Settings

**Creating Reminders:**
1. Create or edit an invoice with a due date
2. On the invoice detail page, look for the "Payment Reminders" section
3. Click "Enable Reminders" to create the default reminder schedule
4. Alternatively, create custom reminders with specific dates

**Reminder Channels:**
- **Email**: Sends a professionally formatted email with invoice details
- **WhatsApp**: Sends a concise message with payment info and invoice link

**Customizing Reminders:**
- You can cancel individual reminders you don't want sent
- Add custom reminders for specific dates
- Switch the delivery channel (Email/WhatsApp) per reminder`,
                tips: [
                    'Test your email integration before enabling reminders',
                    'Use WhatsApp for urgent or overdue reminders',
                    'Check reminder status in your dashboard to track delivery'
                ]
            },
            {
                id: 'managing-reminders',
                title: 'Managing Reminders',
                content: `**Reminder Statuses:**
- **PENDING**: Scheduled and waiting to be sent
- **SENT**: Successfully delivered to buyer
- **FAILED**: Delivery failed (check error message)
- **SKIPPED**: Skipped because invoice was paid
- **CANCELLED**: Manually cancelled by you

**Viewing Reminders:**
- View all reminders on the invoice detail page
- See upcoming reminders in your dashboard
- Track sent and failed reminders for troubleshooting

**Cancelling Reminders:**
1. Go to the invoice detail page
2. Find the reminder you want to cancel
3. Click the cancel button
4. Cancelled reminders will not be sent

**When Invoice is Paid:**
- All pending reminders are automatically skipped
- No further action needed from you

**Troubleshooting Failed Reminders:**
1. Check the error message for details
2. Verify buyer has valid email/phone
3. Confirm your integration settings are correct
4. Try resending manually if needed`,
                tips: [
                    'Regularly check for failed reminders and fix issues promptly',
                    'Update buyer contact info if reminders are bouncing',
                    'Use the dashboard to monitor reminder performance'
                ]
            }
        ]
    }
];
