let confettiModulePromise: Promise<typeof import('canvas-confetti')> | null = null;

async function getConfetti() {
    if (typeof window === 'undefined') return null;
    if (!confettiModulePromise) {
        confettiModulePromise = import('canvas-confetti');
    }
    return confettiModulePromise;
}

type BillingMode = 'monthly' | 'annual';

export async function triggerBillingToggleConfetti(mode: BillingMode) {
    const mod = await getConfetti();
    if (!mod) return;

    const confetti = mod.default;
    const isAnnual = mode === 'annual';

    const base = {
        spread: 70,
        startVelocity: 25,
        gravity: 0.85,
        scalar: 0.9,
        ticks: 90,
        origin: { y: 0.3 }
    } as const;

    confetti({
        ...base,
        particleCount: isAnnual ? 80 : 45,
        angle: isAnnual ? 60 : 120,
    });

    confetti({
        ...base,
        particleCount: isAnnual ? 40 : 25,
        angle: isAnnual ? 120 : 60,
        decay: 0.9,
    });
}

