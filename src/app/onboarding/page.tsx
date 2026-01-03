'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button, Input } from '@/components/ui';
import { motion } from 'framer-motion';
import { Upload, AlertCircle, Building2, Mail, Phone, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function OnboardingPage() {
    const { user } = useUser();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        businessName: '',
        businessAddress: '',
        phone: '',
        email: '',
        taxId: '',
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);

    useEffect(() => {
        if (user?.primaryEmailAddress?.emailAddress) {
            setFormData(prev => ({
                ...prev,
                email: user.primaryEmailAddress!.emailAddress
            }));
        }
    }, [user]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setLogoFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = new FormData();
            data.append('businessName', formData.businessName);
            data.append('businessAddress', formData.businessAddress);
            data.append('phone', formData.phone);
            data.append('email', formData.email);
            data.append('taxId', formData.taxId);
            if (logoFile) {
                data.append('logo', logoFile);
            }

            const response = await fetch('/api/user/onboarding', {
                method: 'POST',
                body: data,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to save business details. Please try again.');
            }

            router.push('/dashboard');
        } catch (err: any) {
            console.error('Onboarding error:', err);
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen grid lg:grid-cols-2 overflow-hidden">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 relative overflow-hidden p-8">
                {/* Animated Background */}
                <div className="absolute inset-0">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]"
                    />
                    <motion.div
                        animate={{
                            scale: [1.2, 1, 1.2],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[150px]"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10 max-w-md text-center"
                >
                    <Link href="/" className="inline-block mb-8">
                        <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center mx-auto overflow-hidden">
                            <Image
                                src="/logos/Rasid_Logo.png"
                                alt="Rasid Logo"
                                width={64}
                                height={64}
                                className="object-contain"
                            />
                        </div>
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white tracking-tight leading-tight">
                        Welcome to Rasid
                    </h1>
                    <p className="text-base text-neutral-400 leading-relaxed">
                        Set up your business profile to create professional invoices.
                    </p>

                    {/* Feature Highlights */}
                    <div className="mt-8 space-y-3 text-left">
                        {[
                            { icon: FileText, text: 'Generate professional invoices' },
                            { icon: Mail, text: 'Send via Email & WhatsApp' },
                            { icon: Building2, text: 'Manage multiple businesses' },
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                                className="flex items-center gap-3 text-neutral-300"
                            >
                                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                                    <feature.icon className="w-4 h-4 text-emerald-400" />
                                </div>
                                <span className="text-sm">{feature.text}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex items-center justify-center p-4 lg:p-8 bg-neutral-50 relative overflow-y-auto">
                {/* Subtle Background Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-50" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-md relative z-10"
                >
                    {/* Card Container */}
                    <div className="bg-white rounded-2xl shadow-lg shadow-neutral-200/50 border border-neutral-200/80 p-5 lg:p-6">
                        {/* Mobile Logo */}
                        <div className="lg:hidden flex justify-center mb-6">
                            <Link href="/" className="flex items-center gap-2">
                                <Image
                                    src="/logos/Rasid_Logo.png"
                                    alt="Rasid Logo"
                                    width={32}
                                    height={32}
                                    className="object-contain"
                                />
                                <span className="text-lg font-bold text-neutral-900">Rasid</span>
                            </Link>
                        </div>

                        {/* Header */}
                        <div className="text-center lg:text-left mb-4">
                            <h2 className="text-lg lg:text-xl font-bold text-neutral-900 tracking-tight">
                                Business Details
                            </h2>
                            <p className="text-neutral-500 mt-0.5 text-sm">
                                Enter your brand information.
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-2 mb-4"
                            >
                                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
                                <span className="text-red-600">{error}</span>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-3">
                            {/* Logo Upload */}
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-neutral-700">
                                    Business Logo <span className="text-neutral-400 font-normal">(Optional)</span>
                                </label>
                                <div className="flex items-center gap-4 p-3 rounded-xl bg-neutral-50 border border-neutral-200 border-dashed">
                                    <div className="w-12 h-12 rounded-lg border border-neutral-300 flex items-center justify-center bg-white text-neutral-400 overflow-hidden flex-shrink-0">
                                        {logoFile ? (
                                            <img src={URL.createObjectURL(logoFile)} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <Upload className="w-5 h-5 opacity-50" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            id="logo-upload"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                        <label
                                            htmlFor="logo-upload"
                                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50 rounded-lg cursor-pointer transition-all"
                                        >
                                            {logoFile ? 'Change' : 'Upload'}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-3">
                                <Input
                                    label="Business Name"
                                    placeholder="Acme Corporation"
                                    value={formData.businessName}
                                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                    required
                                />

                                <Input
                                    label="Business Address"
                                    placeholder="123 Business St, City, State"
                                    value={formData.businessAddress}
                                    onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                                />

                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        label="Phone"
                                        placeholder="+91 98765 43210"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                    />
                                    <Input
                                        label="Email"
                                        type="email"
                                        placeholder="contact@business.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>

                                <Input
                                    label="Tax ID / GST (Optional)"
                                    placeholder="e.g., 22AAAAA0000A1Z5"
                                    value={formData.taxId}
                                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="pt-1">
                                <Button type="submit" loading={loading} className="w-full h-10 text-sm font-semibold bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-900 shadow-none" size="lg">
                                    Continue to Dashboard
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                            <p className="text-xs text-center text-neutral-400 leading-relaxed">
                                You can update these details anytime in Settings.
                            </p>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
