import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
                display: ['Outfit', 'Inter', 'sans-serif'],
            },
            colors: {
                border: 'hsl(var(--color-border))',
                input: 'hsl(var(--color-input))',
                ring: 'hsl(var(--color-primary))', // Added ring default
                background: {
                    DEFAULT: 'hsl(var(--color-background))',
                    subtle: 'hsl(var(--color-background-subtle))', // Added this
                },
                foreground: {
                    DEFAULT: 'hsl(var(--color-foreground))',
                    muted: 'hsl(var(--color-foreground-muted))', // Added this
                },
                primary: {
                    DEFAULT: 'hsl(var(--color-primary))',
                    foreground: 'hsl(var(--color-primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--color-secondary))',
                    foreground: 'hsl(var(--color-secondary-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--color-destructive))',
                    foreground: 'hsl(var(--color-destructive-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--color-muted))',
                    foreground: 'hsl(var(--color-muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--color-accent))',
                    foreground: 'hsl(var(--color-accent-foreground))',
                },
                card: {
                    DEFAULT: 'hsl(var(--color-card))',
                    foreground: 'hsl(var(--color-card-foreground))',
                },
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            keyframes: {
                'fade-in': {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
                'slide-up': {
                    from: { opacity: '0', transform: 'translateY(10px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                'slide-down': {
                    from: { opacity: '0', transform: 'translateY(-10px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                'scale-in': {
                    from: { opacity: '0', transform: 'scale(0.95)' },
                    to: { opacity: '1', transform: 'scale(1)' },
                },
            },
            animation: {
                'fade-in': 'fade-in 0.2s ease-out',
                'slide-up': 'slide-up 0.3s ease-out',
                'slide-down': 'slide-down 0.3s ease-out',
                'scale-in': 'scale-in 0.2s ease-out',
            },
        },
    },
    plugins: [],
};

export default config;
