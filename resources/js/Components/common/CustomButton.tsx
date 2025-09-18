import { cn } from '@/lib/utils';
import { PropsWithChildren } from 'react';

interface CustomButtonProps {
    variant?: 'primary' | 'secondary' | 'custom' | 'black';
    type?: 'button' | 'submit' | 'reset';
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
}

const CustomButton = ({
    variant = 'primary',
    type = 'button',
    children = 'Loading...',
    onClick,
    className = '',
    disabled = false,
    loading = false,
    fullWidth = true,
}: PropsWithChildren<CustomButtonProps>) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            type={type}
            className={cn(
                variant === 'custom'
                    ? 'transition-all duration-500 ease-in-out hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-50'
                    : 'h-13 flex transform items-center justify-center rounded-xl px-3 py-2 font-medium transition-all duration-500 ease-in-out hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-50 md:px-6 md:py-3',
                variant === 'primary'
                    ? 'bg-gradient-to-r from-sf-gradient-purple to-sf-gradient-pink text-white hover:bg-gradient-to-r hover:from-sf-gradient-pink hover:to-sf-gradient-purple disabled:from-sf-gradient-purple disabled:to-sf-gradient-pink'
                    : variant === 'custom'
                      ? ''
                      : variant === 'black'
                        ? 'border border-sf-stroke bg-sf-primary-paragraph text-sf-white hover:bg-sf-black disabled:bg-sf-black-secondary'
                        : 'border border-sf-stroke bg-sf-primary-background text-sf-black disabled:bg-sf-primary-background',
                fullWidth && 'w-full',
                className,
            )}
        >
            <div className="flex items-center space-x-2">
                {/* Content */}
                <div className="flex items-center space-x-2">
                    {loading ? (
                        <>
                            <div className="flex h-5 w-5 items-center justify-center">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            </div>
                            <span className="text-sm">Loading...</span>
                        </>
                    ) : (
                        <span className="text-sm">{children}</span>
                    )}
                </div>
            </div>
        </button>
    );
};

export default CustomButton;
