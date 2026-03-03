'use client';

import { useEffect, useState, useTransition, useCallback, useRef } from 'react';
import {
    getAdminSiteConfig, updateSiteConfig, type SiteConfigDTO,
    getEmailableSellers, sendAdminEmail, sendBulkAdminEmail, type EmailableSeller,
} from '@/app/actions/admin';
import { toast } from 'sonner';
import {
    Save, Megaphone, Link2, Tag, Sparkles, Palette, Calendar, Mail,
    Send, Search, Check, Crown, Users, X, ChevronDown, ChevronUp,
    Eye, Zap, PartyPopper, Server, Info, CheckCircle2, ExternalLink, ArrowRight, Clock, AlertTriangle,
    Bold, Italic, Heading1, Heading2, List, Link as LinkIcon
} from 'lucide-react';
import FestiveTheme from '@/components/landing/FestiveTheme';

const DEFAULT_CONFIG: SiteConfigDTO = {
    offerEnabled: false,
    offerText: null,
    offerHref: null,
    offerBadge: null,
    offerStyle: 'glass',
    offerBgColor: null,
    offerBorder: true,
    offerAnimation: 'slide',
    themeEnabled: false,
    themeName: null,
    themeGreeting: null,
    themeEmojis: null,
    themeColors: null,
    themeIntensity: 'medium',
    themeStartDate: null,
    themeEndDate: null,
};

// Presets for quick occasion setup
const OCCASION_PRESETS = [
    { name: 'Eid', greeting: 'Eid Mubarak', emojis: '🌙,⭐,🕌,✨', colors: '["#1e8449","#f4d03f","#2e86c1"]' },
    { name: 'Diwali', greeting: 'Shubh', emojis: '🪔,🎆,✨,🎇,🕯️', colors: '["#ff6f00","#ffd600","#e65100"]' },
    { name: 'Christmas', greeting: 'Merry', emojis: '🎄,🎅,❄️,⭐,🎁', colors: '["#c62828","#2e7d32","#fdd835"]' },
    { name: 'New Year', greeting: 'Happy', emojis: '🎉,🥂,🎊,✨,🎆', colors: '["#6200ea","#ffd600","#00bcd4"]' },
    { name: 'Valentine', greeting: 'Happy', emojis: '❤️,💕,🌹,💝,💘', colors: '["#e91e63","#f48fb1","#880e4f"]' },
    { name: 'Holi', greeting: 'Happy', emojis: '🎨,💧,🌈,🎉,💜', colors: '["#e91e63","#2196f3","#ffc107","#4caf50"]' },
    { name: 'Independence', greeting: 'Happy', emojis: '🇮🇳,🏳️,✨,🎆', colors: '["#ff9933","#ffffff","#138808"]' },
    { name: 'Ramadan', greeting: 'Ramadan Mubarak', emojis: '🌙,⭐,🕌,📿,✨', colors: '["#1a237e","#ffd54f","#4a148c"]' },
    { name: 'Halloween', greeting: 'Happy', emojis: '🎃,👻,🦇,🕸️,💀', colors: '["#ff6f00","#4a148c","#1b5e20"]' },
    { name: 'Spring Sale', greeting: '🌸', emojis: '🌸,🌷,🌼,☀️,🦋', colors: '["#e91e63","#4caf50","#ffeb3b"]' },
];

// Email templates
const EMAIL_TEMPLATES = [
    {
        name: 'Subscription Reminder',
        subject: 'Your Rasid subscription is expiring soon',
        body: `<p>Hi there,</p>
<p>We noticed your Rasid subscription is expiring soon. To continue enjoying all the features without interruption, please renew your plan.</p>
<p>Visit your <a href="https://dashboard.rasid.in/settings" style="color: #6366f1; text-decoration: underline;">Dashboard Settings</a> to manage your subscription.</p>
<p>Thank you for using Rasid!</p>`,
    },
    {
        name: 'Upgrade Offer',
        subject: 'Special upgrade offer just for you 🎉',
        body: `<p>Hi there,</p>
<p>We have an exclusive upgrade offer for you! Upgrade your Rasid plan today and unlock premium features at a special discounted price.</p>
<p>Check out our <a href="https://dashboard.rasid.in/pricing" style="color: #6366f1; text-decoration: underline;">Pricing Page</a> for details.</p>
<p>Don't miss out — this offer is limited!</p>`,
    },
    {
        name: 'Feature Announcement',
        subject: 'New features on Rasid! 🚀',
        body: `<p>Hi there,</p>
<p>We're excited to announce new features on Rasid:</p>
<ul>
<li>📄 New invoice templates</li>
<li>📊 Enhanced analytics dashboard</li>
<li>🔔 Smart payment reminders</li>
</ul>
<p>Log in to your <a href="https://dashboard.rasid.in" style="color: #6366f1; text-decoration: underline;">Dashboard</a> to explore.</p>`,
    },
    {
        name: 'Welcome Back',
        subject: 'We miss you! Come back to Rasid',
        body: `<p>Hi there,</p>
<p>We noticed you haven't logged into Rasid recently. Your business tools are waiting for you!</p>
<p>Log in now and see what's new: <a href="https://dashboard.rasid.in" style="color: #6366f1; text-decoration: underline;">Go to Dashboard</a></p>`,
    },
    {
        name: 'Custom Message',
        subject: '',
        body: '<p>Hi there,</p>\n<p>Write your message here...</p>',
    },
];

