import CustomButton from '@/Components/common/CustomButton';
import { cn } from '@/lib/utils';
import { Link, router } from '@inertiajs/react';
import { Check, ExternalLink, ListTodo } from 'lucide-react';
import React from 'react';

interface ProfileCompletenessProps {
    profile_completeness?: {
        portfolio: boolean;
        payment_method: boolean;
        status_approved: boolean;
        location_service: boolean;
        address: boolean;
        social_links: boolean;
        works: boolean;
        user_banner: boolean;
        subscription_status: boolean;
        user_avatar: boolean;
        user_bio: boolean;
    };
    showDetails?: boolean;
    isMinimal?: boolean;
}

const ProfileCompleteness: React.FC<ProfileCompletenessProps> = ({
    profile_completeness,
    showDetails = false,
    isMinimal = false,
}) => {
    // Calculate completion percentage
    const completedItems = [
        profile_completeness?.portfolio,
        profile_completeness?.payment_method,
        profile_completeness?.status_approved,
        profile_completeness?.location_service,
        profile_completeness?.address,
        profile_completeness?.social_links,
        profile_completeness?.works,
        profile_completeness?.user_banner,
        // profile_completeness?.subscription_status,
        profile_completeness?.user_avatar,
        profile_completeness?.user_bio,
    ].filter(Boolean).length;

    const totalItems = 10;
    const completionPercentage = Math.round(
        (completedItems / totalItems) * 100,
    );

    // Define profile items with their completion status and labels
    const profileItems = [
        {
            completed: profile_completeness?.user_bio,
            label: 'Complete bio',
            key: 'bio',
            link: '/stylist/profile?tab=edit',
        },
        {
            completed: profile_completeness?.address,
            label: 'Specify current address',
            key: 'country',
            link: '/stylist/profile?tab=edit',
        },
        {
            completed: profile_completeness?.location_service,
            label: 'Set location service',
            key: 'location_service',
            link: '/stylist/availability#location',
        },
        {
            completed: profile_completeness?.user_avatar,
            label: 'Upload profile photo',
            key: 'avatar',
            link: '/stylist/profile',
        },
        {
            completed: profile_completeness?.user_banner,
            label: 'Upload profile banner',
            key: 'banner',
            link: '/stylist/profile?tab=banner',
        },
        {
            completed: profile_completeness?.social_links,
            label: 'Add social media links',
            key: 'social',
            link: '/stylist/verification',
        },
        {
            completed: profile_completeness?.works,
            label: 'Upload past works',
            key: 'works',
            link: '/stylist/verification',
        },
        {
            completed: profile_completeness?.portfolio,
            label: 'Add portfolio items',
            key: 'portfolio',
            link: '/stylist/portfolio',
        },
        {
            completed: profile_completeness?.payment_method,
            label: 'Active Payout method',
            key: 'payment',
            link: '/stylist/earnings/methods',
        },
        {
            completed: profile_completeness?.status_approved,
            label: 'Business Profile approval',
            key: 'stylist_profile',
            link: null,
        },
        // {
        //     completed: profile_completeness?.subscription_status,
        //     label: 'Active Subscription',
        //     key: 'subscription',
        // },
    ];

    if (isMinimal) {
        return (
            <div className="flex items-center justify-between rounded-2xl border bg-sf-gradient-primary p-6 shadow-sm">
                <p className="text-sm text-sf-white/90">
                    Your profile is {completionPercentage}% ready. Complete it
                    to start receiving bookings.
                </p>
                <CustomButton
                    variant="secondary"
                    className="px-2 py-1 md:px-2 md:py-1 [&_span]:!text-[12px] md:[&_span]:!text-[14px]"
                    fullWidth={false}
                    onClick={() => router.visit(route('stylist.verification'))}
                >
                    Complete Verification
                </CustomButton>
            </div>
        );
    }

    return (
        <div
            className={cn(
                'rounded-2xl border p-6 shadow-sm',
                showDetails
                    ? 'border-gray-100 bg-white'
                    : 'border-gray-100 bg-sf-gradient-primary',
                completionPercentage > 98 && !showDetails && 'hidden',
            )}
        >
            <div className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                    <span
                        className={cn(
                            'text-lg font-medium',
                            showDetails
                                ? 'text-gray-700'
                                : 'text-sf-white-neutral',
                        )}
                    >
                        Profile Completeness
                    </span>
                    <Link
                        href={route('stylist.verification')}
                        className={cn(
                            'text-lg font-bold text-sf-white md:text-xl',
                            showDetails && 'hidden',
                        )}
                    >
                        <ExternalLink />
                    </Link>
                </div>

                {/* Progress bar */}
                <div className="h-3.5 w-full rounded-full bg-gray-200 md:h-5">
                    <div
                        className={cn(
                            'relative h-3.5 rounded-full transition-all duration-300 ease-in-out md:h-5',
                            showDetails
                                ? 'bg-sf-gradient-primary'
                                : 'bg-sf-primary',
                        )}
                        style={{ width: `${completionPercentage}%` }}
                    >
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-sf-white">
                            {completionPercentage}%
                        </div>
                    </div>
                </div>
            </div>

            {!showDetails && completionPercentage < 95 && (
                <p className="text-sm text-sf-white/70">
                    Your profile is {completionPercentage}% ready. Complete it
                    to start receiving bookings.
                </p>
            )}

            {/* Details list */}
            {showDetails && (
                <div className="space-y-3">
                    {profileItems.map((item) =>
                        item.link ? (
                            <Link
                                key={item.key}
                                href={item.link}
                                className="flex items-center gap-3 rounded-md px-3 py-1 hover:bg-sf-gray/10"
                            >
                                {item.completed ? (
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                                        <Check className="h-4 w-4 text-green-600" />
                                    </div>
                                ) : (
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
                                        <ListTodo className="h-4 w-4 text-gray-400" />
                                    </div>
                                )}
                                <span
                                    className={`text-sm font-medium ${
                                        item.completed
                                            ? 'text-gray-900'
                                            : 'text-gray-500'
                                    }`}
                                >
                                    {item.label}
                                </span>
                                <span
                                    className={cn(
                                        'ms-2 text-sm font-bold',
                                        item.completed
                                            ? 'text-gray-900'
                                            : 'text-gray-500',
                                    )}
                                >
                                    <ExternalLink
                                        className="inline"
                                        size={14}
                                    />
                                </span>
                            </Link>
                        ) : (
                            <div
                                key={item.key}
                                className="flex items-center gap-3 px-3 py-1"
                            >
                                {item.completed ? (
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                                        <Check className="h-4 w-4 text-green-600" />
                                    </div>
                                ) : (
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
                                        <ListTodo className="h-4 w-4 text-gray-400" />
                                    </div>
                                )}
                                <div>
                                    <span
                                        className={`text-sm font-medium ${
                                            item.completed
                                                ? 'text-gray-900'
                                                : 'text-gray-500'
                                        }`}
                                    >
                                        {item.label}
                                    </span>
                                </div>
                            </div>
                        ),
                    )}
                </div>
            )}
        </div>
    );
};

export default ProfileCompleteness;
