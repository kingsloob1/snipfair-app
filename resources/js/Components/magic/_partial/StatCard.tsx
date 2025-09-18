import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import React from 'react';
interface StatCardProps {
    title: string;
    value: string | number;
    period: string;
    change: {
        value: number;
        text: string;
        isPositive: boolean;
    };
    variant?: 'normal' | 'gradient';
}
export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    period,
    change,
    variant,
}) => {
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 20,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            className={cn(
                'rounded-lg border border-sf-stroke p-4 shadow-sm md:p-6',
                variant === 'gradient'
                    ? 'bg-sf-gradient-primary [&_*]:!text-sf-white'
                    : 'bg-sf-white',
            )}
        >
            <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-gray-500">{title}</span>
                <select className="hidden border-none bg-transparent text-sm text-gray-600 outline-none">
                    <option>{period}</option>
                </select>
            </div>
            <div className="mb-2 text-2xl font-semibold">{value}</div>
            <div
                className={`hidden text-sm ${change.isPositive ? 'text-green-500' : 'text-red-500'}`}
            >
                <span className="flex items-center gap-1">
                    {change.isPositive ? '↑' : '↓'} {change.value}%{' '}
                    {change.text}
                </span>
            </div>
        </motion.div>
    );
};
