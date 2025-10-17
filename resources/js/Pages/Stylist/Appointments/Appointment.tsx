import { StylistNavigationSteps } from '@/Components/magic/StylistNavigationSteps';
import { StylistAuthLayout } from '@/Layouts/StylistAuthLayout';
import { cn } from '@/lib/utils';
import { MapPinHouse } from 'lucide-react';
import { useState } from 'react';
import AppointmentActions from './_partials/AppointmentActions';
import AppointmentMatch from './_partials/AppointmentMatch';
import ServicesPricing from './_partials/ServicePricing';

type Beautician = {
    name: string;
    avatar: string | undefined;
};

type Customer = {
    id: number;
    name: string;
    avatar: string | undefined;
};

type AppointmentDetails = {
    orderTime: string;
    bookingId: string;
    beautician: Beautician;
    customer: Customer;
    date: string;
    day: string;
    distance: string | null;
    time: string;
    duration: string;
    location: string;
    phone: string;
    total_appointments: number;
    total_cancellations: number;
    total_no_show_rate: number;
};

interface AppointmentProps {
    appointment: {
        id: number;
        portfolio: {
            id: number;
            title: string;
            category: { name: string };
            duration: string;
            price: number;
        };
        stylist: {
            id: number;
            name: string;
            avatar?: string;
            stylist_profile: { business_name: string; is_available?: boolean };
        };
        customer: {
            id: number;
            name: string;
            country?: string;
            use_location: boolean;
            location_service?: { latitude?: number; longitude?: number };
        };
        extra?: string;
    };
    appointment_details: AppointmentDetails;
}

interface AppointmentData {
    id: number;
    status: string;
    appointment_code: string;
    completion_code?: string;
    amount: number;
    proof?: boolean;
    service_notes?: string;
}

export default function Appointment({
    appointment,
    appointment_details,
}: AppointmentProps) {
    const [appointmentObject, setAppointment] =
        useState<AppointmentData | null>(null);
    const routes = [
        {
            name: 'Appointments',
            path: window.route('stylist.appointments'),
            active: true,
        },
        {
            name: 'Appointment',
            path: '',
            active: false,
        },
    ];
    return (
        <StylistAuthLayout header="Stylist Appointment">
            <StylistNavigationSteps
                routes={routes}
                sub={`Appointment details with ${appointment.customer.name}`}
            >
                <div>
                    <h6 className="mb-4 flex gap-1.5 rounded-2xl border border-sf-gray bg-sf-primary-background px-2 py-1 text-xs font-bold text-sf-gray md:gap-2 xl:text-sm">
                        <MapPinHouse size={14} />
                        {appointment_details.distance
                            ? appointment_details.distance
                            : 'Distance not available'}
                    </h6>
                </div>
            </StylistNavigationSteps>
            <section className="mx-auto max-w-7xl px-5">
                <div
                    className={cn(
                        'relative grid grid-cols-1 gap-6 lg:grid-cols-3',
                        !appointmentObject && 'hidden',
                    )}
                >
                    <div className="col-span-1 lg:col-span-2">
                        <div className="sticky top-10">
                            <AppointmentMatch {...appointment_details} />
                            <ServicesPricing
                                portfolio={appointment.portfolio}
                                business_name={
                                    appointment?.stylist?.stylist_profile
                                        ?.business_name
                                }
                            />
                            <div className="mb-6 rounded-xl border border-sf-stroke bg-sf-white p-4 shadow-sm md:p-6">
                                <h2 className="mb-5 text-lg font-bold text-sf-black md:text-xl xl:text-2xl">
                                    Appointment Notes
                                </h2>
                                <p className="text-sm text-sf-primary-paragraph xl:text-base">
                                    {appointment.extra ||
                                        'No additional requests'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="sticky top-10">
                            <AppointmentActions
                                customerId={appointment.customer.id}
                                customerUseLocation={
                                    appointment.customer.use_location
                                }
                                customer={appointment_details?.customer?.name}
                                total_appointments={
                                    appointment_details?.total_appointments
                                }
                                total_no_show_rate={
                                    appointment_details?.total_no_show_rate
                                }
                                total_cancellations={
                                    appointment_details?.total_cancellations
                                }
                                appointmentId={appointment.id}
                                address={appointment.customer.country}
                                location_service={
                                    appointment.customer.location_service
                                }
                                appointment={appointmentObject}
                                setAppointment={setAppointment}
                            />
                        </div>
                    </div>
                </div>
            </section>
        </StylistAuthLayout>
    );
}
