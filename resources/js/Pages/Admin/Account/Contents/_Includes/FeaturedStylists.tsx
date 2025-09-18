import CustomButton from '@/Components/common/CustomButton';
import CommonAvatar from '@/Components/common/forms/CommonAvatar';
import GradientTextSpan from '@/Components/common/GradientTextSpan';
import { router } from '@inertiajs/react';
import { Calendar, DollarSign, Image, MessageSquare, Star } from 'lucide-react';
import React, { useState } from 'react';

interface Stylist {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    total_appointments: number;
    total_earnings: number;
    average_rating: number;
    portfolios_count: number;
    total_reviews: number;
    is_featured: boolean;
}

interface FeaturedStylistsProps {
    stylists: Stylist[];
}

const FeaturedStylists: React.FC<FeaturedStylistsProps> = ({ stylists }) => {
    const [isToggling, setIsToggling] = useState<number | null>(null);

    const handleToggleFeatured = (stylistId: number) => {
        setIsToggling(stylistId);
        router.patch(
            route('admin.contents.stylists.toggle-featured', stylistId),
            {},
            {
                onFinish: () => setIsToggling(null),
            },
        );
    };

    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    className={`h-4 w-4 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />,
            );
        }
        return stars;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                    Featured Stylists Management
                </h2>
                <div className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700">
                    Total Stylists: {stylists.length}
                </div>
            </div>

            {/* Stylists Grid */}
            <div className="grid gap-6">
                {stylists.length === 0 ? (
                    <div className="col-span-full rounded-lg border border-gray-200 bg-white p-8 text-center">
                        <p className="text-gray-500">No stylists found.</p>
                    </div>
                ) : (
                    stylists.map((stylist) => (
                        <div
                            key={stylist.id}
                            className={`relative rounded-lg border bg-white p-6 shadow-sm transition-all ${
                                stylist.is_featured
                                    ? 'border-purple-200 bg-purple-50'
                                    : 'border-gray-200'
                            }`}
                        >
                            {/* Avatar and Name */}
                            <div className="mb-4 flex items-center gap-3">
                                <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-200">
                                    <CommonAvatar
                                        className="h-12 w-12"
                                        image={stylist.avatar}
                                        name={stylist.name}
                                        fallBackClass="bg-sf-gradient-secondary"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="flex gap-2.5 font-semibold text-gray-900">
                                        {stylist.name}
                                        {stylist.is_featured && (
                                            <div className="[&>*]:text-xs">
                                                <GradientTextSpan text="Featured" />
                                            </div>
                                        )}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {stylist.email}
                                    </p>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="mb-4 flex flex-wrap gap-5">
                                <div className="flex items-center gap-3 rounded-2xl border border-sf-primary bg-sf-primary-light p-2 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Calendar className="h-4 w-4" />
                                        <span>Appointments</span>
                                    </div>
                                    <span className="font-inter font-medium">
                                        {stylist.total_appointments}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 rounded-2xl border border-sf-primary bg-sf-primary-light p-2 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <DollarSign className="h-4 w-4" />
                                        <span>Earnings</span>
                                    </div>
                                    <span className="font-inter font-medium">
                                        R{stylist.total_earnings.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 rounded-2xl border border-sf-primary bg-sf-primary-light p-2 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Star className="h-4 w-4" />
                                        <span>Rating</span>
                                    </div>
                                    <span className="flex items-center gap-1 font-inter font-medium">
                                        {renderStars(
                                            Math.round(stylist.average_rating),
                                        )}
                                        <span className="ml-1 font-medium">
                                            {stylist.average_rating.toFixed(1)}
                                        </span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 rounded-2xl border border-sf-primary bg-sf-primary-light p-2 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Image className="h-4 w-4" />
                                        <span>Portfolio</span>
                                    </div>
                                    <span className="font-inter font-medium">
                                        {stylist.portfolios_count} items
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 rounded-2xl border border-sf-primary bg-sf-primary-light p-2 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <MessageSquare className="h-4 w-4" />
                                        <span>Reviews</span>
                                    </div>
                                    <span className="font-inter font-medium">
                                        {stylist.total_reviews}
                                    </span>
                                </div>
                            </div>
                            <CustomButton
                                onClick={() => handleToggleFeatured(stylist.id)}
                                disabled={isToggling === stylist.id}
                                className="absolute right-6 top-6 px-2.5 py-1.5"
                                fullWidth={false}
                                variant={
                                    stylist.is_featured
                                        ? 'secondary'
                                        : 'primary'
                                }
                            >
                                {isToggling === stylist.id
                                    ? 'Updating...'
                                    : stylist.is_featured
                                      ? 'Remove'
                                      : 'Add'}
                            </CustomButton>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FeaturedStylists;
