import CustomButton from '@/Components/common/CustomButton';
import { StylistNavigationSteps } from '@/Components/magic/StylistNavigationSteps';
import { Dialog, DialogContent } from '@/Components/ui/dialog';
import { StylistAuthLayout } from '@/Layouts/StylistAuthLayout';
import DeleteUserForm from '@/Pages/Profile/Partials/DeleteUserForm';
import { router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import CertificateForm from './_Partials/CertificateForm';
import CertificatesAwards from './_Partials/CertificatesAwards';
import ProfileCard from './_Partials/ProfileCard';
import ProfileCompleteness from './_Partials/ProfileCompleteness';
import ProfileLink from './_Partials/ProfileLink';
import QuickActions from './_Partials/QuickActions';
import ServicesPricing from './_Partials/ServicesPricing';

interface Service {
    id: string;
    title: string;
    price: number;
    duration: string;
}

interface CertificationData {
    id: number;
    certificate_file: string | null;
    title: string;
    issuer: string;
    status: string;
    skill?: string;
    about?: string;
}

export default function Index({
    user,
    portfolios,
    certifications,
    statistics,
    profile_completeness,
    profile_link,
}: {
    portfolios: Service[];
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
    certifications: CertificationData[];
    statistics: {
        total_works: number;
        total_likes: number;
        average_rating: number;
        total_reviews: number;
        total_appointments: number;
        total_earnings: number;
        schedule_summary: string;
    };
    user: {
        name: string;
        first_name: string;
        last_name: string;
        email: string;
        avatar: string;
        rating: number;
        reviews_count: number;
        visits_count: number;
        years_of_experience: string;
        schedule: string;
        country: string;
        phone: string;
        bio: string;
        stylist_profile?: {
            business_name: string;
            years_of_experience: string;
            banner?: string;
        };
    };
    profile_link: string;
}) {
    console.log('Profile Link:', profile_link);
    const [isOpen, setIsOpen] = useState(false);
    const routes = [
        {
            name: 'Profile Management',
            path: window.route('stylist.profile'),
            active: false,
        },
    ];

    const profile_details = {
        name: user.name,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        title: user.stylist_profile?.business_name || 'Stylist',
        avatar: `/storage/${user.avatar}`,
        banner: `/storage/${user.stylist_profile?.banner}`,
        rating: statistics.average_rating,
        reviews_count: statistics.total_reviews,
        experience: `${user.stylist_profile?.years_of_experience || 0} years experience`,
        years_of_experience: user.stylist_profile?.years_of_experience || '0',
        schedule: statistics.schedule_summary,
        location: user.country || 'N/A',
        phone: user.phone || 'N/A',
        visits_count: 0,
        bio: user.bio || '',
    };

    return (
        <StylistAuthLayout header="Stylist Earnings">
            <StylistNavigationSteps
                routes={routes}
                sub="Ensure your profile details are accurate and updated"
            >
                <CustomButton
                    onClick={() =>
                        router.visit(window.route('stylist.profile.services'))
                    }
                    fullWidth={false}
                >
                    <div className="flex gap-1">
                        <Plus size={14} />
                        Add Services
                    </div>
                </CustomButton>
            </StylistNavigationSteps>
            <section className="mx-auto max-w-7xl px-5">
                <ProfileCompleteness
                    profile_completeness={profile_completeness}
                    isMinimal={true}
                />
                <div className="grid gap-5 py-5 md:grid-cols-3 md:gap-4 lg:gap-5 xl:gap-6">
                    <div className="col-span-1 md:col-span-2">
                        <div className="sticky top-20">
                            <ProfileCard profile_details={profile_details} />
                            <ProfileLink profile_link={profile_link} />
                        </div>
                    </div>
                    <div>
                        <div className="sticky top-20 space-y-5">
                            <QuickActions />
                            <ProfileCompleteness
                                profile_completeness={profile_completeness}
                                showDetails={true}
                            />
                        </div>
                    </div>
                </div>
                <ServicesPricing
                    services={portfolios}
                    addNewService={() =>
                        router.visit(window.route('stylist.profile.services'))
                    }
                />
                <CertificatesAwards
                    certifications={certifications}
                    addNewCertificate={() => setIsOpen(true)}
                />
                <div className="mb-6 rounded-xl border border-sf-stroke bg-sf-white p-4 shadow-sm md:p-6">
                    <h2 className="mb-5 text-xl font-bold text-sf-black md:text-2xl">
                        About Me
                    </h2>
                    <p className="text-sf-primary-paragraph">
                        {profile_details.bio}
                    </p>
                </div>
                <div className="mb-6 bg-white p-4 shadow dark:bg-gray-800 sm:rounded-lg sm:p-8">
                    <DeleteUserForm className="max-w-xl" />
                </div>
            </section>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="no-scrollbar max-w-96 overflow-y-auto sm:max-w-[425px]">
                    <CertificateForm />
                </DialogContent>
            </Dialog>
        </StylistAuthLayout>
    );
}
