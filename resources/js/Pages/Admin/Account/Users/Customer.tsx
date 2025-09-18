import CustomerProfileCard from '@/Components/magic/customer_profile/_partial/CustomerProfileCard';
import CustomerAbout from '@/Components/magic/customer_profile/CustomerAbout';
import CustomerHistory from '@/Components/magic/customer_profile/CustomerHistory';
import CustomerStats from '@/Components/magic/customer_profile/CustomerStats';
import Contact from '@/Components/magic/customer_stylist/Contact';
import { StylistNavigationSteps } from '@/Components/magic/StylistNavigationSteps';
import { AdminAccountLayout } from '@/Layouts/AdminAccountLayout';
import { Head } from '@inertiajs/react';

export default function Customer({
    customer,
    appointments,
    transactions,
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
    transactions?: {
        id: number;
        type: string;
        status: string;
        amount: number;
        created_at: string;
    }[];
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
        <AdminAccountLayout header="Admin Dashboard">
            <StylistNavigationSteps
                routes={routes}
                sub="View Stylist Profile"
            />
            <Head title="Stylist Detail" />
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
                        {/* Transactions Card */}
                        <div className="rounded-lg border border-gray-200 p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                Transactions
                            </h3>
                            {transactions && transactions.length > 0 ? (
                                <div className="tiny-scrollbar relative max-h-80 space-y-4 overflow-y-auto">
                                    {transactions.map((transaction) => (
                                        <div
                                            key={transaction.id}
                                            className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                                        >
                                            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        <span className="font-medium">
                                                            Type:
                                                        </span>{' '}
                                                        <span className="capitalize">
                                                            {transaction.type}
                                                        </span>
                                                    </p>
                                                    <p className="text-sm text-gray-900">
                                                        <span className="font-medium">
                                                            Amount:
                                                        </span>{' '}
                                                        R{transaction.amount}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span
                                                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                                                            transaction.status ===
                                                            'completed'
                                                                ? 'bg-green-100 text-green-800'
                                                                : transaction.status ===
                                                                    'pending'
                                                                  ? 'bg-yellow-100 text-yellow-800'
                                                                  : transaction.status ===
                                                                      'failed'
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                    >
                                                        {transaction.status}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">
                                                        {new Date(
                                                            transaction.created_at,
                                                        ).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">
                                    No transactions found
                                </p>
                            )}
                        </div>
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
        </AdminAccountLayout>
    );
}
