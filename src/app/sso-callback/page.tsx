'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function SSOCallback() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-white to-blue-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-sm space-y-6 p-8 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center"
            >
                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg shadow-violet-500/20">
                    <Image
                        src="/logos/Rasid_Logo.png"
                        alt="Rasid Logo"
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold font-display text-slate-900 tracking-tight">Authenticating...</h2>
                    <p className="text-sm text-slate-500">
                        Please wait while we securely log you in.
                    </p>
                </div>

                <div className="pt-4 pb-2">
                    <Loader2 className="w-8 h-8 text-violet-600 animate-spin mx-auto" />
                </div>

                {/* The actual component handling the background processing */}
                <div className="hidden">
                    <AuthenticateWithRedirectCallback />
                </div>
            </motion.div>
        </div>
    );
}
