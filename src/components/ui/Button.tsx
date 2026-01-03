'use client';

import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'glass';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    loading?: boolean;
    children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

        const variants = {
            primary: 'bg-primary text-primary-foreground hover:bg-primary/90 border border-neutral-900 shadow-none',
            secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-transparent',
            outline: 'border border-neutral-900 bg-background text-foreground hover:bg-accent hover:text-accent-foreground shadow-none',
            ghost: 'text-foreground/70 hover:bg-accent/10 hover:text-accent border border-transparent',
            destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 border border-transparent',
            glass: 'glass text-foreground hover:bg-white/40 shadow-sm border-white/20',
        };

        const sizes = {
            sm: 'h-8 px-3 text-xs',
            md: 'h-11 px-4 text-sm',
            lg: 'h-12 px-6 text-base',
            icon: 'h-10 w-10',
        };

        return (
            <motion.button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || loading}
                whileHover={{ y: 0 }}
                whileTap={{ scale: 0.98 }}
                {...props}
            >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {children}
            </motion.button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
