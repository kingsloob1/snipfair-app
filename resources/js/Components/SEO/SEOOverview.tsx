import {
    AlertCircle,
    BarChart3,
    CheckCircle,
    ExternalLink,
    FileText,
    Globe,
    RefreshCw,
    Search,
    Users,
} from 'lucide-react';
import { motion } from 'motion/react';
import React, { useState } from 'react';

interface SEOMetric {
    label: string;
    value: string | number;
    status: 'good' | 'warning' | 'error';
    description?: string;
}

interface SEOOverviewProps {
    metrics?: SEOMetric[];
    lastUpdated?: string;
    onRefresh?: () => void;
}

const SEOOverview: React.FC<SEOOverviewProps> = ({
    metrics = [],
    lastUpdated,
    onRefresh,
}) => {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const defaultMetrics: SEOMetric[] = [
        {
            label: 'Sitemap Status',
            value: 'Active',
            status: 'good',
            description: 'XML sitemap is generated and accessible',
        },
        {
            label: 'Total Pages Indexed',
            value: '150+',
            status: 'good',
            description: 'Pages included in sitemap',
        },
        {
            label: 'Meta Descriptions',
            value: '98%',
            status: 'good',
            description: 'Pages with meta descriptions',
        },
        {
            label: 'Page Load Speed',
            value: '2.1s',
            status: 'warning',
            description: 'Average page load time',
        },
        {
            label: 'Mobile Friendly',
            value: 'Yes',
            status: 'good',
            description: 'All pages are mobile responsive',
        },
        {
            label: 'Schema Markup',
            value: 'Implemented',
            status: 'good',
            description: 'Structured data is present',
        },
    ];

    const displayMetrics = metrics.length > 0 ? metrics : defaultMetrics;

    const handleRefresh = async () => {
        setIsRefreshing(true);
        if (onRefresh) {
            await onRefresh();
        }
        setTimeout(() => setIsRefreshing(false), 2000);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'good':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'warning':
                return <AlertCircle className="h-5 w-5 text-yellow-500" />;
            case 'error':
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            default:
                return <CheckCircle className="h-5 w-5 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'good':
                return 'border-green-200 bg-green-50';
            case 'warning':
                return 'border-yellow-200 bg-yellow-50';
            case 'error':
                return 'border-red-200 bg-red-50';
            default:
                return 'border-gray-200 bg-gray-50';
        }
    };

    return (
        <div className="rounded-xl bg-white p-6 shadow-sm">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 p-2">
                        <Search className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            SEO Overview
                        </h2>
                        <p className="text-sm text-gray-600">
                            Monitor your website's search engine optimization
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {lastUpdated && (
                        <span className="text-sm text-gray-500">
                            Updated: {lastUpdated}
                        </span>
                    )}
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100 disabled:opacity-50"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                        />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {displayMetrics.map((metric, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`rounded-lg border p-4 ${getStatusColor(metric.status)}`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(metric.status)}
                                    <h3 className="font-medium text-gray-900">
                                        {metric.label}
                                    </h3>
                                </div>
                                <p className="mt-1 text-2xl font-bold text-gray-900">
                                    {metric.value}
                                </p>
                                {metric.description && (
                                    <p className="mt-1 text-sm text-gray-600">
                                        {metric.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 border-t pt-6">
                <h3 className="mb-4 font-medium text-gray-900">
                    Quick Actions
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <a
                        href="/sitemap.xml"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 text-sm transition-colors hover:bg-gray-50"
                    >
                        <FileText className="h-4 w-4 text-gray-500" />
                        View Sitemap
                        <ExternalLink className="h-3 w-3 text-gray-400" />
                    </a>

                    <a
                        href="/robots.txt"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 text-sm transition-colors hover:bg-gray-50"
                    >
                        <Globe className="h-4 w-4 text-gray-500" />
                        View Robots.txt
                        <ExternalLink className="h-3 w-3 text-gray-400" />
                    </a>

                    <button
                        onClick={() =>
                            window.open(
                                'https://search.google.com/search-console',
                                '_blank',
                            )
                        }
                        className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 text-sm transition-colors hover:bg-gray-50"
                    >
                        <BarChart3 className="h-4 w-4 text-gray-500" />
                        Search Console
                        <ExternalLink className="h-3 w-3 text-gray-400" />
                    </button>

                    <button
                        onClick={() =>
                            window.open('https://pagespeed.web.dev/', '_blank')
                        }
                        className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 text-sm transition-colors hover:bg-gray-50"
                    >
                        <Users className="h-4 w-4 text-gray-500" />
                        PageSpeed Test
                        <ExternalLink className="h-3 w-3 text-gray-400" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SEOOverview;
