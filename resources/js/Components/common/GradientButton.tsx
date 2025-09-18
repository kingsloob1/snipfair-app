import { cn } from '@/lib/utils';
import React from 'react';

interface GradientButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    text: string;
    variant?: 'primary' | 'secondary';
    borderSize?: number;
}

const GradientButton: React.FC<GradientButtonProps> = ({
    text,
    variant = 'primary',
    className = '',
    borderSize = 1,
    ...rest
}) => {
    const gradientClasses = {
        primary: 'from-sf-gradient-pink to-sf-gradient-purple',
        secondary: 'from-sf-yellow-47 to-sf-yellow-53',
    };

    const currentGradient = gradientClasses[variant];

    const sizeToPaddingClass: Record<number, string> = {
        1: 'p-px',
        2: 'p-0.5',
        4: 'p-1',
        6: 'p-1.5',
        8: 'p-2',
    };

    const paddingClass = sizeToPaddingClass[borderSize] || 'p-1';

    return (
        <button
            {...rest}
            className={cn(
                'relative inline-flex items-center justify-center bg-gradient-to-r bg-clip-text px-6 py-3 font-semibold text-transparent',
                'rounded-lg transition-all duration-300 hover:scale-105 active:scale-95',
                currentGradient,
                className,
            )}
        >
            <span
                className={cn(
                    'absolute inset-0 rounded-lg bg-gradient-to-r',
                    currentGradient,
                    paddingClass,
                )}
            >
                <span className="flex h-full w-full items-center justify-center rounded-lg bg-white"></span>
            </span>
            <span
                className={`relative z-10 bg-gradient-to-b bg-clip-text text-transparent ${currentGradient}`}
            >
                {text}
            </span>
        </button>
    );
};

export default GradientButton;
