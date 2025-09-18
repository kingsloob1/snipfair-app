import { AlertCircle, Clock, TrendingDown, TrendingUp } from 'lucide-react';
import React from 'react';

interface MetricCardProps {
    title: string;
    value: string;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    subtitle?: string;
    icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    change,
    changeType,
    subtitle,
    icon,
}) => {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow duration-200 hover:shadow-md">
            <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                    {title}
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400">
                    {icon}
                </div>
            </div>

            <div className="mb-3">
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            </div>

            <div className="flex items-center justify-between">
                {change && (
                    <div
                        className={`flex items-center text-sm font-medium ${
                            changeType === 'positive'
                                ? 'text-green-600'
                                : changeType === 'negative'
                                  ? 'text-red-600'
                                  : 'text-gray-600'
                        }`}
                    >
                        {changeType === 'positive' ? (
                            <TrendingUp className="mr-1 h-4 w-4" />
                        ) : changeType === 'negative' ? (
                            <TrendingDown className="mr-1 h-4 w-4" />
                        ) : null}
                        {change}
                    </div>
                )}

                {subtitle && (
                    <span className="text-sm text-gray-500">{subtitle}</span>
                )}
            </div>
        </div>
    );
};

interface DashboardMetricsProps {
    metrics: {
        totalRevenue: {
            value: string;
            change: string;
            changeType: 'positive' | 'negative' | 'neutral';
        };
        commissionEarned: {
            value: string;
            change: string;
            changeType: 'positive' | 'negative' | 'neutral';
        };
        pendingPayouts: {
            value: string;
            subtitle: string;
        };
        failedRequests: {
            value: string;
            subtitle: string;
        };
    };
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ metrics }) => {
    const cards: MetricCardProps[] = [
        {
            title: 'Total Revenue',
            value: metrics.totalRevenue.value,
            change: metrics.totalRevenue.change,
            changeType: metrics.totalRevenue.changeType,
            icon: <span className="text-lg">$</span>,
        },
        {
            title: 'Commission Earned',
            value: metrics.commissionEarned.value,
            change: metrics.commissionEarned.change,
            changeType: metrics.commissionEarned.changeType,
            icon: <span className="text-lg">$</span>,
        },
        {
            title: 'Pending Payouts',
            value: metrics.pendingPayouts.value,
            subtitle: metrics.pendingPayouts.subtitle,
            icon: <Clock className="h-4 w-4" />,
        },
        {
            title: 'Failed Requests',
            value: metrics.failedRequests.value,
            subtitle: metrics.failedRequests.subtitle,
            icon: <AlertCircle className="h-4 w-4" />,
        },
    ];

    return (
        <div className="w-full py-5">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {cards.map((card, index) => (
                    <MetricCard key={index} {...card} />
                ))}
            </div>
        </div>
    );
};

export default DashboardMetrics;
