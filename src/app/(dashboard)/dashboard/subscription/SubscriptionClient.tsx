'use client';

import { PLANS, PlanType } from '@/lib/constants/plans';
import {
    Card,
    CardHeader,
    CardBody,
    Badge,
    Progress,
    Button,
    Modal
} from '@/components/ui';
import Link from 'next/link';
import { Check, Zap, AlertCircle, Lock, Package, Mail, Loader2, XCircle, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { cancelSubscription } from '@/app/actions/subscription';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Helper Component for Feature Rows
function FeatureAccessRow({
    included,
    title,
    description,
    icon: Icon
}: {
    included: boolean;
    title: string;
    description: string;
    icon: any;
}) {
    if (included) {
        return (
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-neutral-200/50">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-emerald-100/50 text-emerald-600 rounded-lg">
                        <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                        <div className="font-medium text-sm text-neutral-900 leading-none">{title}</div>
                        <p className="text-xs text-neutral-500">{description}</p>
                    </div>
                </div>
                <Badge variant="success">
                    Included
                </Badge>
            </div>
        );
    }

    return (
        <div className="relative group overflow-hidden rounded-xl border border-neutral-200/80 p-4">
            {/* Blurred Content */}
            <div className="flex items-center justify-between filter blur-[2px] opacity-40 select-none pointer-events-none grayscale">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-neutral-100 rounded-lg">
                        <Icon className="w-5 h-5 text-neutral-500" />
                    </div>
                    <div className="space-y-1">
                        <div className="font-medium text-sm text-neutral-900 leading-none">{title}</div>
                        <p className="text-xs text-neutral-500">{description}</p>
                    </div>
                </div>
                <Badge variant="draft" className="text-neutral-400">Locked</Badge>
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/5 backdrop-blur-[1px] transition-all">
                <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-3.5 h-3.5 text-neutral-500" />
                    <span className="text-xs font-medium text-neutral-600">Premium Feature</span>
                </div>
                <Link href="/pricing">
                    <Button size="sm" variant="primary" className="h-8 text-xs px-4 shadow-sm hover:shadow-md transition-all">
                        Upgrade to Unlock
                    </Button>
                </Link>
            </div>
        </div>
    );
}

interface SubscriptionClientProps {
    seller: {
        plan: PlanType;
        invoicesCount: number;
        pdfApiUsage: number;
        ocrUsage: number;
        lastResetDate: Date;
        subscriptionId?: string | null;
        cancelledAt?: Date | null;
        subscriptionEndsAt?: Date | null;
    };
}

export default function SubscriptionClient({ seller }: SubscriptionClientProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);

    const handleCancelSubscription = async () => {
        setIsLoading(true);
        try {
            await cancelSubscription();
            toast.success('Subscription will be cancelled at the end of your billing period. You will retain access until then.');
            setShowCancelModal(false);
            router.refresh();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Failed to cancel subscription');
        } finally {
            setIsLoading(false);
        }
    };

    const currentPlanKey = (seller.plan || 'FREE') as PlanType;
    const currentPlan = PLANS[currentPlanKey];
    const limits = currentPlan.limits;

    // Helper to calculate percentage safely
    const getPercentage = (used: number, limit: number) => {
        if (limit === 0) return 100; // If limit is 0 (unlimited or none), handle accordingly
        // If limit is incredibly high (lifetime/unlimited), we might show low percentage
        if (limit > 1000000) return 0;
        return Math.min(100, (used / limit) * 100);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
    };

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Subscription & Usage</h1>
                    <p className="text-muted-foreground mt-1">Manage your plan and monitor resource consumption.</p>
                </div>
                <Link href="/pricing">
                    <Button variant={currentPlanKey === 'FREE' ? 'primary' : 'outline'}>
                        {currentPlanKey === 'FREE' ? 'Upgrade Plan' : 'Change Plan'}
                    </Button>
                </Link>
            </div>

            {/* Current Plan Card */}
            <Card className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white border-neutral-800">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                {currentPlan.name} Plan
                                {seller.cancelledAt && currentPlanKey !== 'FREE' ? (
                                    <Badge variant="warning" className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border-0">
                                        Cancelling
                                    </Badge>
                                ) : (
                                    <Badge variant="success" className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-0">
                                        Active
                                    </Badge>
                                )}
                            </h2>
                            <p className="text-neutral-400 mt-2">
                                {seller.cancelledAt && currentPlanKey !== 'FREE'
                                    ? `Your ${currentPlan.name} plan will end on ${seller.subscriptionEndsAt ? formatDate(new Date(seller.subscriptionEndsAt)) : 'the end of billing period'}.`
                                    : currentPlanKey === 'FREE'
                                        ? 'Get started with basic invoicing features.'
                                        : `You have access to ${currentPlan.name} features.`}
                            </p>
                        </div>
                        <div className="text-right">
                            {currentPlan.price > 0 && (
                                <div className="text-3xl font-bold">
                                    ${currentPlan.price}<span className="text-sm font-normal text-neutral-400">/mo</span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <div className="text-sm text-neutral-400 mb-1">Billing Period</div>
                            <div className="font-semibold">
                                {currentPlan.period === 'lifetime' ? 'Lifetime Access' : 'Monthly'}
                            </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <div className="text-sm text-neutral-400 mb-1">
                                {currentPlanKey === 'FREE' ? 'Next Usage Reset' : (seller.cancelledAt ? 'Ends On' : 'Renews On')}
                            </div>
                            <div className="font-semibold">
                                {seller.subscriptionEndsAt
                                    ? formatDate(new Date(seller.subscriptionEndsAt))
                                    : formatDate(new Date(new Date(seller.lastResetDate).getTime() + 30 * 24 * 60 * 60 * 1000))
                                }
                            </div>
                        </div>
                    </div>

                    {/* Subscription Management Section */}
                    {currentPlanKey !== 'FREE' && currentPlanKey !== 'LIFETIME' && (
                        <div className="mt-8 pt-6 border-t border-white/10">
                            <h3 className="text-lg font-semibold mb-3">Subscription Management</h3>

                            {seller.cancelledAt ? (
                                // Subscription is pending cancellation
                                <div className="flex flex-wrap gap-4 items-center justify-between bg-amber-900/20 p-4 rounded-xl border border-amber-500/30">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-medium text-amber-400">Subscription Cancelled</h4>
                                            <Badge variant="warning">Pending</Badge>
                                        </div>
                                        <p className="text-sm text-amber-200/80 mt-1">
                                            Your subscription will end on{' '}
                                            <strong>
                                                {seller.subscriptionEndsAt
                                                    ? formatDate(new Date(seller.subscriptionEndsAt))
                                                    : 'the end of your billing period'}
                                            </strong>.
                                            You'll retain full access until then.
                                        </p>
                                    </div>
                                    <Link href="/pricing">
                                        <Button variant="outline" className="border-amber-400/50 text-amber-400 hover:bg-amber-400/10">
                                            Resubscribe
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                // Active subscription - show cancel option
                                <div className="flex flex-wrap gap-4 items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
                                    <div>
                                        <h4 className="font-medium text-white">Manage Subscription</h4>
                                        <p className="text-sm text-neutral-400">Cancel or modify your current plan.</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            variant="ghost"
                                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                            onClick={() => setShowCancelModal(true)}
                                            disabled={isLoading}
                                        >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Cancel Subscription
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Usage Stats */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader
                        title="Usage Limits"
                        description="Monthly consumption against your plan limits."
                    // icon would be good but CardHeader doesn't take icon prop directly like StatCard
                    >
                        {/* We can pass custom children if title prop isn't enough, but title prop works for simple headers */}
                    </CardHeader>
                    <CardBody className="space-y-6">

                        {/* Invoices */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">Invoices Created</span>
                                <span className="text-muted-foreground">
                                    {seller.invoicesCount} / {limits.invoices > 100000 ? 'Unlimited' : limits.invoices}
                                </span>
                            </div>
                            <Progress value={getPercentage(seller.invoicesCount, limits.invoices)} className="h-2" />
                        </div>

                        {/* PDF API */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">PDF API Requests</span>
                                <span className="text-muted-foreground">
                                    {seller.pdfApiUsage} / {limits.pdfApi > 100000 ? 'Unlimited' : limits.pdfApi}
                                </span>
                            </div>
                            <Progress value={getPercentage(seller.pdfApiUsage, limits.pdfApi)} className="h-2" />
                        </div>

                        {/* OCR */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">OCR Scans (Digitization)</span>
                                <span className="text-muted-foreground">
                                    {seller.ocrUsage} / {limits.ocr > 100000 ? 'Unlimited' : limits.ocr}
                                </span>
                            </div>
                            <Progress value={getPercentage(seller.ocrUsage, limits.ocr)} className="h-2" />
                        </div>

                        <div className="pt-2 space-y-4">
                            {/* Inventory */}
                            <FeatureAccessRow
                                title="Inventory Management"
                                description="Track stock levels, manage SKUs, and get low stock alerts."
                                icon={Package}
                                included={!!limits.inventory}
                            />

                            {/* Email */}
                            <FeatureAccessRow
                                title="Email & WhatsApp Integration"
                                description="Send invoices directly via Email and WhatsApp APIs."
                                icon={Mail}
                                included={!!limits.emailIntegration}
                            />
                        </div>

                    </CardBody>
                </Card>

                {/* Plan Features */}
                <Card>
                    <CardHeader title="Plan Features" description={`What's included in your ${currentPlan.name} plan.`} />
                    <CardBody>
                        <ul className="space-y-3">
                            {currentPlan.features.map((feature, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-sm">
                                    <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                                    <span className="text-neutral-600 dark:text-neutral-300 leading-tight">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        {currentPlanKey === 'FREE' && (
                            <div className="mt-8 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-emerald-900 text-sm">Upgrade to Pro</h4>
                                        <p className="text-emerald-700 text-sm mt-1">
                                            Get unlimited invoices, inventory management, and more starting at just $10/mo.
                                        </p>
                                        <Link href="/pricing" className="inline-block mt-3">
                                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white border-none">
                                                View Plans
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>

            {/* Cancel Subscription Modal */}
            <Modal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                title="Cancel Subscription"
            >
                <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-amber-900">Are you sure?</h4>
                            <p className="text-sm text-amber-700 mt-1">
                                Your subscription will be cancelled at the end of the current billing period.
                                You will retain full access to premium features until then.
                            </p>
                        </div>
                    </div>

                    <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                        <p>After cancellation:</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Your plan will revert to Free at the end of this billing period</li>
                            <li>Usage limits will be reset to Free tier limits</li>
                            <li>You can re-subscribe anytime</li>
                        </ul>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={() => setShowCancelModal(false)}>
                            Keep Subscription
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleCancelSubscription}
                            disabled={isLoading}
                            className="gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Cancelling...
                                </>
                            ) : (
                                <>
                                    <XCircle className="w-4 h-4" />
                                    Cancel at Period End
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
