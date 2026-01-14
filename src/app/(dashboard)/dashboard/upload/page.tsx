import { getSession, getUserPlan } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PremiumFeatureGuard } from '@/components/dashboard/PremiumFeatureGuard';
import { PLANS, PlanType } from '@/lib/constants/plans';
import UploadPageClient from './UploadPageClient';

export default async function UploadPage() {
    const session = await getSession();
    if (!session) return null;

    // Use cached plan fetch to avoid duplicate DB queries
    const currentPlanKey = await getUserPlan();
    const isAllowed = !!PLANS[currentPlanKey]?.limits.ocr && PLANS[currentPlanKey].limits.ocr > 0;

    return (
        <PremiumFeatureGuard
            isAllowed={isAllowed}
            featureName="Upload & Convert"
            description="Transform handwritten invoices into digital format using AI-powered OCR technology."
        >
            <UploadPageClient />
        </PremiumFeatureGuard>
    );
}