export default function AdminSiteSettingsPage() {
    const [config, setConfig] = useState<SiteConfigDTO>(DEFAULT_CONFIG);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Email state
    const [sellers, setSellers] = useState<EmailableSeller[]>([]);
    const [sellerSearch, setSellerSearch] = useState('');
    const [sellerPlanFilter, setSellerPlanFilter] = useState('');
    const [sellerExpiryFilter, setSellerExpiryFilter] = useState('');
    const [selectedSellers, setSelectedSellers] = useState<Set<string>>(new Set());
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('<p>Hi there,</p>\n<p></p>');
    const [sendingEmail, setSendingEmail] = useState(false);
    const [emailSentOk, setEmailSentOk] = useState(false);
    const [configSavedOk, setConfigSavedOk] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Accordion state
    const [openSection, setOpenSection] = useState<'offer' | 'theme' | 'smtp' | 'email' | null>('offer');

    useEffect(() => {
        getAdminSiteConfig()
            .then((data) => {
                setConfig({ ...DEFAULT_CONFIG, ...data });
                setIsLoaded(true);
            })
            .catch(() => setIsLoaded(true));
    }, []);

    const fetchSellers = useCallback(() => {
        getEmailableSellers(sellerSearch, sellerPlanFilter, sellerExpiryFilter)
            .then(setSellers)
            .catch(console.error);
    }, [sellerSearch, sellerPlanFilter, sellerExpiryFilter]);

    // Compute days remaining from subscriptionEndsAt
    const getDaysRemaining = (endsAt: string | null): number | null => {
        if (!endsAt) return null;
        const end = new Date(endsAt);
        const now = new Date();
        const diff = end.getTime() - now.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const getExpiryBadge = (seller: EmailableSeller) => {
        if (seller.plan === 'LIFETIME') {
            return { text: '∞ Lifetime', className: 'bg-teal-50 text-teal-600 border-teal-200' };
        }
        if (seller.plan === 'FREE') {
            return { text: 'Free', className: 'bg-gray-50 text-gray-500 border-gray-200' };
        }
        const days = getDaysRemaining(seller.subscriptionEndsAt);
        if (days === null) return { text: 'No expiry', className: 'bg-gray-50 text-gray-400 border-gray-200' };
        if (days < 0) return { text: `Expired ${Math.abs(days)}d ago`, className: 'bg-red-50 text-red-600 border-red-200' };
        if (days === 0) return { text: 'Expires today!', className: 'bg-red-50 text-red-600 border-red-200 animate-pulse' };
        if (days <= 7) return { text: `${days}d left`, className: 'bg-orange-50 text-orange-600 border-orange-200' };
        if (days <= 30) return { text: `${days}d left`, className: 'bg-amber-50 text-amber-600 border-amber-200' };
        return { text: `${days}d left`, className: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
    };

    useEffect(() => {
        if (openSection === 'email') fetchSellers();
    }, [openSection, fetchSellers]);

    const handleChange = (field: keyof SiteConfigDTO, value: string | boolean) => {
        setConfig((prev) => ({ ...prev, [field]: value }));
    };

    const handleSaveConfig = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            try {
                const updated = await updateSiteConfig(config);
                setConfig(updated);
                toast.success('Site settings saved & homepage updated');
                setConfigSavedOk(true);
                setTimeout(() => setConfigSavedOk(false), 2000);
            } catch (error: any) {
                toast.error(error?.message || 'Failed to update');
            }
        });
    };

    const applyPreset = (preset: typeof OCCASION_PRESETS[0]) => {
        setConfig(prev => ({
            ...prev,
            themeName: preset.name,
            themeGreeting: preset.greeting,
            themeEmojis: preset.emojis,
            themeColors: preset.colors,
        }));
    };

    const toggleSeller = (id: string) => {
        setSelectedSellers(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const selectAll = () => {
        setSelectedSellers(new Set(sellers.map(s => s.id)));
    };

    const clearSelection = () => {
        setSelectedSellers(new Set());
    };

    const applyEmailTemplate = (template: typeof EMAIL_TEMPLATES[0]) => {
        setEmailSubject(template.subject);
        setEmailBody(template.body);
    };

    const handleSendEmail = async () => {
        if (selectedSellers.size === 0) {
            toast.error('Select at least one recipient');
            return;
        }
        if (!emailSubject.trim()) {
            toast.error('Subject is required');
            return;
        }

        setSendingEmail(true);
        try {
            if (selectedSellers.size === 1) {
                const sellerId = Array.from(selectedSellers)[0];
                const res = await sendAdminEmail({ sellerId, subject: emailSubject, body: emailBody });
                if (res.success) {
                    toast.success('Email sent successfully');
                    setEmailSentOk(true);
                    setTimeout(() => setEmailSentOk(false), 2000);
                } else {
                    toast.error(res.error || 'Failed to send');
                }
            } else {
                const res = await sendBulkAdminEmail({
                    sellerIds: Array.from(selectedSellers),
                    subject: emailSubject,
                    body: emailBody,
                });
                toast.success(`Sent to ${res.sent} sellers${res.failed > 0 ? `, ${res.failed} failed` : ''}`);
                if (res.sent > 0) {
                    setEmailSentOk(true);
                    setTimeout(() => setEmailSentOk(false), 2000);
                }
            }
        } catch {
            toast.error('Failed to send email');
        }
        setSendingEmail(false);
    };

    const insertTag = (startTag: string, endTag: string) => {
        if (!textareaRef.current) return;
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selectedText = text.substring(start, end);
        const newText = text.substring(0, start) + startTag + selectedText + endTag + text.substring(end);
        setEmailBody(newText);
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + startTag.length, start + startTag.length + selectedText.length);
        }, 0);
    };

    const SectionHeader = ({
        id, icon, title, description, isOpen
    }: { id: 'offer' | 'theme' | 'smtp' | 'email'; icon: React.ReactNode; title: string; description: string; isOpen: boolean }) => (
        <button
            type="button"
            onClick={() => setOpenSection(isOpen ? null : id)}
            className="w-full px-5 py-4 flex items-center gap-3 text-left hover:bg-muted/30 transition-colors"
        >
            <span className="p-2 rounded-xl bg-violet-50 text-violet-600">{icon}</span>
            <div className="flex-1">
                <h2 className="text-sm font-semibold text-foreground">{title}</h2>
                <p className="text-[11px] text-muted-foreground">{description}</p>
            </div>
            {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>
    );

    return (
        <div className="space-y-6">
            {/* Advanced Gradient Background Animation */}
            <div className="relative overflow-hidden rounded-3xl p-8 sm:p-10">
                {/* Multi-layered animated gradient */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600/90 via-indigo-500/80 to-fuchsia-500/90 animate-[gradientShift_8s_ease-in-out_infinite]" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/40 via-transparent to-pink-500/40 animate-[gradientShift2_12s_ease-in-out_infinite]" />
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-transparent to-amber-400/20 animate-[gradientShift3_10s_ease-in-out_infinite]" />
                    {/* Floating orbs */}
                    <div className="absolute top-[-20%] left-[-10%] w-72 h-72 rounded-full bg-white/10 blur-3xl animate-[floatOrb1_15s_ease-in-out_infinite]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 rounded-full bg-white/8 blur-3xl animate-[floatOrb2_18s_ease-in-out_infinite]" />
                    <div className="absolute top-[30%] right-[20%] w-48 h-48 rounded-full bg-white/10 blur-2xl animate-[floatOrb3_12s_ease-in-out_infinite]" />
                    {/* Subtle grid overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[headerShimmer_6s_ease-in-out_infinite]" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-display drop-shadow-lg">Site & Marketing</h1>
                    </div>
                    <p className="text-sm text-white/70 ml-[52px]">
                        Manage announcements, occasion themes, and communicate with sellers.
                    </p>
                </div>
            </div>

            {/* CSS Keyframes for gradient animations */}
            <style jsx>{`
                @keyframes gradientShift {
                    0%, 100% { opacity: 1; filter: hue-rotate(0deg); }
                    25% { opacity: 0.9; filter: hue-rotate(15deg); }
                    50% { opacity: 1; filter: hue-rotate(-10deg); }
                    75% { opacity: 0.95; filter: hue-rotate(20deg); }
                }
                @keyframes gradientShift2 {
                    0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.4; }
                    33% { transform: scale(1.1) rotate(2deg); opacity: 0.5; }
                    66% { transform: scale(0.95) rotate(-2deg); opacity: 0.35; }
                }
                @keyframes gradientShift3 {
                    0%, 100% { transform: translateX(0) translateY(0); opacity: 0.2; }
                    50% { transform: translateX(5%) translateY(-3%); opacity: 0.3; }
                }
                @keyframes floatOrb1 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    25% { transform: translate(30px, 20px) scale(1.05); }
                    50% { transform: translate(-10px, 40px) scale(0.95); }
                    75% { transform: translate(20px, -10px) scale(1.02); }
                }
                @keyframes floatOrb2 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(-40px, -20px) scale(1.08); }
                    66% { transform: translate(20px, 30px) scale(0.92); }
                }
                @keyframes floatOrb3 {
                    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.1; }
                    50% { transform: translate(-25px, 15px) scale(1.15); opacity: 0.15; }
                }
                @keyframes headerShimmer {
                    0% { transform: translateX(-100%); }
                    50%, 100% { transform: translateX(100%); }
                }
            `}</style>

            <div>
                {/* ─── OFFER BAR ─── */}
                <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-xs mb-4">
                    <SectionHeader
                        id="offer"
                        icon={<Megaphone className="w-4 h-4" />}
                        title="Header Offer Bar"
                        description="Announcement bar on the public homepage"
                        isOpen={openSection === 'offer'}
                    />
                    {openSection === 'offer' && (
                        <div className="p-5 border-t border-border space-y-5">
                            {/* Toggle */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-foreground">Enable offer bar</p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">Show or hide on the homepage</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleChange('offerEnabled', !config.offerEnabled)}
                                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${config.offerEnabled ? 'bg-emerald-500' : 'bg-gray-200'}`}
                                >
                                    <span className={`absolute top-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${config.offerEnabled ? 'translate-x-[26px]' : 'translate-x-0.5'}`}>
                                        {config.offerEnabled ? <Check className="w-3 h-3 text-emerald-600 font-bold" /> : <X className="w-3 h-3 text-black font-bold" />}
                                    </span>
                                </button>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Offer Text</label>
                                <div className="relative">
                                    <Megaphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                    <input
                                        type="text"
                                        placeholder="e.g. Limited-time: Get 2 months free on Pro"
                                        value={config.offerText ?? ''}
                                        onChange={(e) => handleChange('offerText', e.target.value)}
                                        className="w-full bg-white border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Link URL</label>
                                    <div className="relative">
                                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                        <input
                                            type="text"
                                            placeholder="e.g. /pricing"
                                            value={config.offerHref ?? ''}
                                            onChange={(e) => handleChange('offerHref', e.target.value)}
                                            className="w-full bg-white border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Badge Label</label>
                                    <div className="relative">
                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                        <input
                                            type="text"
                                            placeholder="e.g. LIMITED"
                                            value={config.offerBadge ?? ''}
                                            onChange={(e) => handleChange('offerBadge', e.target.value)}
                                            className="w-full bg-white border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[13px] font-semibold text-foreground mb-3 flex items-center gap-2">
                                        <Palette className="w-4 h-4 text-violet-500" />
                                        Bar Aesthetic
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { id: 'glass', name: 'Glassmorphism', classes: 'bg-gray-100/50 border-gray-200 text-slate-700' },
                                            { id: 'violet', name: 'Vibrant Violet', classes: 'bg-gradient-to-r from-violet-600 to-indigo-600 border-violet-500/50 text-white' },
                                            { id: 'emerald', name: 'Emerald Glow', classes: 'bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-400/50 text-white' },
                                            { id: 'rose', name: 'Rose Sunset', classes: 'bg-gradient-to-r from-rose-500 to-orange-500 border-rose-400/50 text-white' },
                                            { id: 'dark', name: 'Midnight Dark', classes: 'bg-slate-900 border-slate-700 text-white' },
                                            { id: 'custom', name: 'Custom Color', classes: 'bg-white border-dashed border-gray-300 text-slate-700 hover:border-violet-400' },
                                        ].map((style) => (
                                            <button
                                                key={style.id}
                                                type="button"
                                                onClick={() => handleChange('offerStyle', style.id)}
                                                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-all border shadow-sm ${config.offerStyle === style.id ? 'ring-2 ring-violet-500 ring-offset-1 ' + style.classes : style.classes + ' opacity-60 hover:opacity-100'}`}
                                            >
                                                {style.name}
                                            </button>
                                        ))}
                                    </div>
                                    {config.offerStyle === 'custom' && (
                                        <div className="mt-3 flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border">
                                            <label className="text-xs font-semibold text-foreground">Pick Background Color:</label>
                                            <input
                                                type="color"
                                                value={config.offerBgColor || '#8b5cf6'}
                                                onChange={(e) => handleChange('offerBgColor', e.target.value)}
                                                className="w-10 h-8 rounded border border-border bg-white p-0.5 cursor-pointer shadow-sm"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col justify-center">
                                    <div className="flex items-center justify-between border border-border rounded-xl p-3 bg-muted/20">
                                        <div>
                                            <p className="text-sm font-medium text-foreground">Outer Border</p>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">Show a thin solid border around the pill</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleChange('offerBorder', !config.offerBorder)}
                                            className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${config.offerBorder ? 'bg-emerald-500' : 'bg-gray-300'}`}
                                        >
                                            <span className={`absolute top-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${config.offerBorder ? 'translate-x-[22px]' : 'translate-x-0.5'}`}>
                                            </span>
                                        </button>
                                    </div>
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-foreground mb-2">Display Animation</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { id: 'slide', label: 'Slide Down' },
                                                { id: 'fade', label: 'Soft Fade' },
                                                { id: 'bounce', label: 'Bouncy' },
                                                { id: 'pulse', label: 'Pulsing' }
                                            ].map((anim) => (
                                                <button
                                                    key={anim.id}
                                                    type="button"
                                                    onClick={() => handleChange('offerAnimation', anim.id)}
                                                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${config.offerAnimation === anim.id ? 'bg-violet-50 border-violet-300 text-violet-700' : 'bg-white border-border text-muted-foreground hover:bg-muted/40'}`}
                                                >
                                                    {anim.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Live Preview */}
                            {config.offerText && (
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                        <Eye className="w-3 h-3" /> Live Preview
                                    </p>
                                    <div className="bg-slate-50 border border-border/50 rounded-2xl py-6 flex items-center justify-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:20px_20px]" />

                                        {(() => {
                                            let classes = '';
                                            if (config.offerStyle === 'violet') classes = 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20';
                                            else if (config.offerStyle === 'emerald') classes = 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20';
                                            else if (config.offerStyle === 'rose') classes = 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/20';
                                            else if (config.offerStyle === 'dark') classes = 'bg-slate-900 text-white shadow-lg shadow-slate-900/30';
                                            else if (config.offerStyle === 'custom') classes = 'text-white shadow-lg';
                                            else classes = 'bg-white text-slate-800 shadow-md'; // glass/modern fallback on white bg

                                            let animClass = '';
                                            if (config.offerAnimation === 'bounce') animClass = 'animate-bounce';
                                            else if (config.offerAnimation === 'pulse') animClass = 'animate-pulse';
                                            else if (config.offerAnimation === 'fade') animClass = 'animate-in fade-in zoom-in-95 duration-1000';
                                            else animClass = 'animate-in slide-in-from-top-4 fade-in duration-700';

                                            return (
                                                <div
                                                    className={`relative z-10 flex items-center gap-3 px-1 py-1 pr-6 rounded-full text-xs font-medium ${config.offerBorder ? 'border-[0.5px] border-black/10 dark:border-white/10' : ''} ${classes} ${animClass}`}
                                                    style={config.offerStyle === 'custom' ? { backgroundColor: config.offerBgColor || '#8b5cf6' } : undefined}
                                                >
                                                    {config.offerBadge && (
                                                        <span className={`flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.offerStyle === 'glass' ? 'bg-slate-900 text-white' : 'bg-black/20 text-white'}`}>
                                                            <Sparkles className="w-3 h-3 mr-1" />
                                                            {config.offerBadge}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1.5">
                                                        {config.offerText}
                                                        {config.offerHref && <ArrowRight className="w-3.5 h-3.5 opacity-60" />}
                                                    </span>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}

                            {/* Save Offer Bar */}
                            <div className="flex justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={handleSaveConfig}
                                    disabled={!isLoaded || isPending || configSavedOk}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm ${configSavedOk ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-primary text-primary-foreground hover:bg-primary-hover'}`}
                                >
                                    {isPending ? 'Saving...' : configSavedOk ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-3.5 h-3.5" /> Save Offer Bar</>}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── OCCASION THEME ─── */}
                <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-xs mb-4">
                    <SectionHeader
                        id="theme"
                        icon={<PartyPopper className="w-4 h-4" />}
                        title="Occasion Theme & Animations"
                        description="Festive decorations with floating emojis and color effects"
                        isOpen={openSection === 'theme'}
                    />
                    {openSection === 'theme' && (
                        <div className="p-5 border-t border-border space-y-5">
                            {/* Toggle */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-foreground">Enable occasion theme</p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">Adds festive animations to the homepage</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleChange('themeEnabled', !config.themeEnabled)}
                                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${config.themeEnabled ? 'bg-emerald-500' : 'bg-gray-200'}`}
                                >
                                    <span className={`absolute top-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${config.themeEnabled ? 'translate-x-[26px]' : 'translate-x-0.5'}`}>
                                        {config.themeEnabled ? <Check className="w-3 h-3 text-emerald-600 font-bold" /> : <X className="w-3 h-3 text-black font-bold" />}
                                    </span>
                                </button>
                            </div>

                            {/* Quick Presets */}
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-2">Quick Presets</label>
                                <div className="flex flex-wrap gap-2">
                                    {OCCASION_PRESETS.map((preset) => (
                                        <button
                                            key={preset.name}
                                            type="button"
                                            onClick={() => applyPreset(preset)}
                                            className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${config.themeName === preset.name
                                                ? 'bg-violet-50 border-violet-300 text-violet-700'
                                                : 'bg-white border-border text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                                                }`}
                                        >
                                            {preset.emojis.split(',')[0]} {preset.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Occasion Name</label>
                                    <div className="relative">
                                        <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                        <input
                                            type="text"
                                            placeholder="e.g. Eid, Diwali, Christmas"
                                            value={config.themeName ?? ''}
                                            onChange={(e) => handleChange('themeName', e.target.value)}
                                            className="w-full bg-white border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Greeting Title</label>
                                    <div className="relative">
                                        <PartyPopper className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                        <input
                                            type="text"
                                            placeholder="e.g. Happy, Merry, Shubh, Eid Mubarak"
                                            value={config.themeGreeting ?? ''}
                                            onChange={(e) => handleChange('themeGreeting', e.target.value)}
                                            className="w-full bg-white border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-1">Custom greeting prefix shown before the occasion name (e.g. "Happy Holi!", "Eid Mubarak!")</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Floating Emojis (comma-separated)</label>
                                    <input
                                        type="text"
                                        placeholder="🌙,⭐,✨"
                                        value={config.themeEmojis ?? ''}
                                        onChange={(e) => handleChange('themeEmojis', e.target.value)}
                                        className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[13px] font-semibold text-foreground mb-3 flex items-center gap-2">
                                    <Palette className="w-4 h-4 text-violet-500" />
                                    Glow Colors
                                </label>

                                {/* Quick Color Palettes */}
                                <div className="mb-4">
                                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Predefined Palettes</p>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            '["#1e8449","#f4d03f","#2e86c1"]', // Eid
                                            '["#ff6f00","#ffd600","#e65100"]', // Diwali
                                            '["#c62828","#2e7d32","#fdd835"]', // Christmas
                                            '["#6200ea","#ffd600","#00bcd4"]', // New Year
                                            '["#e91e63","#f48fb1","#880e4f"]', // Valentine
                                            '["#e91e63","#2196f3","#ffc107"]', // Holi
                                            '["#1a237e","#ffd54f","#4a148c"]', // Ramadan
                                            '["#ff6f00","#4a148c","#1b5e20"]', // Halloween
                                            '["#ff9933","#ffffff","#138808"]', // India
                                            '["#14b8a6","#3b82f6","#6366f1"]', // Modern Teal
                                        ].map((paletteStr, idx) => {
                                            const cols = JSON.parse(paletteStr);
                                            return (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => handleChange('themeColors', paletteStr)}
                                                    className={`h-8 px-2 rounded-lg border flex items-center gap-1 transition-all ${config.themeColors === paletteStr ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-200' : 'border-border bg-white hover:bg-muted/50'}`}
                                                    title="Apply Palette"
                                                >
                                                    {cols.map((c: string, i: number) => (
                                                        <span key={i} className="w-4 h-4 rounded-full border border-border/50 shadow-sm" style={{ backgroundColor: c }} />
                                                    ))}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Custom Colors</p>
                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                    {/* Visual Color Pickers built from the JSON string */}
                                    <div className="flex gap-2 p-1.5 bg-muted/30 rounded-xl border border-border">
                                        {(() => {
                                            let currentColors: string[] = [];
                                            try {
                                                currentColors = config.themeColors ? JSON.parse(config.themeColors) : ['#ffffff', '#ffffff', '#ffffff'];
                                                if (!Array.isArray(currentColors) || currentColors.length === 0) currentColors = ['#ffffff', '#ffffff', '#ffffff'];
                                            } catch {
                                                currentColors = ['#ffffff', '#ffffff', '#ffffff'];
                                            }

                                            // Ensure we always have exactly 3 slots for the UI color pickers
                                            const displayColors = [...currentColors, '#ffffff', '#ffffff', '#ffffff'].slice(0, 3);

                                            return displayColors.map((c: string, i: number) => (
                                                <div key={i} className="relative group">
                                                    <input
                                                        type="color"
                                                        value={c}
                                                        onChange={(e) => {
                                                            const newColors = [...currentColors];
                                                            newColors[i] = e.target.value;
                                                            // filter out trailing blankish ones if they just cleared it, or keep it rigid?
                                                            handleChange('themeColors', JSON.stringify(newColors));
                                                        }}
                                                        className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0 bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border [&::-webkit-color-swatch]:border-border [&::-webkit-color-swatch]:rounded-lg shadow-sm"
                                                        title={`Color ${i + 1}`}
                                                    />
                                                </div>
                                            ));
                                        })()}
                                    </div>

                                    <div className="flex-1 w-full">
                                        <input
                                            type="text"
                                            placeholder='e.g. ["#1e8449","#f4d03f"]'
                                            value={config.themeColors ?? ''}
                                            onChange={(e) => handleChange('themeColors', e.target.value)}
                                            className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm text-foreground font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Intensity */}
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-2">Animation Intensity</label>
                                <div className="flex gap-2">
                                    {['subtle', 'medium', 'festive'].map((level) => (
                                        <button
                                            key={level}
                                            type="button"
                                            onClick={() => handleChange('themeIntensity', level)}
                                            className={`flex-1 text-xs font-medium px-3 py-2 rounded-xl border transition-all capitalize ${config.themeIntensity === level
                                                ? 'bg-violet-50 border-violet-300 text-violet-700'
                                                : 'bg-white border-border text-muted-foreground hover:bg-muted/40'
                                                }`}
                                        >
                                            {level === 'subtle' && '✨'} {level === 'medium' && '🎉'} {level === 'festive' && '🎆'} {level}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Date range */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Start Date (optional)</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                        <input
                                            type="datetime-local"
                                            value={config.themeStartDate ? config.themeStartDate.slice(0, 16) : ''}
                                            onChange={(e) => handleChange('themeStartDate', e.target.value ? new Date(e.target.value).toISOString() : '')}
                                            className="w-full bg-white border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">End Date (optional)</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                        <input
                                            type="datetime-local"
                                            value={config.themeEndDate ? config.themeEndDate.slice(0, 16) : ''}
                                            onChange={(e) => handleChange('themeEndDate', e.target.value ? new Date(e.target.value).toISOString() : '')}
                                            className="w-full bg-white border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Live Preview */}
                            {config.themeEmojis && (
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                        <Eye className="w-3 h-3" /> Live Preview
                                    </p>
                                    <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-white border border-border h-48">
                                        <FestiveTheme
                                            themeName={config.themeName}
                                            themeEmojis={config.themeEmojis}
                                            themeColors={config.themeColors}
                                            themeIntensity={config.themeIntensity}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center z-10">
                                            <p className="text-sm font-medium text-muted-foreground bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border">
                                                {config.themeName
                                                    ? `${config.themeGreeting ? config.themeGreeting + ' ' : ''}${config.themeName}!`
                                                    : 'Theme preview'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Save Theme */}
                            <div className="flex justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={handleSaveConfig}
                                    disabled={!isLoaded || isPending || configSavedOk}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm ${configSavedOk ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-primary text-primary-foreground hover:bg-primary-hover'}`}
                                >
                                    {isPending ? 'Saving...' : configSavedOk ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-3.5 h-3.5" /> Save Theme</>}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── SMTP / EMAIL CONFIGURATION ─── */}
            <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-xs mb-4">
                <SectionHeader
                    id="smtp"
                    icon={<Server className="w-4 h-4" />}
                    title="Email Configuration (SMTP)"
                    description="Configure SMTP server for sending platform emails to sellers"
                    isOpen={openSection === 'smtp'}
                />
                {openSection === 'smtp' && (
                    <div className="p-5 border-t border-border space-y-5">
                        <div className="flex flex-col gap-3 p-4 bg-violet-50 border border-violet-100 rounded-xl">
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-violet-600" />
                                <p className="text-sm text-violet-700">
                                    Configure your SMTP server to send emails to sellers (subscription reminders, announcements, etc.). This is the platform-level email configuration.
                                </p>
                            </div>
                        </div>

                        {/* Provider Selection */}
                        <div className="space-y-3">
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email Provider</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    {
                                        id: 'GMAIL',
                                        name: 'Gmail',
                                        host: 'smtp.gmail.com',
                                        port: '587',
                                        color: 'hover:border-red-300 hover:bg-red-50',
                                    },
                                    {
                                        id: 'OUTLOOK',
                                        name: 'Outlook',
                                        host: 'smtp.office365.com',
                                        port: '587',
                                        color: 'hover:border-blue-300 hover:bg-blue-50',
                                    },
                                    {
                                        id: 'HOSTINGER',
                                        name: 'Hostinger',
                                        host: 'smtp.hostinger.com',
                                        port: '465',
                                        color: 'hover:border-purple-300 hover:bg-purple-50',
                                    },
                                    {
                                        id: 'OTHER',
                                        name: 'Custom',
                                        host: '',
                                        port: '',
                                        color: 'hover:border-gray-300 hover:bg-gray-50',
                                    },
                                ].map((p) => {
                                    const currentHost = (config.smtpHost || '').trim().toLowerCase();
                                    const pHost = p.host.trim().toLowerCase();
                                    const knownHosts = ['smtp.gmail.com', 'smtp.office365.com', 'smtp.hostinger.com'];

                                    let isActive = false;
                                    if (p.id === 'OTHER') {
                                        isActive = !!currentHost && !knownHosts.includes(currentHost);
                                    } else {
                                        isActive = currentHost === pHost;
                                    }

                                    return (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => {
                                                if (p.id !== 'OTHER') {
                                                    setConfig(prev => ({
                                                        ...prev,
                                                        smtpHost: p.host,
                                                        smtpPort: p.port,
                                                    }));
                                                } else {
                                                    setConfig(prev => ({
                                                        ...prev,
                                                        smtpHost: '',
                                                        smtpPort: '',
                                                    }));
                                                }
                                            }}
                                            className={`
                                                relative flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200 group
                                                ${isActive
                                                    ? 'border-violet-500 bg-violet-50 text-violet-700 shadow-sm ring-1 ring-violet-500/20'
                                                    : `bg-white border-border text-muted-foreground ${p.color}`
                                                }
                                            `}
                                        >
                                            <Mail className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 text-violet-600' : 'group-hover:scale-110'}`} />
                                            <span className={`font-semibold text-xs tracking-wide ${isActive ? 'text-violet-700' : ''}`}>
                                                {p.name}
                                            </span>
                                            {isActive && (
                                                <div className="absolute top-1.5 right-1.5">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-violet-600" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">SMTP Host</label>
                                <div className="relative">
                                    <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                    <input
                                        type="text"
                                        placeholder="smtp.gmail.com"
                                        value={config.smtpHost ?? ''}
                                        onChange={(e) => setConfig(prev => ({ ...prev, smtpHost: e.target.value }))}
                                        className="w-full bg-white border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">SMTP Port</label>
                                <input
                                    type="text"
                                    placeholder="587"
                                    value={config.smtpPort ?? ''}
                                    onChange={(e) => setConfig(prev => ({ ...prev, smtpPort: e.target.value }))}
                                    className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">SMTP User</label>
                                <input
                                    type="text"
                                    placeholder="you@yourdomain.com"
                                    value={config.smtpUser ?? ''}
                                    onChange={(e) => setConfig(prev => ({ ...prev, smtpUser: e.target.value }))}
                                    className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                                />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <label className="block text-xs font-medium text-muted-foreground">SMTP Password</label>
                                    <div className="relative group">
                                        <Info className="w-3.5 h-3.5 text-muted-foreground/50 cursor-help" />
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 p-3 bg-foreground text-background text-[11px] rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                                            For Gmail, use an App Password (not your regular password). Go to Google Account → Security → 2-Step Verification → App Passwords.
                                        </div>
                                    </div>
                                </div>
                                <input
                                    type="password"
                                    placeholder="App Password / API Key"
                                    value={config.smtpPass ?? ''}
                                    onChange={(e) => setConfig(prev => ({ ...prev, smtpPass: e.target.value }))}
                                    className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">From Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                <input
                                    type="email"
                                    placeholder="admin@rasid.in"
                                    value={config.fromEmail ?? ''}
                                    onChange={(e) => setConfig(prev => ({ ...prev, fromEmail: e.target.value }))}
                                    className="w-full bg-white border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                                />
                            </div>
                        </div>

                        {/* Helper Links */}
                        <div className="text-sm text-muted-foreground pl-1 flex flex-wrap gap-3">
                            {config.smtpHost === 'smtp.gmail.com' && (
                                <a href="https://support.google.com/mail/answer/7126229" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-foreground underline underline-offset-2 transition-colors text-xs">
                                    Gmail SMTP Guide <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                            {config.smtpHost === 'smtp.office365.com' && (
                                <a href="https://support.microsoft.com/en-us/office/pop-imap-and-smtp-settings-8361e398-8af4-4e97-b147-6c6c4ac95353" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-foreground underline underline-offset-2 transition-colors text-xs">
                                    Outlook SMTP Guide <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                            {config.smtpHost === 'smtp.hostinger.com' && (
                                <a href="https://support.hostinger.com/en/articles/1583238-how-to-find-email-configuration-details-for-your-domain" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-foreground underline underline-offset-2 transition-colors text-xs">
                                    Hostinger SMTP Guide <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                        </div>

                        {/* Connection status indicator */}
                        <div className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-medium ${config.smtpHost && config.smtpUser && config.smtpPass
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-amber-50 border-amber-200 text-amber-700'
                            }`}>
                            {config.smtpHost && config.smtpUser && config.smtpPass ? (
                                <><CheckCircle2 className="w-4 h-4" /> SMTP configured. Save to apply your changes.</>
                            ) : (
                                <><Info className="w-4 h-4" /> Fill in all SMTP fields above to enable email sending.</>
                            )}
                        </div>

                        {/* Save SMTP */}
                        <div className="flex justify-end pt-2">
                            <button
                                type="button"
                                onClick={handleSaveConfig}
                                disabled={!isLoaded || isPending || configSavedOk}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm ${configSavedOk ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-primary text-primary-foreground hover:bg-primary-hover'}`}
                            >
                                {isPending ? 'Saving...' : configSavedOk ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-3.5 h-3.5" /> Save Email Config</>}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── EMAIL TO SELLERS ─── */}
            <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-xs">
                <SectionHeader
                    id="email"
                    icon={<Mail className="w-4 h-4" />}
                    title="Email Sellers"
                    description="Send emails to individual or multiple sellers (subscription reminders, announcements, etc.)"
                    isOpen={openSection === 'email'}
                />
                {openSection === 'email' && (
                    <div className="p-5 border-t border-border space-y-5">
                        {/* Email Templates */}
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-2">Quick Templates</label>
                            <div className="flex flex-wrap gap-2">
                                {EMAIL_TEMPLATES.map((tpl) => (
                                    <button
                                        key={tpl.name}
                                        type="button"
                                        onClick={() => applyEmailTemplate(tpl)}
                                        className="text-xs font-medium px-3 py-1.5 rounded-lg border bg-white border-border text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-all"
                                    >
                                        {tpl.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Subject */}
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Subject</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                <input
                                    type="text"
                                    placeholder="Email subject..."
                                    value={emailSubject}
                                    onChange={(e) => setEmailSubject(e.target.value)}
                                    className="w-full bg-white border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-medium text-muted-foreground">
                                    Message Body (HTML)
                                </label>
                                <div className="flex items-center gap-1 p-0.5 bg-muted/20 border border-border rounded-lg">
                                    <button type="button" onClick={() => insertTag('<b>', '</b>')} className="p-1 hover:bg-white hover:shadow-sm rounded transition-all text-muted-foreground hover:text-foreground" title="Bold"><Bold className="w-3.5 h-3.5" /></button>
                                    <button type="button" onClick={() => insertTag('<i>', '</i>')} className="p-1 hover:bg-white hover:shadow-sm rounded transition-all text-muted-foreground hover:text-foreground" title="Italic"><Italic className="w-3.5 h-3.5" /></button>
                                    <div className="w-px h-3 bg-border mx-0.5" />
                                    <button type="button" onClick={() => insertTag('<h1>', '</h1>')} className="p-1 hover:bg-white hover:shadow-sm rounded transition-all text-muted-foreground hover:text-foreground" title="Heading 1"><Heading1 className="w-3.5 h-3.5" /></button>
                                    <button type="button" onClick={() => insertTag('<h2>', '</h2>')} className="p-1 hover:bg-white hover:shadow-sm rounded transition-all text-muted-foreground hover:text-foreground" title="Heading 2"><Heading2 className="w-3.5 h-3.5" /></button>
                                    <div className="w-px h-3 bg-border mx-0.5" />
                                    <button type="button" onClick={() => insertTag('<ul>\n<li>', '</li>\n</ul>')} className="p-1 hover:bg-white hover:shadow-sm rounded transition-all text-muted-foreground hover:text-foreground" title="Bullet List"><List className="w-3.5 h-3.5" /></button>
                                    <button type="button" onClick={() => {
                                        const url = prompt('Enter URL:');
                                        if (url) insertTag(`<a href="${url}" style="color: #6366f1; text-decoration: underline;">`, '</a>');
                                    }} className="p-1 hover:bg-white hover:shadow-sm rounded transition-all text-muted-foreground hover:text-foreground" title="Link"><LinkIcon className="w-3.5 h-3.5" /></button>
                                </div>
                            </div>
                            <textarea
                                ref={textareaRef}
                                rows={8}
                                value={emailBody}
                                onChange={(e) => setEmailBody(e.target.value)}
                                placeholder="<p>Hi there,</p><p>Your message...</p>"
                                className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm text-foreground font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all resize-y"
                            />
                        </div>

                        {/* Email Preview */}
                        {emailBody && (
                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                    <Eye className="w-3 h-3" /> Email Preview
                                </p>
                                <div className="border border-border rounded-xl p-4 bg-white">
                                    <p className="text-xs text-muted-foreground mb-2">
                                        <strong>Subject:</strong> {emailSubject || '(no subject)'}
                                    </p>
                                    <hr className="border-border mb-3" />
                                    <div
                                        className="text-sm text-foreground leading-relaxed prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: emailBody }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Recipient Selection */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-medium text-muted-foreground">
                                    Recipients ({selectedSellers.size} selected)
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={selectAll}
                                        className="text-[10px] font-medium text-violet-600 hover:text-violet-700 transition-colors"
                                    >
                                        Select All
                                    </button>
                                    {selectedSellers.size > 0 && (
                                        <button
                                            type="button"
                                            onClick={clearSelection}
                                            className="text-[10px] font-medium text-red-500 hover:text-red-600 transition-colors"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Search + filter */}
                            <div className="flex gap-2 mb-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
                                    <input
                                        type="text"
                                        placeholder="Search sellers..."
                                        value={sellerSearch}
                                        onChange={(e) => setSellerSearch(e.target.value)}
                                        className="w-full bg-white border border-border rounded-lg pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-violet-400 transition-all"
                                    />
                                </div>
                                <select
                                    value={sellerPlanFilter}
                                    onChange={(e) => setSellerPlanFilter(e.target.value)}
                                    className="bg-white border border-border rounded-lg px-2 py-2 text-xs text-foreground cursor-pointer focus:outline-none focus:border-violet-400 transition-all"
                                >
                                    <option value="">All Plans</option>
                                    <option value="FREE">FREE</option>
                                    <option value="BASIC">BASIC</option>
                                    <option value="PRO">PRO</option>
                                    <option value="PREMIUM">PREMIUM</option>
                                    <option value="LIFETIME">LIFETIME</option>
                                </select>
                            </div>

                            {/* Expiry filter */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                <span className="text-[10px] text-muted-foreground font-medium self-center mr-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Expiry:
                                </span>
                                {[
                                    { id: '', label: 'All', icon: null },
                                    { id: '7days', label: '≤ 7 days', icon: <AlertTriangle className="w-3 h-3" /> },
                                    { id: 'lastday', label: 'Last day', icon: <AlertTriangle className="w-3 h-3" /> },
                                    { id: 'expired', label: 'Expired', icon: <X className="w-3 h-3" /> },
                                ].map((f) => (
                                    <button
                                        key={f.id}
                                        type="button"
                                        onClick={() => setSellerExpiryFilter(f.id)}
                                        className={`inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-lg border transition-all ${sellerExpiryFilter === f.id
                                                ? f.id === 'expired'
                                                    ? 'bg-red-50 border-red-300 text-red-700'
                                                    : f.id === 'lastday'
                                                        ? 'bg-orange-50 border-orange-300 text-orange-700'
                                                        : f.id === '7days'
                                                            ? 'bg-amber-50 border-amber-300 text-amber-700'
                                                            : 'bg-violet-50 border-violet-300 text-violet-700'
                                                : 'bg-white border-border text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                                            }`}
                                    >
                                        {f.icon}
                                        {f.label}
                                    </button>
                                ))}
                            </div>

                            {/* Seller list */}
                            <div className="border border-border rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                                {sellers.length === 0 ? (
                                    <div className="py-8 text-center text-muted-foreground text-xs">
                                        <Users className="w-6 h-6 mx-auto mb-1 text-muted-foreground/30" />
                                        No sellers found.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {sellers.map((seller) => (
                                            <label
                                                key={seller.id}
                                                className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/30 cursor-pointer transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSellers.has(seller.id)}
                                                    onChange={() => toggleSeller(seller.id)}
                                                    className="rounded border-border text-violet-500 focus:ring-violet-200 w-3.5 h-3.5"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-foreground truncate">{seller.businessName}</p>
                                                    <p className="text-[10px] text-muted-foreground truncate">{seller.email}</p>
                                                </div>
                                                {(() => {
                                                    const badge = getExpiryBadge(seller);
                                                    return (
                                                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${badge.className}`}>
                                                            {badge.text}
                                                        </span>
                                                    );
                                                })()}
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${getPlanBadge(seller.plan)}`}>
                                                    {seller.plan}
                                                </span>
                                                {!seller.isActive && (
                                                    <span className="text-[9px] font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">
                                                        Inactive
                                                    </span>
                                                )}
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Send button */}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleSendEmail}
                                disabled={sendingEmail || selectedSellers.size === 0 || !emailSubject.trim() || emailSentOk}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm ${emailSentOk ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-primary text-primary-foreground hover:bg-primary-hover'}`}
                            >
                                {sendingEmail
                                    ? 'Sending...'
                                    : emailSentOk
                                        ? <><Check className="w-4 h-4" /> Sent successfully!</>
                                        : <><Send className="w-4 h-4" /> {selectedSellers.size > 1 ? `Send to ${selectedSellers.size} sellers` : 'Send Email'}</>}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}

function getPlanBadge(plan: string) {
    const styles: Record<string, string> = {
        FREE: 'bg-gray-100 text-gray-500',
        BASIC: 'bg-blue-50 text-blue-600',
        PRO: 'bg-violet-50 text-violet-600',
        PREMIUM: 'bg-amber-50 text-amber-600',
        LIFETIME: 'bg-emerald-50 text-emerald-600',
    };
    return styles[plan] || 'bg-gray-100 text-gray-500';
}
