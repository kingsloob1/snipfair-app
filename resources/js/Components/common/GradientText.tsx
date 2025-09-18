import { cn } from '@/lib/utils';
import { PropsWithChildren } from 'react';

interface GradientProps {
    className?: string;
    variant?: 'primary' | 'secondary';
}

export default function GradientText({
    children,
    className,
    variant = 'primary',
}: PropsWithChildren<GradientProps>) {
    return (
        <span
            className={cn(
                'bg-gradient-to-b bg-clip-text text-transparent',
                className,
                variant === 'primary'
                    ? 'from-sf-gradient-purple to-sf-gradient-pink hover:text-sf-primary-paragraph'
                    : 'from-sf-orange-53 to-sf-yellow-47 hover:text-sf-orange-53',
            )}
        >
            {children}
        </span>
    );
}
