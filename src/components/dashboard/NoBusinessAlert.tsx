'use client';

import React from 'react';
import { Building2, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function NoBusinessAlert() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-8 max-w-2xl mx-auto"
        >
            <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center shadow-inner">
                <Building2 className="w-12 h-12 text-primary" />
            </div>

            <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight text-foreground font-display">
                    Welcome to Rasid!
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                    You haven't added a business yet. To start creating invoices, managing inventory, and tracking sales, you'll need to set up your business profile first.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link href="/onboarding">
                    <Button size="lg" className="h-14 px-8 text-base font-bold shadow-xl shadow-primary/25 gap-3 group">
                        <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                        Add Your Business
                        <ArrowRight className="w-5 h-5" />
                    </Button>
                </Link>
                <Link href="/help">
                    <Button variant="outline" size="lg" className="h-14 px-8 text-base font-semibold border-border/50 hover:bg-muted/50 transition-colors">
                        Learn How it Works
                    </Button>
                </Link>
            </div>

            <p className="text-sm text-muted-foreground pt-4 italic">
                It only takes 60 seconds to get started.
            </p>
        </motion.div>
    );
}
