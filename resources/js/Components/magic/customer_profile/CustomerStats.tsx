import { cn } from '@/lib/utils';
import { Calendar, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';

interface CustomerStatsProps {
    className?: string;
    totalSpending: number;
    appointmentCount: number;
    canceledPercentage: number;
    rescheduledPercentage: number;
}

export default function CustomerStats({
    className = '',
    totalSpending,
    appointmentCount,
    canceledPercentage,
    rescheduledPercentage,
}: CustomerStatsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const getPercentageColor = (percentage: number, isGood = false) => {
        if (isGood) {
            return percentage >= 80
                ? 'text-green-600'
                : percentage >= 60
                  ? 'text-yellow-600'
                  : 'text-red-600';
        } else {
            return percentage <= 10
                ? 'text-green-600'
                : percentage <= 25
                  ? 'text-yellow-600'
                  : 'text-red-600';
        }
    };

    const stats = [
        {
            icon: DollarSign,
            label: 'Total Spending',
            value: formatCurrency(totalSpending),
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            icon: Calendar,
            label: 'Total Appointments',
            value: appointmentCount.toString(),
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
    ];

    return (
        <div
            className={cn(
                'w-full space-y-6 overflow-hidden rounded-2xl border border-sf-stroke p-3.5 shadow-sm shadow-sf-gray/20 md:p-6',
                className,
            )}
        >
            <h2 className="mb-6 text-base font-bold text-sf-black md:text-lg">
                Customer Statistics
            </h2>

            {/* Main Stats */}
            <div className="space-y-4">
                {stats.map((stat, index) => {
                    const IconComponent = stat.icon;
                    return (
                        <div
                            key={index}
                            className={cn(
                                'flex items-center gap-3 rounded-xl p-4',
                                stat.bgColor,
                            )}
                        >
                            <div
                                className={cn(
                                    'flex h-10 w-10 items-center justify-center rounded-full bg-white',
                                    stat.color,
                                )}
                            >
                                <IconComponent className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600">
                                    {stat.label}
                                </p>
                                <p
                                    className={cn(
                                        'text-xl font-bold',
                                        stat.color,
                                    )}
                                >
                                    {stat.value}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Behavior Metrics */}
            <div className="space-y-4 border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-900">
                    Behavior Metrics
                </h3>

                {/* Canceled Appointments */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-gray-600">
                            Cancellation Rate
                        </span>
                    </div>
                    <span
                        className={cn(
                            'text-sm font-semibold',
                            getPercentageColor(canceledPercentage, false),
                        )}
                    >
                        {canceledPercentage.toFixed(1)}%
                    </span>
                </div>

                {/* Rescheduled Appointments */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-orange-500" />
                        <span className="text-sm text-gray-600">
                            Reschedule Rate
                        </span>
                    </div>
                    <span
                        className={cn(
                            'text-sm font-semibold',
                            getPercentageColor(rescheduledPercentage, false),
                        )}
                    >
                        {rescheduledPercentage.toFixed(1)}%
                    </span>
                </div>

                {/* Reliability Score */}
                <div className="mt-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 p-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                            Reliability Score
                        </span>
                        <span
                            className={cn(
                                'text-lg font-bold',
                                getPercentageColor(
                                    100 -
                                        canceledPercentage -
                                        rescheduledPercentage,
                                    true,
                                ),
                            )}
                        >
                            {Math.max(
                                0,
                                100 -
                                    canceledPercentage -
                                    rescheduledPercentage,
                            ).toFixed(1)}
                            %
                        </span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                        <div
                            className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                            style={{
                                width: `${Math.max(0, 100 - canceledPercentage - rescheduledPercentage)}%`,
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
