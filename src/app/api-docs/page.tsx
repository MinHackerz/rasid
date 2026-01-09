import { Metadata } from 'next';
import Link from 'next/link';
import { ApiDocsHeader } from '@/components/layout/ApiDocsHeader';
import { ArrowRight, Code2, Zap, Shield, FileText, CheckCircle2 } from 'lucide-react';
import { CodeTabs } from '@/components/api-docs/CodeTabs';
import { Endpoint } from '@/components/api-docs/Endpoint';

export const metadata: Metadata = {
    title: 'API Documentation | Rasid',
    description: 'Complete API documentation for programmatically generating invoices with Rasid',
};

// Code Examples
const generateInvoiceExamples = {
    curl: `curl -X POST https://rasid.in/api/v1/invoices/generate \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "buyer": {
      "name": "Acme Corp",
      "email": "billing@acme.com",
      "address": "123 Tech Park, India"
    },
    "items": [
      {
        "description": "Software Development",
        "quantity": 160,
        "unitPrice": 2500,
        "taxRate": 18
      }
    ],
    "notes": "Thank you for your business"
  }'`,
    javascript: `const response = await fetch('https://rasid.in/api/v1/invoices/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    buyer: {
      name: 'Acme Corp',
      email: 'billing@acme.com',
      address: '123 Tech Park, India'
    },
    items: [
      {
        description: 'Software Development',
        quantity: 160,
        unitPrice: 2500,
        taxRate: 18
      }
    ],
    notes: 'Thank you for your business'
  })
});

const data = await response.json();
console.log('Invoice Generated:', data.invoice.pdfUrl);`,
    python: `import requests

url = "https://rasid.in/api/v1/invoices/generate"

headers = {
    "Content-Type": "application/json",
    "x-api-key": "YOUR_API_KEY"
}

payload = {
    "buyer": {
        "name": "Acme Corp",
        "email": "billing@acme.com",
        "address": "123 Tech Park, India"
    },
    "items": [
        {
            "description": "Software Development",
            "quantity": 160,
            "unitPrice": 2500,
            "taxRate": 18
        }
    ],
    "notes": "Thank you for your business"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`,
    php: `<?php
$client = new GuzzleHttp\\Client();

$response = $client->post('https://rasid.in/api/v1/invoices/generate', [
    'headers' => [
        'Content-Type' => 'application/json',
        'x-api-key' => 'YOUR_API_KEY'
    ],
    'json' => [
        'buyer' => [
            'name' => 'Acme Corp',
            'email' => 'billing@acme.com',
            'address' => '123 Tech Park, India'
        ],
        'items' => [
            [
                'description' => 'Software Development',
                'quantity' => 160,
                'unitPrice' => 2500,
                'taxRate' => 18
            ]
        ],
        'notes' => 'Thank you for your business'
    ]
]);

echo $response->getBody();`,
    go: `package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

func main() {
	url := "https://rasid.in/api/v1/invoices/generate"
	payload := map[string]interface{}{
		"buyer": map[string]string{
			"name":    "Acme Corp",
			"email":   "billing@acme.com",
            "address": "123 Tech Park, India",
		},
		"items": []map[string]interface{}{
			{
				"description": "Software Development",
				"quantity":    160,
				"unitPrice":   2500,
                "taxRate":     18,
			},
		},
        "notes": "Thank you for your business",
	}
	jsonPayload, _ := json.Marshal(payload)

	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonPayload))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", "YOUR_API_KEY")

	client := &http.Client{}
	resp, _ := client.Do(req)
	defer resp.Body.Close()

	fmt.Println("Status:", resp.Status)
}`
};


