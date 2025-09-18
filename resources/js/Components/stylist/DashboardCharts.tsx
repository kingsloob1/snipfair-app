import {
    Area,
    AreaChart,
    // CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface BookingTrendData {
    name: string;
    value: number;
}

interface AppointmentTrendData {
    name: string;
    scheduled: number;
    premium: number;
}

interface BookingTrendsChartProps {
    data?: BookingTrendData[];
}

interface AppointmentTrendChartProps {
    data?: AppointmentTrendData[];
}

export const BookingTrendsChart = ({ data = [] }: BookingTrendsChartProps) => {
    return (
        <div className="rounded-lg border border-sf-stroke bg-sf-white p-4 shadow-sm md:p-6">
            <h3 className="mb-4 text-lg font-semibold">Booking Trends</h3>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient
                                id="colorValue"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="hsl(var(--sf-primary))"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="hsl(var(--sf-primary))"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>
                        {/* <CartesianGrid strokeDasharray="3 3" /> */}
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="hsl(var(--sf-primary))"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
export const AppointmentTrendChart = ({
    data = [],
}: AppointmentTrendChartProps) => {
    return (
        <div className="rounded-lg border border-sf-stroke bg-sf-white p-4 shadow-sm md:p-6">
            <h3 className="mb-4 text-lg font-semibold">Appointment Trend</h3>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient
                                id="colorScheduled"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="hsl(var(--sf-orange-53))"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="hsl(var(--sf-orange-53))"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                            <linearGradient
                                id="colorPremium"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="hsl(var(--sf-gradient-pink))"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="hsl(var(--sf-gradient-pink))"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>
                        {/* <CartesianGrid strokeDasharray="3 3" /> */}
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Area
                            type="monotone"
                            dataKey="scheduled"
                            stroke="hsl(var(--sf-orange-53))"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorScheduled)"
                        />
                        <Area
                            type="monotone"
                            dataKey="premium"
                            stroke="hsl(var(--sf-gradient-pink))"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorPremium)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
