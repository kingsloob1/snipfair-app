import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
                inter: ['Inter', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                success: {
                    50: 'hsl(var(--success-50))',
                    normal: 'hsl(var(--success-normal))',
                    light: 'hsl(var(--success-light))',
                },
                warning: {
                    50: '#fff',
                    normal: 'hsl(var(--warning-normal))',
                },
                danger: {
                    50: '#fff',
                    normal: 'hsl(var(--danger-normal))',
                },
                'sf-yellow': {
                    47: 'hsl(var(--sf-yellow-47))',
                },
                'sf-orange': {
                    53: 'hsl(var(--sf-orange-53))',
                },
                'sf-gradient': {
                    purple: 'hsl(var(--sf-gradient-purple))',
                    pink: 'hsl(var(--sf-gradient-pink))',
                },
                'sf-white': {
                    DEFAULT: 'hsl(var(--sf-white))',
                    card: 'hsl(var(--sf-card-background))',
                    neutral: 'hsl(var(--sf-white-neutral))',
                },
                'sf-black': {
                    DEFAULT: 'hsl(var(--sf-black))',
                    secondary: 'hsl(var(--sf-black-secondary))',
                    neutral: 'hsl(var(--sf-black-neutral))',
                },
                'sf-primary': {
                    DEFAULT: 'hsl(var(--sf-primary))',
                    hover: 'hsl(var(--sf-primary-hover))',
                    paragraph: 'hsl(var(--sf-primary-paragraph))',
                    background: 'hsl(var(--sf-primary-background))',
                    light: 'hsl(var(--sf-primary-light))',
                },
                'sf-secondary': {
                    DEFAULT: 'hsl(var(--sf-secondary))',
                    paragraph: 'hsl(var(--sf-secondary-paragraph))',
                },
                'sf-gray': {
                    DEFAULT: 'hsl(var(--sf-gray))',
                    zinc: 'hsl(var(--sf-zinc))',
                },
                'sf-stroke': {
                    DEFAULT: 'hsl(var(--sf-stroke))',
                },
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                chart: {
                    1: 'hsl(var(--chart-1))',
                    2: 'hsl(var(--chart-2))',
                    3: 'hsl(var(--chart-3))',
                    4: 'hsl(var(--chart-4))',
                    5: 'hsl(var(--chart-5))',
                },
            },
            backgroundImage: {
                'sf-gradient-primary':
                    'linear-gradient(90deg, hsl(var(--sf-gradient-purple)) 0%, hsl(var(--sf-gradient-pink)) 100%)',
                'sf-gradient-secondary':
                    'linear-gradient(90deg, hsl(var(--sf-yellow-47)) 0%, hsl(var(--sf-orange-53)) 100%)',
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            boxShadow: {
                'sf-custom': '0px 0px 45px 0px rgba(112, 144, 176, 0.12)',
            },
            dropShadow: {
                'sf-custom': '2px 2px 10px rgba(0, 0, 0, 1)',
            },
        },
        screens: {
            sm: '480px',
            md: '768px',
            lg: '976px',
            xl: '1440px',
        },
    },
    darkMode: ['class', 'class'],
    plugins: [forms, typography, require('tailwindcss-animate')],
};
//darkMode: 'selector',