export default function PublicApiDocsPage() {
    return (
        <div className="min-h-screen bg-white">
            <ApiDocsHeader />

            <div className="bg-white border-b border-neutral-200">
                <main className="max-w-7xl mx-auto px-4 md:px-6 py-16 lg:py-24">
                    <div className="flex flex-col gap-12 lg:gap-16">
                        <div className="space-y-8 w-full">
                            <div className="inline-flex items-center gap-2 bg-neutral-900 text-white px-4 py-1.5 rounded-full text-sm font-medium">
                                <Code2 className="w-4 h-4" />
                                Developer API v1
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-neutral-900 max-w-4xl">
                                Build invoicing <br className="hidden lg:block" /> into your app.
                            </h1>
                            <p className="text-lg text-neutral-600 leading-relaxed max-w-2xl">
                                Generate professional PDF invoices programmatically in seconds. Secure, reliable, and designed for developers.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link
                                    href="/#pricing"
                                    className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-neutral-900 text-white font-medium hover:bg-neutral-800 transition-colors"
                                >
                                    Get API Key
                                </Link>
                                <Link
                                    href="#documentation"
                                    className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white border border-neutral-200 text-neutral-900 font-medium hover:bg-neutral-50 transition-colors"
                                >
                                    View Docs
                                </Link>
                            </div>

                            <div className="pt-8 border-t border-neutral-100 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                                <div>
                                    <div className="text-3xl font-bold text-neutral-900">99.9%</div>
                                    <div className="text-sm text-neutral-500 mt-1">Uptime SLA</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-neutral-900">&lt;500ms</div>
                                    <div className="text-sm text-neutral-500 mt-1">Latency</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-neutral-900">10k+</div>
                                    <div className="text-sm text-neutral-500 mt-1">Daily Invoices</div>
                                </div>
                            </div>
                        </div>

                        {/* Full width interactive playground preview */}
                        <div className="relative w-full">
                            <div className="absolute -inset-1 bg-gradient-to-r from-sky-500/20 to-indigo-500/20 rounded-2xl blur-xl opacity-50 pointer-events-none"></div>
                            <CodeTabs examples={generateInvoiceExamples} defaultLanguage="curl" />
                        </div>
                    </div>
                </main>
            </div>

            <main id="documentation" className="max-w-7xl mx-auto px-4 md:px-6 py-16 lg:py-24 space-y-24">

                {/* Authentication Section */}
                <div className="space-y-8">
                    <div className="space-y-6 max-w-3xl">
                        <h2 className="text-3xl font-bold text-neutral-900">Authentication</h2>
                        <p className="text-neutral-600 leading-relaxed text-lg">
                            Rasid API uses API keys to authenticate requests. You can view and manage your API keys in the <Link href="/dashboard/developer" className="text-blue-600 hover:underline font-medium">Developer Dashboard</Link>.
                        </p>
                        <div className="rounded-xl bg-amber-50 border border-amber-100 p-6">
                            <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                Security Notice
                            </h4>
                            <p className="text-sm text-amber-800/80">
                                Your API keys carry many privileges, so be sure to keep them secure! Do not share your secret API keys in publicly accessible areas such as GitHub, client-side code, etc.
                            </p>
                        </div>
                    </div>
                    <div className="bg-[#1e1e1e] rounded-xl border border-[#333333] p-6 shadow-xl">
                        <div className="text-[#858585] text-xs uppercase tracking-wider mb-3 font-semibold">Headers</div>
                        <div className="font-mono text-sm space-y-3">
                            <div className="flex items-center gap-4">
                                <span className="text-[#569cd6]">Authorization:</span>
                                <span className="text-[#ce9178]">Bearer &lt;token&gt;</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-[#569cd6]">x-api-key:</span>
                                <span className="text-[#ce9178]">rsd_live_...</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Generate Invoice Section */}
                <div className="space-y-12">
                    <div className="space-y-8 max-w-3xl">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold text-neutral-900">Generate Invoice</h2>
                            <p className="text-neutral-600 leading-relaxed text-lg">
                                Create a new invoice PDF. You can specify buyer details, items, tax rates, and more.
                                The API will return a direct link to the generated PDF which is hosted on our secure CDN.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <Endpoint method="POST" path="/api/v1/invoices/generate" description="Creates a new invoice and returns the PDF URL." />
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-neutral-900">Parameters</h3>
                            <div className="divide-y divide-neutral-100 border-t border-b border-neutral-100">
                                <div className="py-4 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
                                    <code className="text-sm font-semibold text-blue-600 font-mono">buyer</code>
                                    <div className="col-span-2 text-sm text-neutral-600">Object containing name, email, address, etc.</div>
                                </div>
                                <div className="py-4 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
                                    <code className="text-sm font-semibold text-blue-600 font-mono">items</code>
                                    <div className="col-span-2 text-sm text-neutral-600">Array of items. Each item must have description, quantity, and unitPrice.</div>
                                </div>
                                <div className="py-4 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
                                    <code className="text-sm font-semibold text-neutral-500 font-mono">currency</code>
                                    <div className="col-span-2 text-sm text-neutral-600">Optional. Default is 'INR'.</div>
                                </div>
                                <div className="py-4 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
                                    <code className="text-sm font-semibold text-neutral-500 font-mono">templateId</code>
                                    <div className="col-span-2 text-sm text-neutral-600">Optional. ID of the invoice template style.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8 w-full">
                        {/* Request */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Example Request</h3>
                            <CodeTabs examples={generateInvoiceExamples} />
                        </div>

                        {/* Response */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Sample Response</h3>
                            {/* VS Code Style Response Block */}
                            <div className="rounded-xl overflow-hidden border border-[#333333] bg-[#1e1e1e] shadow-xl font-sans">
                                <div className="flex items-center justify-between bg-[#252526] px-4 h-11 border-b border-[#333333]">
                                    <div className="flex items-center gap-2 mr-4">
                                        <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]"></div>
                                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]"></div>
                                        <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]"></div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                                        <CheckCircle2 className="w-3 h-3" />
                                        <span>200 OK</span>
                                    </div>
                                </div>
                                <pre className="p-5 overflow-x-auto text-[13.5px] font-mono leading-relaxed text-[#ce9178] custom-scrollbar bg-[#1e1e1e]">
                                    {`{
  "success": true,
  "invoice": {
    "id": "inv_123456789",
    "number": "INV-2024-001",
    "date": "2024-01-09",
    "totalAmount": 472000,
    "pdfUrl": "https://cdn.rasid.in/invoices/inv_123456789.pdf",
    "status": "PAID"
  },
  "quota_remaining": 9998
}`}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Errors Section */}
                <div className="border-t border-neutral-200 pt-16">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-8">Errors & Status Codes</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="p-6 rounded-xl bg-white border border-neutral-200 shadow-sm">
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 mb-4">
                                401 Unauthorized
                            </div>
                            <p className="text-sm text-neutral-600">
                                Your API key is missing or invalid. Please check your headers.
                            </p>
                        </div>
                        <div className="p-6 rounded-xl bg-white border border-neutral-200 shadow-sm">
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 mb-4">
                                400 Bad Request
                            </div>
                            <p className="text-sm text-neutral-600">
                                Missing required fields (like buyer name or items) or invalid data formats.
                            </p>
                        </div>
                        <div className="p-6 rounded-xl bg-white border border-neutral-200 shadow-sm">
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-800 mb-4">
                                429 Too Many Requests
                            </div>
                            <p className="text-sm text-neutral-600">
                                You have exceeded your API rate limit or monthly quota.
                            </p>
                        </div>
                    </div>
                </div>

            </main>

            {/* Footer */}
            {/* Footer */}
            <footer className="border-t border-neutral-200 py-8 bg-white">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-500">
                    <p>© {new Date().getFullYear()} Rasid Platform. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-neutral-900 transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-neutral-900 transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
