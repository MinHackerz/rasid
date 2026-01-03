'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

/* ============================================
   INPUT
   ============================================ */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, hint, icon, ...props }, ref) => {
        return (
            <div className="space-y-2">
                {label && (
                    <label className="block text-sm font-medium text-foreground/80 ml-1">
                        {label}
                    </label>
                )}
                <div className="relative group">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            'w-full h-11 bg-background border border-input rounded-xl text-sm transition-all duration-200',
                            'placeholder:text-muted-foreground/60',
                            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            error ? 'border-destructive focus:ring-destructive/20' : 'hover:border-primary/50',
                            icon ? 'pl-10 pr-3' : 'px-4',
                            className
                        )}
                        {...props}
                    />
                </div>
                {hint && !error && (
                    <p className="text-[0.8rem] text-muted-foreground ml-1">{hint}</p>
                )}
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[0.8rem] text-destructive font-medium ml-1"
                    >
                        {error}
                    </motion.p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

/* ============================================
   TEXTAREA
   ============================================ */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="space-y-2">
                {label && (
                    <label className="block text-sm font-medium text-foreground/80 ml-1">
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    className={cn(
                        'w-full min-h-[100px] px-4 py-3 bg-background border border-input rounded-xl text-sm transition-all duration-200 resize-y',
                        'placeholder:text-muted-foreground/60',
                        'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        error ? 'border-destructive focus:ring-destructive/20' : 'hover:border-primary/50',
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="text-[0.8rem] text-destructive font-medium ml-1">{error}</p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

/* ============================================
   SELECT
   ============================================ */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, children, ...props }, ref) => {
        return (
            <div className="space-y-2">
                {label && (
                    <label className="block text-sm font-medium text-foreground/80 ml-1">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        className={cn(
                            'w-full h-11 px-4 bg-background border border-input rounded-xl text-sm transition-all duration-200 appearance-none',
                            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            error ? 'border-destructive focus:ring-destructive/20' : 'hover:border-primary/50',
                            className
                        )}
                        {...props}
                    >
                        {children}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
                {error && (
                    <p className="text-[0.8rem] text-destructive font-medium ml-1">{error}</p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';

/* ============================================
   CHECKBOX
   ============================================ */
interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, label, ...props }, ref) => {
        return (
            <label className="flex items-center gap-3 cursor-pointer group">
                <input
                    ref={ref}
                    type="checkbox"
                    className={cn(
                        'w-5 h-5 rounded-[6px] border border-input text-primary transition-all',
                        'focus:ring-2 focus:ring-primary/20 focus:ring-offset-0',
                        'checked:bg-primary checked:border-primary',
                        className
                    )}
                    {...props}
                />
                {label && (
                    <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">{label}</span>
                )}
            </label>
        );
    }
);

Checkbox.displayName = 'Checkbox';

/* ============================================
   FORM HELPERS
   ============================================ */
interface FormGroupProps {
    children: React.ReactNode;
    className?: string;
}

const FormGroup = ({ children, className }: FormGroupProps) => (
    <div className={cn('space-y-5', className)}>{children}</div>
);

interface FormRowProps {
    children: React.ReactNode;
    cols?: 1 | 2 | 3 | 4;
    className?: string;
}

const FormRow = ({ children, cols = 2, className }: FormRowProps) => {
    const gridCols = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    };

    return (
        <div className={cn('grid gap-5', gridCols[cols], className)}>
            {children}
        </div>
    );
};

interface FormSectionProps {
    title?: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}

const FormSection = ({ title, description, children, className }: FormSectionProps) => (
    <div className={cn('space-y-5', className)}>
        {(title || description) && (
            <div className="space-y-1">
                {title && (
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">{title}</h3>
                )}
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
            </div>
        )}
        {children}
    </div>
);

export { Input, Textarea, Select, Checkbox, FormGroup, FormRow, FormSection };
