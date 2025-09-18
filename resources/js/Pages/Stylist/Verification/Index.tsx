import { StylistNavigationSteps } from '@/Components/magic/StylistNavigationSteps';
import { StylistAuthLayout } from '@/Layouts/StylistAuthLayout';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import ProfileCompleteness from '../Profile/_Partials/ProfileCompleteness';
import VerificationForm from './_Partials/VerificationForm';

export default function Index({
    user,
    profile_completeness,
    portfolios,
}: {
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
            status:
                | 'unverified'
                | 'approved'
                | 'pending'
                | 'flagged'
                | 'rejected';
            socials: { social_app: string; url: string }[];
            works: string[];
        };
    };
    portfolios: { id: number }[];
}) {
    const routes = [
        {
            name: 'Profile Verification',
            path: route('stylist.verification'),
            active: false,
        },
    ];

    const profile_details = {
        name: user.name,
        business_name: user.stylist_profile?.business_name || 'Stylist',
        socials: user.stylist_profile?.socials || [],
        has_portfolio: portfolios.length > 0,
        avatar: `/storage/${user.avatar}`,
        media: user.stylist_profile?.works || [],
        stylist_status: user.stylist_profile?.status || 'unverified',
    };

    const getStatusIcon = (
        status: 'unverified' | 'approved' | 'pending' | 'flagged' | 'rejected',
    ) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'pending':
                return <Info className="h-4 w-4 text-yellow-500" />;
            case 'flagged':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'rejected':
                return <AlertTriangle className="h-4 w-4 text-orange-500" />;
            default:
                return <Info className="h-4 w-4 text-gray-500" />;
        }
    };
    const getStatusColor = (
        status: 'unverified' | 'approved' | 'pending' | 'flagged' | 'rejected',
    ) => {
        switch (status) {
            case 'approved':
                return 'text-green-600 border-green-600 bg-green-50';
            case 'pending':
                return 'text-yellow-600 border-yellow-600 bg-yellow-50';
            case 'flagged':
                return 'text-yellow-600 border-yellow-600 bg-yellow-50';
            case 'rejected':
                return 'text-red-600 border-red-600 bg-red-50';
            default:
                return 'text-gray-600 border-gray-600 bg-gray-50';
        }
    };

    const getStatusText = (
        status: 'unverified' | 'approved' | 'pending' | 'flagged' | 'rejected',
    ) => {
        if (status) return status.charAt(0).toUpperCase() + status.slice(1);
        else return 'Pending';
    };

    return (
        <StylistAuthLayout header="Stylist Earnings">
            <StylistNavigationSteps
                routes={routes}
                sub="Verify your stylist profile to start earning"
            >
                <span
                    className={`flex items-center gap-1 rounded-xl border px-2.5 py-2 text-sm font-medium ${getStatusColor(user.stylist_profile?.status || 'pending')}`}
                >
                    {getStatusText(
                        user.stylist_profile?.status || 'unverified',
                    )}
                    {getStatusIcon(
                        user.stylist_profile?.status || 'unverified',
                    )}
                </span>
            </StylistNavigationSteps>
            <section className="mx-auto max-w-7xl px-5">
                <div className="grid gap-5 py-5 md:grid-cols-3 md:gap-4 lg:gap-5 xl:gap-6">
                    <div className="md:col-span-2">
                        <div className="sticky top-20">
                            <VerificationForm
                                {...profile_details}
                                profile_completeness={profile_completeness}
                            />
                        </div>
                    </div>
                    <div>
                        <div className="sticky top-20 space-y-5">
                            <ProfileCompleteness
                                profile_completeness={profile_completeness}
                                showDetails={true}
                            />
                        </div>
                    </div>
                </div>
            </section>
        </StylistAuthLayout>
    );
}
