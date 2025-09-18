import { StatCard } from '@/Components/magic/_partial/StatCard';
import { StylistNavigationSteps } from '@/Components/magic/StylistNavigationSteps';
import DashboardAppointments from '@/Components/stylist/DashboardAppointments';
import {
    AppointmentTrendChart,
    BookingTrendsChart,
} from '@/Components/stylist/DashboardCharts';
import { StylistAuthLayout } from '@/Layouts/StylistAuthLayout';
import { AppointmentCardProps } from '@/types';
import { router } from '@inertiajs/react';
import ProfileCompleteness from './Profile/_Partials/ProfileCompleteness';

interface DashboardProps {
    appointments?: AppointmentCardProps[];
    statistics?: {
        total_earnings: number;
        total_appointments: number;
        average_rating: number;
        total_portfolios: number;
    };
    bookingTrends?: Array<{
        name: string;
        value: number;
    }>;
    appointmentTrends?: Array<{
        name: string;
        scheduled: number;
        premium: number;
    }>;
    profile_completeness?: {
        portfolio: boolean;
        payment_method: boolean;
        status_approved: boolean;
        location_service: boolean;
        social_links: boolean;
        works: boolean;
        user_banner: boolean;
        address: boolean;
        subscription_status: boolean;
        user_avatar: boolean;
        user_bio: boolean;
    };
}

export default function Dashboard({
    appointments,
    statistics,
    bookingTrends,
    appointmentTrends,
    profile_completeness,
}: DashboardProps) {
    const routes = [
        {
            name: 'Dashboard',
            path: route('stylist.dashboard'),
            active: false,
        },
    ];

    return (
        <StylistAuthLayout header="Stylist Home">
            <StylistNavigationSteps
                routes={routes}
                sub="Here's what's happening with your business today"
                cta="Manage Services"
                ctaAction={() => router.visit(route('stylist.portfolio'))}
            />
            <section className="mx-auto max-w-7xl px-5">
                <div className="mb-6">
                    <ProfileCompleteness
                        profile_completeness={profile_completeness}
                    />
                </div>
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                    <StatCard
                        title="Total Earnings"
                        value={`R${statistics?.total_earnings ?? 0}`}
                        period="This month"
                        change={{
                            value: 0,
                            text: 'Down from last month',
                            isPositive: true,
                        }}
                    />
                    <StatCard
                        title="Active Appointments"
                        value={`${statistics?.total_appointments ?? 0}`}
                        period="Today"
                        change={{
                            value: 0,
                            text: 'Down from yesterday',
                            isPositive: false,
                        }}
                    />
                    <StatCard
                        title="Average Rating"
                        value={`${statistics?.average_rating ?? 0}`}
                        period="This Week"
                        change={{
                            value: 0,
                            text: 'Down from this week',
                            isPositive: false,
                        }}
                    />
                    <StatCard
                        title="All Bookings"
                        value={`${statistics?.total_portfolios ?? 0}`}
                        period="This Week"
                        change={{
                            value: 0,
                            text: 'Down from this week',
                            isPositive: false,
                        }}
                    />
                </div>
                <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <BookingTrendsChart data={bookingTrends} />
                    <AppointmentTrendChart data={appointmentTrends} />
                </div>
                <div className="rounded-lg border border-sf-stroke bg-sf-white p-4 shadow-sm md:p-6">
                    <DashboardAppointments appointments={appointments} />
                </div>
                {/* rounded-lg border border-sf-stroke bg-sf-white p-4 shadow-sm md:p-6 */}
            </section>
        </StylistAuthLayout>
    );
}
