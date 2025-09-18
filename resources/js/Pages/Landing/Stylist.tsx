// import ProfileCard from '@/Components/magic/customer_stylist/Stylist';
import AnimatedSweep from '@/Components/common/AnimatedSweep';
import Footer from '@/Components/layout/Footer';
import Navbar from '@/Components/layout/Navbar';
import ProfileCard from '@/Components/magic/customer_stylist/_partial/ProfileCard';
import About from '@/Components/magic/customer_stylist/About';
import Booking from '@/Components/magic/customer_stylist/Booking';
import Portfolio from '@/Components/magic/customer_stylist/Portfolio';
import Reviews from '@/Components/magic/customer_stylist/Reviews';
import Schedule from '@/Components/magic/customer_stylist/Schedule';
import Service from '@/Components/magic/customer_stylist/Service';
import { PageProps, WorkingHour } from '@/types';
import { MergedStylistPortfolioItem } from '@/types/custom_types';
import { Head } from '@inertiajs/react';

type StylistProps = {
    stylist: MergedStylistPortfolioItem & {
        services_completed?: string;
        work_experience?: string;
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
};

export default function Stylist({
    auth,
    stylist,
    portfolios,
    reviews,
    workingHours,
    location_service,
}: PageProps<StylistProps>) {
    const workSamples = portfolios
        .flatMap((portfolio) => portfolio.media_urls || [])
        .slice(0, 6);

    return (
        <>
            <Head title="Stylist" />
            <AnimatedSweep />
            <Navbar auth={auth} />
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
                    isFavorite={stylist.is_liked || false}
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
                                isPublic={true}
                            />
                            <Schedule workingHours={workingHours} />
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
}
