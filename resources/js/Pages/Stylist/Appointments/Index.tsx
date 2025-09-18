import CustomButton from '@/Components/common/CustomButton';
import { StylistNavigationSteps } from '@/Components/magic/StylistNavigationSteps';
import DashboardAppointments from '@/Components/stylist/DashboardAppointments';
import { StylistAuthLayout } from '@/Layouts/StylistAuthLayout';
import { AppointmentCardProps } from '@/types';
import { router } from '@inertiajs/react';
import { Calendar, Settings, TriangleAlert, Wallet } from 'lucide-react';

interface IndexProps {
    appointments?: AppointmentCardProps[];
    statistics?: {
        today_earnings: number;
        today_appointments: number;
        total_requests: number;
    };
}

export default function Appointments({ appointments, statistics }: IndexProps) {
    const routes = [
        {
            name: 'Dashboard',
            path: route('stylist.dashboard'),
            active: true,
        },
        {
            name: 'Appointments',
            path: route('stylist.appointments'),
            active: false,
        },
    ];

    return (
        <StylistAuthLayout header="Stylist Appointments">
            <StylistNavigationSteps
                routes={routes}
                sub="Manage your upcoming and past appointments"
            >
                <div className="flex gap-2">
                    <CustomButton
                        onClick={() =>
                            router.visit(
                                route('stylist.appointments.availability'),
                            )
                        }
                        fullWidth={false}
                        variant="secondary"
                    >
                        <div className="flex items-center gap-1">
                            <Settings size={14} />
                            Set Availability
                        </div>
                    </CustomButton>
                    <CustomButton
                        onClick={() =>
                            router.visit(route('stylist.appointments.calendar'))
                        }
                        fullWidth={false}
                    >
                        <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            View Calender
                        </div>
                    </CustomButton>
                </div>
            </StylistNavigationSteps>
            <section className="mx-auto max-w-7xl px-5">
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="flex flex-col items-center rounded-xl border border-sf-stroke bg-sf-white p-4 md:p-6">
                        <Calendar className="text-sf-gradient-pink" size={20} />
                        <h3 className="font-inter text-2xl font-bold text-sf-black md:text-3xl">
                            {`${statistics?.today_appointments ?? 0}`}
                        </h3>
                        <p className="font-inter text-sm text-sf-primary-paragraph">
                            Today's Appointment
                        </p>
                    </div>
                    <div className="flex flex-col items-center rounded-xl border border-sf-stroke bg-sf-white p-4 md:p-6">
                        <Wallet className="text-sf-primary" size={20} />
                        <h3 className="font-inter text-2xl font-bold text-sf-black md:text-3xl">
                            {`R${statistics?.today_earnings ?? 0}`}
                        </h3>
                        <p className="font-inter text-sm text-sf-primary-paragraph">
                            Today's Earnings
                        </p>
                    </div>
                    <div className="flex flex-col items-center rounded-xl border border-sf-stroke bg-sf-white p-4 md:p-6">
                        <TriangleAlert
                            className="text-sf-orange-53"
                            size={20}
                        />
                        <h3 className="font-inter text-2xl font-bold text-sf-black md:text-3xl">
                            {`${statistics?.total_requests ?? 0}`}
                        </h3>
                        <p className="font-inter text-sm text-sf-primary-paragraph">
                            Pending Requests
                        </p>
                    </div>
                </div>
                <div className="rounded-lg border border-sf-stroke bg-sf-white p-4 shadow-sm md:p-6">
                    <DashboardAppointments appointments={appointments} />
                </div>
            </section>
        </StylistAuthLayout>
    );
}
