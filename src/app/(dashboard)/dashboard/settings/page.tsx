'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Input, Textarea, Button, ImageUpload, Select } from '@/components/ui';
import { Save, Building2, FileText, CheckCircle2, Globe, Mail, MessageSquare, ExternalLink, Info, Palette } from 'lucide-react';
import { CURRENCIES } from '@/lib/currencies';
import { INDIAN_STATES } from '@/lib/constants/indian-states';

import { INVOICE_TEMPLATES } from '@/lib/invoice-templates';
import { PaymentMethodsSettings } from '@/components/dashboard/PaymentMethodsSettings';

interface SellerProfile {
    businessName: string;
    logo?: string | null;
    businessAddress: string;
    phone: string;
    email: string;
    taxId: string;
    state?: string;
    integrations: {
        whatsapp?: {
            phoneNumberId: string;
            accessToken: string;
            businessAccountId?: string;
        };
        email?: {
            smtpHost: string;
            smtpPort: string;
            smtpUser: string;
            smtpPass: string;
            fromEmail: string;
        };
    };
    invoiceDefaults?: {
        currency: string;
        taxRate: string;
        terms: string;
        autoSend?: boolean;
        templateId?: string;
    };
}

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'integrations' | 'preferences'>('general');
    const [initialProfile, setInitialProfile] = useState<SellerProfile | null>(null);

    const [profile, setProfile] = useState<SellerProfile>({
        businessName: '',
        logo: null,
        businessAddress: '',
        phone: '',
        email: '',
        taxId: '',
        state: '',
        integrations: {
            whatsapp: { phoneNumberId: '', accessToken: '', businessAccountId: '' },
            email: { smtpHost: '', smtpPort: '', smtpUser: '', smtpPass: '', fromEmail: '' }
        },
        invoiceDefaults: {
            currency: 'INR',
            taxRate: '0',
            terms: '',
            autoSend: false,
            templateId: 'classic'
        }
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('/api/profile');
                const data = await response.json();
                if (data.success) {
                    // Merge fetched data with default structure to prevent null errors
                    const mergedProfile = {
                        ...data.data,
                        integrations: {
                            whatsapp: { ...profile.integrations.whatsapp, ...data.data.integrations?.whatsapp },
                            email: { ...profile.integrations.email, ...data.data.integrations?.email }
                        },
                        invoiceDefaults: data.data.invoiceDefaults || profile.invoiceDefaults,
                    };
                    setProfile(prev => ({ ...prev, ...mergedProfile }));
                    setInitialProfile(mergedProfile);
                }
            } catch (error) {
                console.error('Failed to fetch profile:', error);
            }
        };
        fetchProfile();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSaved(false);

        try {
            const response = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile),
            });

            if (response.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (error) {
            console.error('Failed to save profile:', error);
        } finally {
            setLoading(false);
        }
    };



    const updateIntegration = (type: 'whatsapp' | 'email', key: string, value: string) => {
        setProfile({
            ...profile,
            integrations: {
                ...profile.integrations,
                [type]: {
                    ...profile.integrations[type],
                    [key]: value,
                },
            },
        });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Settings</h1>
                    <p className="text-neutral-500 mt-1">Manage your business profile and preferences</p>
                </div>
                <div className="flex bg-neutral-100 p-1.5 rounded-xl md:self-auto overflow-x-auto no-scrollbar w-full md:w-auto">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 min-w-[100px] md:min-w-[120px] rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'general' ? 'bg-white text-neutral-900 border border-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'
                            }`}
                    >
                        General
                    </button>
                    <button
                        onClick={() => setActiveTab('integrations')}
                        className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 min-w-[100px] md:min-w-[120px] rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'integrations' ? 'bg-white text-neutral-900 border border-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'
                            }`}
                    >
                        Integrations
                    </button>
                    <button
                        onClick={() => setActiveTab('preferences')}
                        className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 min-w-[100px] md:min-w-[120px] rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'preferences' ? 'bg-white text-neutral-900 border border-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'
                            }`}
                    >
                        Preferences
                    </button>
                </div>
            </div>

            <div className="space-y-6">

                {/* GENERAL TAB */}
                {activeTab === 'general' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <Card>
                            <CardHeader
                                title="Business Information"
                                description="This information will appear on your invoices"
                            />
                            <CardBody className="space-y-6">
                                {/* Row 1: Logo Upload & Current Logo */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <ImageUpload
                                        label="Upload Logo"
                                        value={profile.logo || null}
                                        onChange={(base64) => setProfile({ ...profile, logo: base64 })}
                                        onRemove={() => setProfile({ ...profile, logo: null })}
                                        className="w-full"
                                        previewClassName="w-full h-48"
                                    />

                                    <div>
                                        <p className="block text-sm font-medium text-neutral-700 mb-2">Current Logo</p>
                                        <div className="w-full h-48 bg-neutral-50 rounded-2xl flex items-center justify-center overflow-hidden border border-neutral-200 shadow-sm relative p-4">
                                            {profile.logo ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={profile.logo} alt="Business Logo" className="w-full h-full object-contain" />
                                            ) : (
                                                <span className="text-3xl font-bold text-neutral-300">
                                                    {profile.businessName ? profile.businessName.charAt(0).toUpperCase() : 'B'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Row 2: Business Name & Email */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Business Name"
                                        value={profile.businessName}
                                        onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                                        required
                                    />
                                    <Input
                                        label="Business Email"
                                        type="email"
                                        value={profile.email}
                                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                        placeholder="contact@example.com"
                                    />
                                </div>

                                {/* Row 3: Address */}
                                <Textarea
                                    label="Business Address"
                                    value={profile.businessAddress}
                                    onChange={(e) => setProfile({ ...profile, businessAddress: e.target.value })}
                                    rows={2}
                                    placeholder="123 Main Street, City, State, PIN"
                                />

                                {/* Row 4: Phone & Tax ID */}
                                {/* Row 4: Phone, State & Tax ID */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Input
                                        label="Phone Number"
                                        type="tel"
                                        value={profile.phone}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        placeholder="+91 98765 43210"
                                    />
                                    {/* State Dropdown */}
                                    <Select
                                        label="State / Province"
                                        value={profile.state || ''}
                                        onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                                        className="appearance-none"
                                    >
                                        <option value="">Select State</option>
                                        {INDIAN_STATES.map((state) => (
                                            <option key={state} value={state}>
                                                {state}
                                            </option>
                                        ))}
                                    </Select>
                                    <Input
                                        label="GSTIN / Tax ID"
                                        value={profile.taxId}
                                        onChange={(e) => setProfile({ ...profile, taxId: e.target.value })}
                                        placeholder="29AAAAA0000A1Z5"
                                    />
                                </div>
                            </CardBody>
                        </Card>

                        <PaymentMethodsSettings />
                    </div>
                )
                }

                {/* INTEGRATIONS TAB */}
                {
                    activeTab === 'integrations' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <Card>
                                <CardHeader
                                    title="WhatsApp Integration"
                                    description="Configure Meta WhatsApp Cloud API to send invoices"
                                />
                                <CardBody className="space-y-5">
                                    <div className="flex flex-col gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <MessageSquare className="w-5 h-5 text-emerald-600" />
                                            <p className="text-sm text-emerald-700">
                                                Requires a Meta Developer account with WhatsApp Cloud API enabled.
                                            </p>
                                        </div>
                                        <div className="pl-8">
                                            <a
                                                href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs font-medium text-emerald-700 hover:text-emerald-800 underline underline-offset-2 inline-flex items-center gap-1"
                                            >
                                                View WhatsApp Cloud API Guide
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </div>
                                    <div className="grid gap-5">
                                        <Input
                                            label="Phone Number ID"
                                            value={profile.integrations.whatsapp?.phoneNumberId || ''}
                                            onChange={(e) => updateIntegration('whatsapp', 'phoneNumberId', e.target.value)}
                                            placeholder="123456789012345"
                                        />
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 ml-1">
                                                <label className="block text-sm font-medium text-neutral-700">Permanent Access Token</label>
                                                <div className="group relative">
                                                    <div className="cursor-help text-neutral-400 hover:text-neutral-600 transition-colors">
                                                        <Info className="w-4 h-4" />
                                                    </div>
                                                    <div className="absolute right-0 bottom-full mb-2 w-72 p-3 bg-neutral-900/95 backdrop-blur-sm text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none md:pointer-events-auto">
                                                        <p className="leading-relaxed">
                                                            You need a System User Access Token with <strong>whatsapp_business_messaging</strong> permission.
                                                        </p>
                                                        <div className="absolute -bottom-1 right-1 w-2 h-2 bg-neutral-900 rotate-45"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <Input
                                                type="password"
                                                value={profile.integrations.whatsapp?.accessToken || ''}
                                                onChange={(e) => updateIntegration('whatsapp', 'accessToken', e.target.value)}
                                                placeholder="EAAG..."
                                            />
                                        </div>
                                        <Input
                                            label="Business Account ID (Optional)"
                                            value={profile.integrations.whatsapp?.businessAccountId || ''}
                                            onChange={(e) => updateIntegration('whatsapp', 'businessAccountId', e.target.value)}
                                            placeholder="123456789012345"
                                        />
                                    </div>
                                </CardBody>
                            </Card>

                            <Card>
                                <CardHeader
                                    title="Email Integration (SMTP)"
                                    description="Configure your own SMTP server for branded emails"
                                />
                                <CardBody className="space-y-6">
                                    <div className="flex flex-col gap-3 p-4 bg-violet-50 border border-violet-100 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-5 h-5 text-violet-600" />
                                            <p className="text-sm text-violet-700">
                                                Use your own SMTP server (Gmail, Outlook, AWS SES) to send invoices.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Provider Selection */}
                                    <div className="space-y-3">
                                        <label className="block text-sm font-medium text-neutral-700 ml-1">Email Provider</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {[
                                                {
                                                    id: 'GMAIL',
                                                    name: '',
                                                    host: 'smtp.gmail.com',
                                                    port: '587',
                                                    icon: (
                                                        <svg viewBox="52 42 88 66" className="w-auto h-6" xmlns="http://www.w3.org/2000/svg">
                                                            <path fill="#4285f4" d="M58 108h14V74L52 59v43c0 3.32 2.69 6 6 6" />
                                                            <path fill="#34a853" d="M120 108h14c3.32 0 6-2.69 6-6V59l-20 15" />
                                                            <path fill="#fbbc04" d="M120 48v26l20-15v-8c0-7.42-8.47-11.65-14.4-7.2" />
                                                            <path fill="#ea4335" d="M72 74V48l24 18 24-18v26L96 92" />
                                                            <path fill="#c5221f" d="M52 51v8l20 15V48l-5.6-4.2c-5.94-4.45-14.4-.22-14.4 7.2" />
                                                        </svg>
                                                    ),
                                                    className: 'hover:border-[#EA4335]/30 hover:bg-[#EA4335]/5'
                                                },
                                                {
                                                    id: 'OUTLOOK',
                                                    name: '',
                                                    host: 'smtp.office365.com',
                                                    port: '587',
                                                    icon: (
                                                        <svg viewBox="0 0 1831.085 1703.335" className="w-auto h-6" xmlns="http://www.w3.org/2000/svg">
                                                            <path fill="#0A2767" d="M1831.083,894.25c0.1-14.318-7.298-27.644-19.503-35.131h-0.213l-0.767-0.426l-634.492-375.585  c-2.74-1.851-5.583-3.543-8.517-5.067c-24.498-12.639-53.599-12.639-78.098,0c-2.934,1.525-5.777,3.216-8.517,5.067L446.486,858.693  l-0.766,0.426c-19.392,12.059-25.337,37.556-13.278,56.948c3.553,5.714,8.447,10.474,14.257,13.868l634.492,375.585  c2.749,1.835,5.592,3.527,8.517,5.068c24.498,12.639,53.599,12.639,78.098,0c2.925-1.541,5.767-3.232,8.517-5.068l634.492-375.585  C1823.49,922.545,1831.228,908.923,1831.083,894.25z" />
                                                            <path fill="#0364B8" d="M520.453,643.477h416.38v381.674h-416.38V643.477z M1745.917,255.5V80.908  c1-43.652-33.552-79.862-77.203-80.908H588.204C544.552,1.046,510,37.256,511,80.908V255.5l638.75,170.333L1745.917,255.5z" />
                                                            <path fill="#0078D4" d="M511,255.5h425.833v383.25H511V255.5z" />
                                                            <path fill="#28A8EA" d="M1362.667,255.5H936.833v383.25L1362.667,1022h383.25V638.75L1362.667,255.5z" />
                                                            <path fill="#0078D4" d="M936.833,638.75h425.833V1022H936.833V638.75z" />
                                                            <path fill="#0364B8" d="M936.833,1022h425.833v383.25H936.833V1022z" />
                                                            <path fill="#14447D" d="M520.453,1025.151h416.38v346.969h-416.38V1025.151z" />
                                                            <path fill="#0078D4" d="M1362.667,1022h383.25v383.25h-383.25V1022z" />
                                                            <path fill="#35B8F1" d="M1811.58,927.593l-0.809,0.426l-634.492,356.848c-2.768,1.703-5.578,3.321-8.517,4.769  c-10.777,5.132-22.481,8.029-34.407,8.517l-34.663-20.27c-2.929-1.47-5.773-3.105-8.517-4.897L447.167,906.003h-0.298  l-21.036-11.753v722.384c0.328,48.196,39.653,87.006,87.849,86.7h1230.914c0.724,0,1.363-0.341,2.129-0.341  c10.18-0.651,20.216-2.745,29.808-6.217c4.145-1.756,8.146-3.835,11.966-6.217c2.853-1.618,7.75-5.152,7.75-5.152  c21.814-16.142,34.726-41.635,34.833-68.772V894.25C1831.068,908.067,1823.616,920.807,1811.58,927.593z" />
                                                            <path opacity="0.5" fill="#0A2767" d="M1797.017,891.397v44.287l-663.448,456.791L446.699,906.301  c0-0.235-0.191-0.426-0.426-0.426l0,0l-63.023-37.899v-31.938l25.976-0.426l54.932,31.512l1.277,0.426l4.684,2.981  c0,0,645.563,368.346,647.267,369.197l24.698,14.478c2.129-0.852,4.258-1.703,6.813-2.555  c1.278-0.852,640.879-360.681,640.879-360.681L1797.017,891.397z" />
                                                            <path fill="#1490DF" d="M1811.58,927.593l-0.809,0.468l-634.492,356.848c-2.768,1.703-5.578,3.321-8.517,4.769  c-24.641,12.038-53.457,12.038-78.098,0c-2.918-1.445-5.76-3.037-8.517-4.769L446.657,928.061l-0.766-0.468  c-12.25-6.642-19.93-19.409-20.057-33.343v722.384c0.305,48.188,39.616,87.004,87.803,86.7c0.001,0,0.002,0,0.004,0h1229.636  c48.188,0.307,87.5-38.509,87.807-86.696c0-0.001,0-0.002,0-0.004V894.25C1831.068,908.067,1823.616,920.807,1811.58,927.593z" />
                                                            <path fill="#28A8EA" d="M514.833,1703.333h1228.316c18.901,0.096,37.335-5.874,52.59-17.033l-697.089-408.331  c-2.929-1.47-5.773-3.105-8.517-4.897L447.125,906.088h-0.298l-20.993-11.838v719.914  C425.786,1663.364,465.632,1703.286,514.833,1703.333C514.832,1703.333,514.832,1703.333,514.833,1703.333z" />
                                                            <path fill="#50D9FF" d="M1362.667,255.5h383.25v383.25h-383.25V255.5z" />
                                                        </svg>
                                                    ),
                                                    className: 'hover:border-[#0078D4]/30 hover:bg-[#0078D4]/5'
                                                },
                                                {
                                                    id: 'HOSTINGER',
                                                    name: '',
                                                    host: 'smtp.hostinger.com',
                                                    port: '465',
                                                    icon: (
                                                        <svg viewBox="0 0 150 30" className="w-auto h-6" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M45.1114 8.89822H47.9253V21.3612H45.1114V16.0739H40.3857V21.3612H37.5718V8.89822H40.3857V13.6637H45.1114V8.89822Z" />
                                                            <path d="M54.4949 15.1209C54.4949 15.732 54.5698 16.2835 54.7201 16.7752C54.8704 17.267 55.0871 17.6895 55.3698 18.0431C55.6518 18.3972 55.9978 18.6695 56.4069 18.8612C56.8155 19.0535 57.2843 19.1496 57.8137 19.1496C58.3305 19.1496 58.7966 19.0535 59.2117 18.8612C59.6261 18.6695 59.9752 18.3972 60.2574 18.0431C60.5399 17.6895 60.7568 17.267 60.9071 16.7752C61.0574 16.2835 61.1326 15.732 61.1326 15.1209C61.1326 14.5091 61.0574 13.9546 60.9071 13.4569C60.7568 12.9595 60.5399 12.5342 60.2574 12.1802C59.9752 11.8266 59.6261 11.5535 59.2117 11.3621C58.7966 11.1702 58.3305 11.0744 57.8137 11.0744C57.2843 11.0744 56.8155 11.1732 56.4069 11.3709C55.9978 11.5688 55.6518 11.8447 55.3698 12.1985C55.0871 12.5521 54.8704 12.9776 54.7201 13.475C54.5698 13.9729 54.4949 14.5214 54.4949 15.1209ZM64.0369 15.1209C64.0369 16.1877 63.8773 17.1262 63.5593 17.935C63.2402 18.7445 62.8041 19.4219 62.2513 19.9672C61.6982 20.5131 61.0397 20.9235 60.2762 21.1991C59.5128 21.4753 58.6918 21.6131 57.8144 21.6131C56.9604 21.6131 56.1551 21.4753 55.3974 21.1991C54.6398 20.9235 53.9782 20.5131 53.4133 19.9672C52.8478 19.4219 52.4034 18.7445 52.0786 17.935C51.754 17.1262 51.5913 16.1877 51.5913 15.1209C51.5913 14.0537 51.7598 13.1154 52.0965 12.3064C52.4329 11.4969 52.8872 10.8164 53.4584 10.2649C54.0292 9.71341 54.6907 9.29998 55.4426 9.02411C56.1937 8.74799 56.9846 8.60993 57.8144 8.60993C58.6679 8.60993 59.4734 8.74799 60.2313 9.02411C60.9887 9.29998 61.65 9.71341 62.2152 10.2649C62.7802 10.8164 63.2253 11.4969 63.5499 12.3064C63.8748 13.1154 64.0369 14.0537 64.0369 15.1209Z" />
                                                            <path d="M71.1123 19.2212C71.5091 19.2212 71.8367 19.1885 72.0952 19.1221C72.3537 19.0565 72.5613 18.9667 72.7174 18.852C72.8735 18.7386 72.982 18.6038 73.0423 18.4479C73.1025 18.2922 73.1326 18.1182 73.1326 17.9263C73.1326 17.5189 72.9399 17.1797 72.5552 16.9104C72.1704 16.6403 71.5091 16.3498 70.5713 16.0375C70.1623 15.8942 69.7534 15.7289 69.3446 15.5433C68.9358 15.3578 68.569 15.1239 68.2444 14.842C67.9201 14.5603 67.6553 14.2186 67.451 13.8164C67.2464 13.4151 67.1443 12.9267 67.1443 12.3511C67.1443 11.7755 67.2525 11.2569 67.4689 10.7954C67.6855 10.3337 67.992 9.94143 68.389 9.61728C68.7857 9.29338 69.2664 9.04517 69.8316 8.87089C70.3968 8.69737 71.0339 8.60986 71.7436 8.60986C72.5853 8.60986 73.3129 8.70039 73.9263 8.87995C74.5391 9.05975 75.0443 9.25792 75.441 9.47368L74.6297 11.6857C74.2806 11.5059 73.8927 11.3469 73.4662 11.2089C73.0392 11.0713 72.5252 11.0019 71.9242 11.0019C71.2506 11.0019 70.7666 11.0955 70.472 11.2811C70.1774 11.4669 70.0298 11.7518 70.0298 12.1351C70.0298 12.3632 70.0843 12.5553 70.1925 12.7107C70.3005 12.8666 70.4541 13.0074 70.6523 13.1334C70.8508 13.2592 71.0793 13.3733 71.3381 13.4749C71.5961 13.577 71.8818 13.6817 72.1948 13.7895C72.8438 14.0297 73.409 14.2663 73.8902 14.5002C74.3709 14.7341 74.7709 15.0069 75.0897 15.3185C75.408 15.6301 75.6456 15.996 75.8022 16.4157C75.9581 16.8357 76.0365 17.3449 76.0365 17.9439C76.0365 19.107 75.6274 20.0093 74.8098 20.6506C73.9921 21.2924 72.7595 21.6133 71.1123 21.6133C70.5592 21.6133 70.0601 21.5801 69.6152 21.5142C69.1703 21.4478 68.7766 21.3671 68.4339 21.2712C68.0913 21.1754 67.7965 21.0736 67.5498 20.9657C67.3034 20.8576 67.0961 20.756 66.9276 20.6597L67.7216 18.4298C68.0939 18.634 68.5539 18.8166 69.1015 18.978C69.6483 19.1402 70.3189 19.2212 71.1123 19.2212Z" />
                                                            <path d="M88.4327 8.89829V11.2903H84.6629V21.3613H81.8492V11.2903H78.0792V8.89829H88.4327Z" />
                                                            <path d="M91.5579 21.3616H94.3718V8.89834H91.5579V21.3616Z" />
                                                            <path d="M106.967 21.3613C106.162 19.9347 105.29 18.5261 104.352 17.135C103.414 15.744 102.416 14.4313 101.358 13.1963V21.3613H98.58V8.89832H100.871C101.267 9.29364 101.706 9.77925 102.187 10.3549C102.668 10.9305 103.158 11.5451 103.657 12.1985C104.156 12.8518 104.652 13.5293 105.145 14.2304C105.638 14.9318 106.101 15.606 106.534 16.2535V8.89832H109.33V21.3613H106.967Z" />
                                                            <path d="M119.634 11.0564C118.324 11.0564 117.376 11.419 116.793 12.1443C116.21 12.8698 115.919 13.8616 115.919 15.121C115.919 15.7319 115.99 16.2869 116.135 16.7843C116.279 17.2815 116.496 17.71 116.784 18.0699C117.073 18.4297 117.433 18.7086 117.866 18.9065C118.299 19.1042 118.804 19.203 119.381 19.203C119.694 19.203 119.962 19.197 120.184 19.1852C120.406 19.1733 120.602 19.1495 120.77 19.1132V14.7793H123.584V20.9478C123.247 21.0798 122.706 21.2204 121.961 21.37C121.215 21.5196 120.295 21.5951 119.201 21.5951C118.263 21.5951 117.412 21.451 116.649 21.1635C115.885 20.8753 115.233 20.4561 114.692 19.9044C114.151 19.3531 113.733 18.6754 113.438 17.8722C113.143 17.0695 112.996 16.1521 112.996 15.121C112.996 14.0777 113.159 13.1545 113.484 12.351C113.808 11.548 114.252 10.867 114.818 10.3098C115.383 9.75224 116.047 9.32976 116.811 9.04207C117.575 8.75413 118.389 8.60978 119.255 8.60978C119.844 8.60978 120.376 8.64926 120.851 8.72697C121.326 8.80518 121.735 8.89496 122.078 8.99706C122.421 9.09865 122.703 9.20352 122.926 9.31165C123.148 9.41954 123.307 9.50378 123.404 9.56364L122.592 11.8113C122.207 11.6076 121.765 11.4311 121.266 11.281C120.767 11.1311 120.223 11.0564 119.634 11.0564Z" />
                                                            <path d="M127.521 21.3613V8.89832H135.963V11.2542H130.335V13.6998H135.331V16.0021H130.335V19.0055H136.378V21.3613H127.521Z" />
                                                            <path d="M143.596 11.1462C143.392 11.1462 143.209 11.1522 143.046 11.164C142.884 11.1764 142.731 11.1884 142.586 11.2V14.5809H143.38C144.438 14.5809 145.195 14.4496 145.652 14.1855C146.109 13.9223 146.337 13.4724 146.337 12.8366C146.337 12.225 146.106 11.791 145.643 11.5325C145.18 11.2752 144.498 11.1462 143.596 11.1462ZM143.435 8.75414C145.311 8.75414 146.748 9.08659 147.746 9.75225C148.744 10.4177 149.243 11.4517 149.243 12.8547C149.243 13.7296 149.042 14.4405 148.639 14.986C148.236 15.5312 147.656 15.9602 146.898 16.2716C147.151 16.5836 147.415 16.9402 147.692 17.3418C147.968 17.7437 148.242 18.1634 148.513 18.601C148.783 19.0386 149.045 19.494 149.297 19.9673C149.549 20.4413 149.784 20.9058 150 21.3612H146.855C146.625 20.9536 146.393 20.5401 146.158 20.1204C145.922 19.701 145.681 19.2931 145.434 18.8972C145.187 18.5014 144.941 18.1272 144.701 17.7736C144.459 17.4195 144.217 17.0989 143.976 16.8107H142.587V21.3612H139.774V9.07754C140.387 8.95834 141.021 8.87384 141.676 8.82631C142.332 8.77803 142.918 8.75414 143.435 8.75414Z" />
                                                            <path d="M0.000249566 14.046V0.000497794L7.08916 3.78046V10.1086L16.4735 10.1132L23.6774 14.046H0.000249566ZM18.3925 8.95058V0L25.6725 3.6859V13.1797L18.3925 8.95058ZM18.3924 26.1177V19.8441L8.93577 19.8375C8.9446 19.8793 1.6123 15.8418 1.6123 15.8418L25.6725 15.9547V30L18.3924 26.1177ZM0 26.1177L0.000252212 16.9393L7.08916 21.0683V29.8033L0 26.1177Z" />
                                                        </svg>
                                                    ),
                                                    className: 'hover:border-[#673DE6]/30 hover:bg-[#673DE6]/5'
                                                },
                                                {
                                                    id: 'OTHER',
                                                    name: 'Other',
                                                    host: '',
                                                    port: '',
                                                    icon: <Mail className="w-6 h-6 text-neutral-400" />,
                                                    className: 'hover:border-neutral-300 hover:bg-neutral-50'
                                                }
                                            ].map((p) => {
                                                const currentHost = (profile.integrations.email?.smtpHost || '').trim().toLowerCase();
                                                const pHost = p.host.trim().toLowerCase();
                                                const knownHosts = ['smtp.gmail.com', 'smtp.office365.com', 'smtp.hostinger.com'];

                                                let activeLink = false;

                                                if (p.id === 'OTHER') {
                                                    activeLink = !knownHosts.includes(currentHost);
                                                } else {
                                                    activeLink = currentHost === pHost;
                                                }

                                                return (
                                                    <button
                                                        key={p.id}
                                                        type="button"
                                                        onClick={() => {
                                                            const currentHost = profile.integrations.email?.smtpHost;

                                                            // Prevent redundant
                                                            if (p.id !== 'OTHER' && currentHost === p.host) return;

                                                            // Check restoration availability
                                                            // NOTE: `initialProfile` and `setInitialProfile` are not defined in the provided snippet.
                                                            // This change assumes they are defined elsewhere in the full component.
                                                            const savedEmail = initialProfile?.integrations?.email;
                                                            // Determine if we should restore settings from DB
                                                            // Restore if the target provider matches what is currently saved in the DB
                                                            let shouldRestore = false;
                                                            if (p.id !== 'OTHER') {
                                                                shouldRestore = savedEmail?.smtpHost === p.host;
                                                            } else {
                                                                // For OTHER, restore if the saved host is NOT a known one
                                                                const knownHosts = ['smtp.gmail.com', 'smtp.office365.com', 'smtp.hostinger.com'];
                                                                shouldRestore = !!savedEmail?.smtpHost && !knownHosts.includes(savedEmail.smtpHost.toLowerCase());
                                                            }

                                                            if (p.id !== 'OTHER') {
                                                                // Provider Preset Logic
                                                                const updates = {
                                                                    smtpHost: p.host,
                                                                    smtpPort: p.port,
                                                                    smtpUser: (shouldRestore && savedEmail?.smtpUser) ? (savedEmail.smtpUser || '') : '',
                                                                    smtpPass: (shouldRestore && savedEmail?.smtpPass) ? (savedEmail.smtpPass || '') : '',
                                                                    fromEmail: (shouldRestore && savedEmail?.fromEmail) ? (savedEmail.fromEmail || '') : ''
                                                                };

                                                                // Gmail Auto-fill (only if not restored and fields are empty)
                                                                if (!updates['smtpUser'] && p.id === 'GMAIL' && profile.email?.includes('@gmail.com')) {
                                                                    updates['smtpUser'] = profile.email;
                                                                    updates['fromEmail'] = profile.email;
                                                                }

                                                                setProfile(prev => ({
                                                                    ...prev,
                                                                    integrations: {
                                                                        ...prev.integrations,
                                                                        email: {
                                                                            ...prev.integrations.email,
                                                                            ...updates
                                                                        }
                                                                    }
                                                                }));
                                                            } else {
                                                                // "OTHER" Logic
                                                                setProfile(prev => ({
                                                                    ...prev,
                                                                    integrations: {
                                                                        ...prev.integrations,
                                                                        email: {
                                                                            ...prev.integrations.email,
                                                                            smtpHost: (shouldRestore && savedEmail?.smtpHost) ? (savedEmail.smtpHost || '') : '',
                                                                            smtpPort: (shouldRestore && savedEmail?.smtpPort) ? (savedEmail.smtpPort || '') : '',
                                                                            smtpUser: (shouldRestore && savedEmail?.smtpUser) ? (savedEmail.smtpUser || '') : '',
                                                                            smtpPass: (shouldRestore && savedEmail?.smtpPass) ? (savedEmail.smtpPass || '') : '',
                                                                            fromEmail: (shouldRestore && savedEmail?.fromEmail) ? (savedEmail.fromEmail || '') : ''
                                                                        }
                                                                    }
                                                                }));
                                                            }
                                                        }}
                                                        className={`
                                                        relative flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-all duration-200 group
                                                        ${activeLink
                                                                ? `border-neutral-900 bg-neutral-900 text-white shadow-md scale-[1.02] ring-1 ring-neutral-900/5`
                                                                : `bg-white border-neutral-100 text-neutral-600 ${p.className}`
                                                            }
                                                    `}
                                                    >
                                                        <div className={`transition-transform duration-200 ${activeLink ? 'scale-110' : 'group-hover:scale-110'}`}>
                                                            {p.icon}
                                                        </div>
                                                        {p.name && (
                                                            <span className={`font-semibold text-xs tracking-wide ${activeLink ? 'text-white' : 'text-neutral-600'}`}>
                                                                {p.name}
                                                            </span>
                                                        )}
                                                        {activeLink && (
                                                            <div className="absolute top-2 right-2 animate-in zoom-in duration-200">
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-5">
                                        <Input
                                            label="SMTP Host"
                                            value={profile.integrations.email?.smtpHost || ''}
                                            onChange={(e) => updateIntegration('email', 'smtpHost', e.target.value)}
                                            placeholder="smtp.gmail.com"
                                        />
                                        <Input
                                            label="SMTP Port"
                                            value={profile.integrations.email?.smtpPort || ''}
                                            onChange={(e) => updateIntegration('email', 'smtpPort', e.target.value)}
                                            placeholder="587"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <Input
                                            label="SMTP User"
                                            value={profile.integrations.email?.smtpUser || ''}
                                            onChange={(e) => updateIntegration('email', 'smtpUser', e.target.value)}
                                            placeholder="you@yourdomain.com"
                                        />
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 ml-1">
                                                <label className="block text-sm font-medium text-neutral-700">SMTP Password</label>
                                                <div className="group relative">
                                                    <div className="cursor-help text-neutral-400 hover:text-neutral-600 transition-colors">
                                                        <Info className="w-4 h-4" />
                                                    </div>
                                                    <div className="absolute right-0 bottom-full mb-2 w-72 p-3 bg-neutral-900/95 backdrop-blur-sm text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none md:pointer-events-auto">
                                                        <p className="leading-relaxed">
                                                            {profile.integrations.email?.smtpHost === 'smtp.gmail.com' ? (
                                                                <>
                                                                    If you have 2FA enabled, you <strong>must</strong> use an App Password.
                                                                    <br />
                                                                    <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 underline mt-1 block pointer-events-auto">
                                                                        Create App Password &rarr;
                                                                    </a>
                                                                </>
                                                            ) : (
                                                                "Use your email account password or an app-specific password if 2FA is enabled."
                                                            )}
                                                        </p>
                                                        <div className="absolute -bottom-1 right-1 w-2 h-2 bg-neutral-900 rotate-45"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <Input
                                                type="password"
                                                value={profile.integrations.email?.smtpPass || ''}
                                                onChange={(e) => updateIntegration('email', 'smtpPass', e.target.value)}
                                                placeholder="App Password / API Key"
                                            />
                                        </div>
                                    </div>

                                    <Input
                                        label="From Email Address"
                                        value={profile.integrations.email?.fromEmail || ''}
                                        onChange={(e) => updateIntegration('email', 'fromEmail', e.target.value)}
                                        placeholder="billing@yourdomain.com"
                                    />

                                    {/* Helper Link Footer */}
                                    <div className="text-sm text-neutral-500 pl-1">
                                        {profile.integrations.email?.smtpHost === 'smtp.gmail.com' && (
                                            <a href="https://support.google.com/mail/answer/7126229" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-neutral-900 underline underline-offset-2 transition-colors">
                                                Gmail SMTP Settings Guide <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                        {profile.integrations.email?.smtpHost === 'smtp.office365.com' && (
                                            <a href="https://support.microsoft.com/en-us/office/pop-imap-and-smtp-settings-8361e398-8af4-4e97-b147-6c6c4ac95353" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-neutral-900 underline underline-offset-2 transition-colors">
                                                Outlook SMTP Settings Guide <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                        {profile.integrations.email?.smtpHost === 'smtp.hostinger.com' && (
                                            <a href="https://support.hostinger.com/en/articles/1583238-how-to-find-email-configuration-details-for-your-domain" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-neutral-900 underline underline-offset-2 transition-colors">
                                                Hostinger SMTP Settings Guide <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    )
                }

                {/* PREFERENCES TAB */}
                {
                    activeTab === 'preferences' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <Card>
                                <CardHeader
                                    title="Invoice Defaults"
                                    description="Default settings for new invoices"
                                />
                                <CardBody className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-neutral-700">
                                            Default Currency
                                        </label>
                                        <select
                                            value={profile.invoiceDefaults?.currency || 'INR'}
                                            onChange={(e) => setProfile({
                                                ...profile,
                                                invoiceDefaults: { ...profile.invoiceDefaults!, currency: e.target.value }
                                            })}
                                            className="w-full h-11 px-3.5 text-sm bg-white border border-neutral-200 rounded-lg text-neutral-900 transition-all duration-200 hover:border-neutral-300 focus:outline-none focus:border-neutral-900 focus:ring-[3px] focus:ring-neutral-900/5"
                                        >
                                            {CURRENCIES.map(c => (
                                                <option key={c.code} value={c.code}>
                                                    {c.code} ({c.symbol}) - {c.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-neutral-700">
                                            Default Tax Rate (%)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={profile.invoiceDefaults?.taxRate || '0'}
                                                onChange={(e) => setProfile({
                                                    ...profile,
                                                    invoiceDefaults: { ...profile.invoiceDefaults!, taxRate: e.target.value }
                                                })}
                                                className="w-full h-11 px-3.5 text-sm bg-white border border-neutral-200 rounded-lg text-neutral-900 transition-all duration-200 hover:border-neutral-300 focus:outline-none focus:border-neutral-900 focus:ring-[3px] focus:ring-neutral-900/5 placeholder:text-neutral-400"
                                                placeholder="0.00"
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <span className="text-neutral-500 text-sm">%</span>
                                            </div>
                                        </div>
                                    </div>


                                    <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <label className="text-base font-medium text-neutral-900">Auto-send Invoices</label>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wide ${profile.invoiceDefaults?.autoSend
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-neutral-200 text-neutral-600'
                                                    }`}>
                                                    {profile.invoiceDefaults?.autoSend ? 'Enabled' : 'Disabled'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-neutral-500">
                                                Automatically email or WhatsApp the invoice to the customer upon creation.
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={profile.invoiceDefaults?.autoSend || false}
                                                onChange={(e) => setProfile({
                                                    ...profile,
                                                    invoiceDefaults: {
                                                        currency: profile.invoiceDefaults?.currency || 'INR',
                                                        taxRate: profile.invoiceDefaults?.taxRate || '0',
                                                        terms: profile.invoiceDefaults?.terms || '',
                                                        autoSend: e.target.checked
                                                    }
                                                })}
                                            />
                                            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <Textarea
                                        label="Default Terms & Conditions"
                                        rows={3}
                                        placeholder="Payment is due within 30 days of invoice date."
                                        value={profile.invoiceDefaults?.terms || ''}
                                        onChange={(e) => setProfile({
                                            ...profile,
                                            invoiceDefaults: { ...profile.invoiceDefaults!, terms: e.target.value }
                                        })}
                                    />
                                </CardBody>
                            </Card>

                            {/* Premium Invoice Templates */}
                            <Card className="overflow-hidden">
                                <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                            <Palette className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">Premium Invoice Templates</h3>
                                            <p className="text-sm text-neutral-300">Choose your preferred invoice design for PDF generation</p>
                                        </div>
                                    </div>
                                </div>
                                <CardBody className="p-6">
                                    {/* Template Grid - 2 per row with realistic invoice previews */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {INVOICE_TEMPLATES.map((template) => {
                                            const isSelected = (profile.invoiceDefaults?.templateId || 'classic') === template.id;
                                            return (
                                                <button
                                                    key={template.id}
                                                    type="button"
                                                    onClick={() => setProfile({
                                                        ...profile,
                                                        invoiceDefaults: {
                                                            ...profile.invoiceDefaults!,
                                                            templateId: template.id
                                                        }
                                                    })}
                                                    className={`relative group rounded-2xl border-2 transition-all duration-300 text-left hover:shadow-xl overflow-hidden ${isSelected
                                                        ? '!border-[#10B981] !shadow-lg !shadow-[#10B981]/20 !ring-1 !ring-[#10B981]/50 bg-[#10B981]/5'
                                                        : 'border-neutral-200 hover:border-neutral-400'
                                                        }`}
                                                >

                                                    {/* Invoice Template Preview Image */}
                                                    <div className="aspect-[3/4] bg-neutral-50 overflow-hidden">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={`/template-images/${template.id === 'corporate' ? 'corporate-professional' : template.id === 'executive' ? 'bold-executive' : template.id === 'elegant' ? 'elegant-serif' : template.id === 'startup' ? 'tech-startup' : template.id === 'creative' ? 'creative-agency' : template.id === 'consultant' ? 'consultant-pro' : template.id === 'retail' ? 'retail-commerce' : template.id === 'luxury' ? 'luxury-premium' : template.id}.png`}
                                                            alt={`${template.name} template preview`}
                                                            className="w-full h-full object-cover object-top"
                                                        />
                                                    </div>

                                                    {/* Template Info Footer */}
                                                    <div className="p-4 bg-white border-t border-neutral-100">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${template.category === 'professional' ? 'bg-blue-100 text-blue-700' :
                                                                    template.category === 'modern' ? 'bg-purple-100 text-purple-700' :
                                                                        template.category === 'creative' ? 'bg-pink-100 text-pink-700' :
                                                                            'bg-amber-100 text-amber-700'
                                                                    }`}>
                                                                    {template.category}
                                                                </span>
                                                                <h4 className="font-bold text-lg text-neutral-900 mt-1">{template.name}</h4>
                                                                <p className="text-sm text-neutral-500">{template.description}</p>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <div className="w-8 h-8 rounded-full border-2 border-white shadow-md" style={{ backgroundColor: template.colors.primary }} title="Primary" />
                                                                <div className="w-8 h-8 rounded-full border-2 border-white shadow-md" style={{ backgroundColor: template.colors.secondary }} title="Secondary" />
                                                                <div className="w-8 h-8 rounded-full border-2 border-white shadow-md" style={{ backgroundColor: template.colors.accent }} title="Accent" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Selected Template Info - More prominent */}
                                    <div className="mt-6 p-4 bg-gradient-to-r from-neutral-100 to-neutral-50 rounded-xl border border-neutral-200 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-neutral-900 flex items-center justify-center flex-shrink-0">
                                            <FileText className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-base font-semibold text-neutral-900">
                                                Currently Selected: <span className="text-blue-600">{INVOICE_TEMPLATES.find(t => t.id === (profile.invoiceDefaults?.templateId || 'classic'))?.name || 'Classic'}</span>
                                            </p>
                                            <p className="text-sm text-neutral-500 mt-0.5">
                                                This template will be applied to all new invoice PDFs and shared documents. Click Save to apply changes.
                                            </p>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    )
                }

                {/* Save Button */}
                <div className="flex items-center justify-end gap-4 pt-4 border-t border-neutral-200">
                    {saved && (
                        <span className="flex items-center gap-2 text-emerald-600 text-sm">
                            <CheckCircle2 className="w-4 h-4" />
                            Changes saved successfully
                        </span>
                    )}
                    <Button type="button" onClick={handleSubmit} loading={loading} className="px-8">
                        <Save className="w-4 h-4 mr-2" />
                        Save All Changes
                    </Button>
                </div>
            </div >
        </div >
    );
}
