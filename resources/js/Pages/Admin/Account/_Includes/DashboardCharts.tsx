import React from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from 'recharts';

interface RevenueData {
    month: string;
    revenue: number;
}

interface PlatformUser {
    name: string;
    value: number;
    color: string;
}

interface BookingData {
    month: string;
    bookings: number;
}

interface UserGrowthData {
    month: string;
    customers: number;
    stylists: number;
}

interface SystemStatus {
    name: string;
    status: string;
    color: string;
}

interface ChartData {
    revenue: RevenueData[];
    userGrowth: UserGrowthData[];
    bookingTrends: BookingData[];
    revenueBreakdown: PlatformUser[];
}

interface DashboardChartsProps {
    chartData: ChartData;
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ chartData }) => {
    // System Status Data (keeping this static for now)
    const systemStatus: SystemStatus[] = [
        { name: 'System Status', status: 'Operational', color: '#ef4444' },
        { name: 'Payment Gateway', status: 'Online', color: '#3b82f6' },
        { name: 'Database', status: 'Healthy', color: '#10b981' },
        { name: 'API Services', status: 'Healthy', color: '#8b5cf6' },
        { name: 'Registration Rate', status: '99% Success', color: '#10b981' },
    ];

    const StatusIndicator: React.FC<{ status: SystemStatus }> = ({
        status,
    }) => (
        <div className="flex items-center justify-between py-2">
            <span className="text-gray-700">{status.name}</span>
            <div className="flex items-center">
                <div
                    className="mr-2 h-2 w-2 rounded-full"
                    style={{ backgroundColor: status.color }}
                />
                <span
                    className="text-sm font-medium"
                    style={{ color: status.color }}
                >
                    {status.status}
                </span>
            </div>
        </div>
    );

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Revenue Growth */}
                <div className="rounded-lg bg-white p-6 shadow-sm lg:col-span-2">
                    <h3 className="mb-4 text-lg font-semibold">
                        Monthly Revenue Growth
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData.revenue}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Bar
                                dataKey="revenue"
                                fill="#f97316"
                                name="Revenue"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-4 flex items-center justify-center">
                        <div className="flex items-center">
                            <div className="mr-2 h-3 w-3 rounded bg-orange-500"></div>
                            <span className="text-sm">Monthly Revenue</span>
                        </div>
                    </div>
                </div>

                {/* Revenue Breakdown */}
                <div className="hidden rounded-lg bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold">
                        Revenue Breakdown
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={chartData.revenueBreakdown}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={120}
                                dataKey="value"
                                startAngle={90}
                                endAngle={450}
                            >
                                {chartData.revenueBreakdown.map(
                                    (entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                        />
                                    ),
                                )}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                        {chartData.revenueBreakdown.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between"
                            >
                                <div className="flex items-center">
                                    <div
                                        className="mr-3 h-3 w-3 rounded"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-sm">{item.name}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span
                                        className="text-sm font-medium"
                                        style={{ color: item.color }}
                                    >
                                        {formatCurrency(item.value)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Platform Health */}
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold">
                        Platform Health
                    </h3>
                    <div className="space-y-1">
                        {systemStatus.map((status, index) => (
                            <StatusIndicator key={index} status={status} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Booking Trends */}
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold">
                        Booking Trends
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData.bookingTrends}>
                            <defs>
                                <linearGradient
                                    id="colorBookings"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor="#3b82f6"
                                        stopOpacity={0.8}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="#3b82f6"
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Area
                                type="monotone"
                                dataKey="bookings"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorBookings)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* User Growth */}
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold">User Growth</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData.userGrowth}>
                            <defs>
                                <linearGradient
                                    id="colorCustomers"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor="#3b82f6"
                                        stopOpacity={0.8}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="#3b82f6"
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                                <linearGradient
                                    id="colorStylists"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor="#8b5cf6"
                                        stopOpacity={0.8}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="#8b5cf6"
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Area
                                type="monotone"
                                dataKey="customers"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorCustomers)"
                                name="Customers"
                            />
                            <Area
                                type="monotone"
                                dataKey="stylists"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorStylists)"
                                name="Stylists"
                            />
                            <Legend />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default DashboardCharts;
