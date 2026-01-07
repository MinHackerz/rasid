'use client';

import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ============================================
   CARD
   ============================================ */
interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
}

const Card = ({ children, className, hover }: CardProps) => (
    <div
        className={cn(
            'bg-card text-card-foreground rounded-2xl border border-border shadow-xs',
            hover && 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer',
            className
        )}
    >
        {children}
    </div>
);

/* ============================================
   CARD HEADER
   ============================================ */
interface CardHeaderProps {
    title?: string;
    description?: string;
    action?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
}

const CardHeader = ({ title, description, action, children, className }: CardHeaderProps) => (
    <div className={cn('px-6 py-5 border-b border-border/50', className)}>
        {children || (
            <div className="flex items-start justify-between gap-4">
                <div>
                    {title && (
                        <h3 className="text-base font-semibold text-foreground tracking-tight">{title}</h3>
                    )}
                    {description && (
                        <p className="text-xs text-muted-foreground mt-1">{description}</p>
                    )}
                </div>
                {action && <div className="flex-shrink-0">{action}</div>}
            </div>
        )}
    </div>
);

/* ============================================
   CARD BODY
   ============================================ */
interface CardBodyProps {
    children: React.ReactNode;
    className?: string;
}

const CardBody = ({ children, className }: CardBodyProps) => (
    <div className={cn('p-6', className)}>{children}</div>
);

/* ============================================
   CARD FOOTER
   ============================================ */
interface CardFooterProps {
    children: React.ReactNode;
    className?: string;
}

const CardFooter = ({ children, className }: CardFooterProps) => (
    <div className={cn('px-6 py-4 border-t border-border/50 bg-muted/20 rounded-b-2xl', className)}>
        {children}
    </div>
);

/* ============================================
   DIVIDER
   ============================================ */
const Divider = ({ className }: { className?: string }) => (
    <div className={cn('h-px bg-border my-4 opacity-50', className)} />
);

/* ============================================
   MODAL
   ============================================ */
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => {
    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
    };

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className={cn('relative w-full bg-background rounded-2xl shadow-2xl border border-border/50 overflow-hidden', sizes[size])}
                    >
                        {title && (
                            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-muted/10">
                                <h2 className="text-md font-semibold text-foreground">{title}</h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        <div className="p-6">{children}</div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

/* ============================================
   BADGE
   ============================================ */
type BadgeVariant = 'default' | 'draft' | 'pending' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'success' | 'error' | 'warning';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    dot?: boolean;
    className?: string;
}

const Badge = ({ children, variant = 'default', dot, className }: BadgeProps) => {
    const variants: Record<BadgeVariant, string> = {
        default: 'bg-secondary text-secondary-foreground border border-border/50',
        draft: 'bg-muted text-muted-foreground border border-border',
        pending: 'bg-orange-500/10 text-orange-700 border border-orange-200 dark:text-orange-400 dark:border-orange-500/30',
        sent: 'bg-blue-500/10 text-blue-700 border border-blue-200 dark:text-blue-400 dark:border-blue-500/30',
        paid: 'bg-emerald-500/10 text-emerald-700 border border-emerald-200 dark:text-emerald-400 dark:border-emerald-500/30',
        overdue: 'bg-red-500/10 text-red-700 border border-red-200 dark:text-red-400 dark:border-red-500/30',
        cancelled: 'bg-gray-500/10 text-gray-700 border border-gray-200 dark:text-gray-400 dark:border-gray-500/30',
        success: 'bg-emerald-500/10 text-emerald-700 border border-emerald-200',
        error: 'bg-destructive/10 text-destructive border border-destructive/20',
        warning: 'bg-yellow-500/10 text-yellow-700 border border-yellow-200',
    };

    const dotColors: Record<BadgeVariant, string> = {
        default: 'bg-gray-500',
        draft: 'bg-gray-500',
        pending: 'bg-orange-500',
        sent: 'bg-blue-500',
        paid: 'bg-emerald-500',
        overdue: 'bg-red-500',
        cancelled: 'bg-gray-400',
        success: 'bg-emerald-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full tracking-wide shadow-sm',
                variants[variant],
                className
            )}
        >
            {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
            {children}
        </span>
    );
};

/* ============================================
   EMPTY STATE
   ============================================ */
interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

const EmptyState = ({ icon, title, description, action, className }: EmptyStateProps) => (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center select-none', className)}>
        {icon && (
            <div className="mb-6 p-4 rounded-full bg-secondary text-muted-foreground/50 ring-8 ring-secondary/30">{icon}</div>
        )}
        <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
        {description && (
            <p className="text-sm text-muted-foreground w-full max-w-xs leading-relaxed">{description}</p>
        )}
        {action && <div className="mt-6">{action}</div>}
    </div>
);

/* ============================================
   STAT CARD
   ============================================ */
interface StatCardProps {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: { value: number; isPositive: boolean };
    className?: string;
}

const StatCard = ({ label, value, icon, trend, className }: StatCardProps) => (
    <Card className={cn('p-6 relative overflow-hidden', className)}>
        <div className="flex items-start justify-between mb-4 relative z-10">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {label}
            </span>
            {icon && (
                <span className="p-2 rounded-lg bg-secondary text-primary/70">{icon}</span>
            )}
        </div>
        <div className="flex items-end gap-3 relative z-10">
            <span className="text-3xl font-bold text-foreground font-display tracking-tight">
                {value}
            </span>
            {trend && (
                <span
                    className={cn(
                        'flex items-center gap-0.5 text-xs font-bold mb-1.5 px-1.5 py-0.5 rounded-md',
                        trend.isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'
                    )}
                >
                    {trend.isPositive ? (
                        <TrendingUp className="w-3 h-3" />
                    ) : (
                        <TrendingDown className="w-3 h-3" />
                    )}
                    {Math.abs(trend.value)}%
                </span>
            )}
        </div>
        {/* Subtle decorative gradient */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl z-0" />
    </Card>
);

/* ============================================
   SPINNER
   ============================================ */
interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const Spinner = ({ size = 'md', className }: SpinnerProps) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };

    return (
        <svg
            className={cn('animate-spin text-primary', sizes[size], className)}
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    );
};

/* ============================================
   SKELETON
   ============================================ */
interface SkeletonProps {
    className?: string;
}

const Skeleton = ({ className }: SkeletonProps) => (
    <div className={cn('bg-secondary rounded-lg animate-pulse', className)} />
);

export {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Divider,
    Modal,
    Badge,
    EmptyState,
    StatCard,
    Spinner,
    Skeleton,
};
