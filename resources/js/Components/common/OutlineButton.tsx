import { cn } from '@/lib/utils';
import { PropsWithChildren } from 'react';

interface OutlineProps {
    className?: string;
    onClick?: () => void;
}

export default function OutlineButton({
    children,
    className,
    onClick,
}: PropsWithChildren<OutlineProps>) {
    return (
        <button
            onClick={onClick}
            className="duration-400 group relative mb-2 me-2 inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-sf-gradient-pink to-sf-gradient-purple p-0.5 text-sm font-medium shadow-black transition-all ease-in-out hover:from-sf-gradient-purple hover:to-sf-gradient-pink hover:shadow-md focus:outline-none focus:ring-4 focus:ring-pink-200"
        >
            <span
                className={cn(
                    'relative rounded-md bg-sf-white px-5 py-2.5 transition-all duration-300 ease-in-out',
                    className,
                )}
            >
                {children}
            </span>
        </button>
    );
}
