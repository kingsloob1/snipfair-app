import CustomerProfileCard from '@/Components/magic/customer_profile/_partial/CustomerProfileCard';
import CustomerAbout from '@/Components/magic/customer_profile/CustomerAbout';
import CustomerHistory from '@/Components/magic/customer_profile/CustomerHistory';
import CustomerStats from '@/Components/magic/customer_profile/CustomerStats';
import Contact from '@/Components/magic/customer_stylist/Contact';
import { StylistNavigationSteps } from '@/Components/magic/StylistNavigationSteps';
import { StylistAuthLayout } from '@/Layouts/StylistAuthLayout';

export default function Customer({
    customer,
    appointments,
    location_service, //transactions
}: {
    customer: {
        id: number;
        name: string;
        email: string;
        profile_image: string;
        bio?: string;
        location: string;
        distance?: string;
        joined_date: string;
        total_spending: number;
        appointment_count: number;
        canceled_appointments: number;
        rescheduled_appointments: number;
        preferred_services?: string[];
    };
    appointments: Array<{
        id: number;
        stylist: {
            id: number;
            name: string;
            email: string;
            avatar?: string;
        };
        portfolio: {
            category: {
                id: number;
                name: string;
            };
        };
        amount: number;
        status: string;
        created_at: string;
    }>;
    location_service?: {
        latitude?: number;
        longitude?: number;
    };
}) {
    const routes = [
        {
            name: 'Dashboard',
            path: route('stylist.dashboard'),
            active: true,
        },
        {
            name: 'Customer',
            path: '',
            active: false,
        },
    ];

    const canceledPercentage =
        customer.appointment_count > 0
            ? (customer.canceled_appointments / customer.appointment_count) *
              100
            : 0;

    const rescheduledPercentage =
        customer.appointment_count > 0
            ? (customer.rescheduled_appointments / customer.appointment_count) *
              100
            : 0;

    return (
        <StylistAuthLayout header="Stylist Portfolio">
            <StylistNavigationSteps
                routes={routes}
                sub="View customer profile"
            />
            <section className="mx-auto max-w-7xl px-5">
                <CustomerProfileCard
                    name={customer.name || 'Unknown Customer'}
                    location={customer.location || 'Location not set'}
                    distance={customer.distance || 'N/A'}
                    totalSpending={customer.total_spending}
                    appointmentCount={customer.appointment_count}
                    canceledPercentage={canceledPercentage}
                    rescheduledPercentage={rescheduledPercentage}
                    joinedDate={customer.joined_date}
                    profileImage={customer.profile_image || ''}
                    location_service={location_service}
                />
                <div className="relative grid grid-cols-1 gap-8 py-6 md:py-8 lg:grid-cols-3 xl:gap-12">
                    <div className="col-span-1 space-y-6 md:space-y-11 lg:col-span-2">
                        <CustomerAbout
                            name={customer.name || 'Unknown Customer'}
                            bio={customer.bio || 'No bio available'}
                            preferredServices={
                                customer.preferred_services || []
                            }
                        />
                        <CustomerHistory appointments={appointments} />
                    </div>
                    <div className="col-span-1">
                        <div className="sticky top-20 space-y-6 md:space-y-11">
                            <CustomerStats
                                totalSpending={customer.total_spending}
                                appointmentCount={customer.appointment_count}
                                canceledPercentage={canceledPercentage}
                                rescheduledPercentage={rescheduledPercentage}
                            />
                            <Contact />
                        </div>
                    </div>
                </div>
            </section>
        </StylistAuthLayout>
    );
}
