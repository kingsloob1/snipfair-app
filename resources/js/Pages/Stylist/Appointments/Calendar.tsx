import { StylistNavigationSteps } from '@/Components/magic/StylistNavigationSteps';
import { StylistAuthLayout } from '@/Layouts/StylistAuthLayout';
import { router } from '@inertiajs/react';
import ScheduleCalendar from './_partials/ScheduleCalendar';

interface CalendarEvent {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    color: 'purple' | 'orange';
    date: string; // Added date field for better event management
    recipient: string;
}

interface DayEvents {
    [key: string]: CalendarEvent[];
}

export default function Availability({ events }: { events: DayEvents }) {
    const routes = [
        {
            name: 'Appointments',
            path: route('stylist.appointments'),
            active: true,
        },
        {
            name: 'Calendar View',
            path: '',
            active: false,
        },
    ];

    return (
        <StylistAuthLayout header="Stylist Calendar">
            <StylistNavigationSteps
                routes={routes}
                sub="View your appointments and availability"
                cta="Adjust Availability"
                ctaAction={() =>
                    router.visit(route('stylist.appointments.availability'))
                }
            />
            <section className="mx-auto max-w-7xl px-5">
                <div className="rounded-lg border border-sf-stroke bg-sf-white p-4 shadow-sm md:p-6">
                    <ScheduleCalendar events={events} />
                </div>
            </section>
        </StylistAuthLayout>
    );
}
