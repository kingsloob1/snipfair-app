import {
    CheckCheck,
    Clock,
    MessageSquare,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import React from 'react';

interface MetricCardProps {
    title: string;
    value: string;
    change?: string;
    changeType?: 'positive' | 'negative';
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
                                : 'text-red-600'
                        }`}
                    >
                        {changeType === 'positive' ? (
                            <TrendingUp className="mr-1 h-4 w-4" />
                        ) : (
                            <TrendingDown className="mr-1 h-4 w-4" />
                        )}
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
        metricOne: {
            value: string;
            subtitle: string;
        };
        metricTwo: {
            value: string;
            change: string;
            changeType: 'positive' | 'negative';
        };
        metricThree: {
            value: string;
            change: string;
            changeType: 'positive' | 'negative';
        };
        metricFour: {
            value: string;
            subtitle: string;
        };
    };
}

const StatCards: React.FC<DashboardMetricsProps> = ({ metrics }) => {
    const cards: MetricCardProps[] = [
        {
            title: 'Open Tickets',
            value: metrics.metricOne.value,
            subtitle: metrics.metricOne.subtitle,
            icon: <MessageSquare className="h-4 w-4" />,
        },
        {
            title: 'Avg Response Time',
            value: metrics.metricTwo.value,
            change: metrics.metricTwo.change,
            changeType: metrics.metricTwo.changeType,
            icon: <Clock className="h-4 w-4" />,
        },
        {
            title: 'Resolved Today',
            value: metrics.metricThree.value,
            change: metrics.metricThree.change,
            changeType: metrics.metricThree.changeType,
            icon: <CheckCheck className="h-4 w-4" />,
        },
        {
            title: 'Satisfaction',
            value: metrics.metricFour.value,
            subtitle: metrics.metricFour.subtitle,
            icon: <TrendingUp className="h-4 w-4" />,
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

export default StatCards;
