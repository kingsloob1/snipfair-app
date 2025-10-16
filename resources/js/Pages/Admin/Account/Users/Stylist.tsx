// import ProfileCard from '@/Components/magic/customer_stylist/Stylist';
import ProfileCard from '@/Components/magic/customer_stylist/_partial/ProfileCard';
import About from '@/Components/magic/customer_stylist/About';
import Booking from '@/Components/magic/customer_stylist/Booking';
import Portfolio from '@/Components/magic/customer_stylist/Portfolio';
import Reviews from '@/Components/magic/customer_stylist/Reviews';
import Schedule from '@/Components/magic/customer_stylist/Schedule';
import Service from '@/Components/magic/customer_stylist/Service';
import { StylistNavigationSteps } from '@/Components/magic/StylistNavigationSteps';
import { AdminAccountLayout } from '@/Layouts/AdminAccountLayout';
import { openFullscreenOverlay } from '@/lib/helper';
import { WorkingHour } from '@/types';
import { MergedStylistPortfolioItem } from '@/types/custom_types';
import { Head } from '@inertiajs/react';
import IdentificationCard from './_Includes/IdentificationCard';
import SocialLinksCard from './_Includes/Socials';

export default function Stylist({
    stylist,
    portfolios,
    reviews,
    workingHours,
    location_service,
    stylistAppointments,
    transactions,
}: {
    stylist: MergedStylistPortfolioItem & {
        services_completed?: string;
        work_experience?: string;
        socials: {
            id?: string;
            social_app: string;
            url: string;
        }[];
        identification_image?: string;
        identification_id?: string;
        identification_proof?: string;
        works: string[];
    };
    portfolios: Array<{
        id: number;
        title: string;
        category: string;
        price: number;
        duration: string;
        description: string;
        media_urls: string[];
    }>;
    reviews: Array<{
        name: string;
        title: string;
        message: string;
        rating: number;
        ratingDate: string;
    }>;
    workingHours: WorkingHour[];
    location_service?: {
        latitude?: number;
        longitude?: number;
    };
    stylistAppointments?: {
        id: number;
        customer: {
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
    }[];
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
            name: 'Users',
            path: window.route('admin.users'),
            active: false,
        },
    ];
    const workSamples = portfolios
        .flatMap((portfolio) => portfolio.media_urls || [])
        .slice(0, 6);

    return (
        <AdminAccountLayout header="Admin Dashboard">
            <StylistNavigationSteps
                routes={routes}
                sub="View Stylist Profile"
            />
            <Head title="Stylist Detail" />
            <section className="mx-auto max-w-7xl px-5 py-2 md:py-4 xl:py-6">
                {/* <h2 className="font-inter text-xl font-bold text-sf-gray-zinc sm:text-2xl md:text-3xl">
                    Stylist Profile
                </h2> */}
                <ProfileCard
                    banner={stylist.banner_image || ''}
                    name={stylist.name || 'Unknown'}
                    profession={stylist.title || 'Stylist'}
                    rating={stylist.average_rating || 0}
                    reviewCount={stylist.total_reviews || 0}
                    location={stylist.location || 'Location not set'}
                    distance={stylist.distance || 'N/A'}
                    servicesCompleted={stylist.services_completed || '0'}
                    workExperience={stylist.work_experience || '0 years'}
                    maxResponseTime={stylist.response_time || '30mins'}
                    profileImage={stylist.profile_image || ''}
                    isFavorite={undefined}
                    location_service={location_service}
                />
                <div className="relative grid grid-cols-1 gap-8 py-6 md:py-8 lg:grid-cols-3 xl:gap-12">
                    <div className="col-span-1 space-y-6 md:space-y-11 lg:col-span-2">
                        <About
                            name={stylist.name || 'Unknown'}
                            aboutText={
                                stylist.description ||
                                'No description available'
                            }
                            specialties={
                                stylist.categories?.map(
                                    (cat) => cat.category,
                                ) || []
                            }
                            education={stylist.certificates || []}
                        />
                        <Service services={portfolios} />
                        <Portfolio
                            name={stylist.name || 'Unknown'}
                            workSamples={workSamples}
                        />
                        <div className="w-full overflow-hidden rounded-2xl border border-sf-stroke p-3.5 font-sans shadow-sm shadow-sf-gray/20 md:p-6">
                            {stylist.works && stylist.works.length > 0 ? (
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                    {stylist.works.map((file, index) => (
                                        <div
                                            key={index}
                                            className="group relative"
                                        >
                                            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                                                <img
                                                    src={`/storage/${file}`}
                                                    onClick={() =>
                                                        openFullscreenOverlay(
                                                            `/storage/${file}`,
                                                        )
                                                    }
                                                    alt={
                                                        'Uploaded work ' + index
                                                    }
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No past works uploaded</p>
                            )}
                        </div>

                        {/* Appointments Card */}
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                Appointments
                            </h3>
                            {stylistAppointments &&
                            stylistAppointments.length > 0 ? (
                                <div className="space-y-4">
                                    {stylistAppointments.map((appointment) => (
                                        <div
                                            key={appointment.id}
                                            className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                                        >
                                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {
                                                            appointment.customer
                                                                .name
                                                        }
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {
                                                            appointment.customer
                                                                .email
                                                        }
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-900">
                                                        <span className="font-medium">
                                                            Category:
                                                        </span>{' '}
                                                        {
                                                            appointment
                                                                .portfolio
                                                                .category.name
                                                        }
                                                    </p>
                                                    <p className="text-sm text-gray-900">
                                                        <span className="font-medium">
                                                            Amount:
                                                        </span>{' '}
                                                        R{appointment.amount}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span
                                                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                                                            appointment.status ===
                                                            'completed'
                                                                ? 'bg-green-100 text-green-800'
                                                                : appointment.status ===
                                                                    'pending'
                                                                  ? 'bg-yellow-100 text-yellow-800'
                                                                  : appointment.status ===
                                                                      'cancelled'
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                    >
                                                        {appointment.status}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">
                                                        {new Date(
                                                            appointment.created_at,
                                                        ).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">
                                    No appointments found
                                </p>
                            )}
                        </div>

                        {/* Transactions Card */}
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                Transactions
                            </h3>
                            {transactions && transactions.length > 0 ? (
                                <div className="space-y-4">
                                    {transactions.map((transaction) => (
                                        <div
                                            key={transaction.id}
                                            className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                                        >
                                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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

                        <Reviews reviews={reviews} />
                    </div>
                    <div className="col-span-1">
                        <div className="sticky top-20 space-y-6 md:space-y-11">
                            <Booking
                                userId={stylist.id}
                                priceRange={stylist.price_range || 'N/A'}
                                nextAvailable={stylist.next_available || 'N/A'}
                                responseTime={
                                    stylist.response_time || '30 mins'
                                }
                                isMin={true}
                            />
                            {/* Identity document should be seen here */}
                            <IdentificationCard
                                identification_id={stylist.identification_id}
                                identification_image={
                                    stylist.identification_image
                                }
                                identification_proof={
                                    stylist.identification_proof
                                }
                            />
                            <SocialLinksCard
                                socials={stylist.socials || []}
                                title={`Connect with ${stylist.name || 'Stylist'}`}
                                className="mb-8"
                            />
                            <Schedule workingHours={workingHours} />
                        </div>
                    </div>
                </div>
            </section>
        </AdminAccountLayout>
    );
}
