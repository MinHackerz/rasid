import { prisma } from '@/lib/prisma';
import { PLANS, PlanType } from '@/lib/constants/plans';
import { PlanTier } from '@prisma/client';

export async function checkLimit(sellerId: string, feature: 'invoices' | 'templates' | 'teamMembers' | 'pdfApi' | 'inventory' | 'ocr' | 'emailIntegration'): Promise<boolean> {
    const seller = await prisma.seller.findUnique({
        where: { id: sellerId },
        select: {
            plan: true,
            invoicesCount: true,
            pdfApiUsage: true,
            ocrUsage: true,
            lastResetDate: true,
        }
    });

    if (!seller) return false;

    // Lazy Reset: If last reset was more than 30 days ago, reset counts
    const now = new Date();
    const lastReset = new Date(seller.lastResetDate);
    const diffTime = Math.abs(now.getTime() - lastReset.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 30) {
        // Reset counts
        await prisma.seller.update({
            where: { id: sellerId },
            data: {
                invoicesCount: 0,
                pdfApiUsage: 0,
                ocrUsage: 0,
                lastResetDate: new Date()
            }
        });

        // Update local object to reflect reset for the current check
        seller.invoicesCount = 0;
        seller.pdfApiUsage = 0;
        seller.ocrUsage = 0;
    }

    // Default to FREE if plan is somehow null/invalid
    const planKey = (seller.plan || 'FREE') as PlanType;
    const planLimits = PLANS[planKey].limits;

    switch (feature) {
        case 'invoices':
            return seller.invoicesCount < planLimits.invoices;
        case 'teamMembers':
            // Need to count current members
            const memberCount = await prisma.teamMember.count({ where: { sellerId } });
            return memberCount < planLimits.teamMembers;
        case 'pdfApi':
            return seller.pdfApiUsage < planLimits.pdfApi;
        case 'inventory':
            return planLimits.inventory;
        case 'ocr':
            return seller.ocrUsage < planLimits.ocr;
        case 'emailIntegration':
            return planLimits.emailIntegration;
        case 'templates':
            // Templates check is usually "can I use THIS template?". 
            // This function checks generic limit, but templates are specific access lists.
            // We might need a separate check for specific template ID.
            return true;
        default:
            return false;
    }
}

export async function canUseTemplate(sellerId: string, templateId: string): Promise<boolean> {
    const seller = await prisma.seller.findUnique({
        where: { id: sellerId },
        select: { plan: true }
    });

    if (!seller) return false;

    const planKey = (seller.plan || 'FREE') as PlanType;
    const planLimits = PLANS[planKey].limits;

    if (planLimits.templateIds.includes('all')) return true;
    return planLimits.templateIds.includes(templateId);
}
