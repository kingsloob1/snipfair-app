import Modal from '@/Components/Modal';
import GoogleMap from '@/Components/contact/_partial/GoogleMap';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { getInitials } from '@/lib/helper';
import { Calendar, MapPin, User } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface CustomerProfileCardProps {
    name: string;
    location: string;
    distance: string;
    totalSpending: number;
    appointmentCount: number;
    canceledPercentage: number;
    rescheduledPercentage: number;
    joinedDate: string;
    profileImage: string;
    location_service?: {
        latitude?: number;
        longitude?: number;
    };
}

const CustomerProfileCard: React.FC<CustomerProfileCardProps> = ({
    name,
    location,
    distance,
    totalSpending,
    appointmentCount,
    canceledPercentage,
    rescheduledPercentage,
    joinedDate,
    profileImage,
    location_service,
}) => {
    const [showMap, setShowMap] = useState(false);

    const onFollowLocation = () => {
        if (
            !location_service ||
            !location_service.latitude ||
            !location_service.longitude ||
            !location
        ) {
            toast.error('Location not available');
            return;
        }
        setShowMap(true);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="w-full overflow-hidden rounded-2xl shadow-md shadow-sf-gray/20">
            {/* Header with gradient background */}
            <div className="relative h-40 bg-gradient-to-r from-sf-gradient-purple to-sf-gradient-pink bg-cover bg-no-repeat">
                {/* Profile image */}
                <div className="absolute -bottom-8 left-6">
                    <div className="relative">
                        <Avatar className="h-20 w-20 rounded-full border-2 border-gray-100">
                            <AvatarImage
                                className="h-full w-full object-cover"
                                src={profileImage}
                                alt={name || 'Customer'}
                            />
                            <AvatarFallback className="font-inter text-2xl">
                                {getInitials(name)}
                            </AvatarFallback>
                        </Avatar>
                        {/* Customer indicator */}
                        <div className="absolute bottom-1 right-1 flex h-3 w-3 items-center justify-center rounded-full border-2 border-white bg-blue-500" />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-3.5 pb-6 pt-12 md:px-6">
                {/* Name */}
                <div className="mb-4 flex justify-between font-inter">
                    <div>
                        <div className="mb-1 flex items-center gap-2">
                            <h2 className="text-2xl font-semibold text-gray-900 md:text-3xl">
                                {name}
                            </h2>
                        </div>
                        <p className="font-medium text-blue-600">
                            <User className="mr-1 inline h-4 w-4" />
                            Customer
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        {/* Location button */}
                        <button
                            onClick={onFollowLocation}
                            className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 transition-colors hover:bg-gray-200"
                        >
                            <span className="text-xs">Location</span>
                            <MapPin className="h-3 w-3" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col items-start justify-between gap-4 font-inter xl:flex-row">
                    <div className="flex items-center gap-5 md:gap-8">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                            <MapPin className="h-4 w-4" />
                            <span>
                                {location} • {distance}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span>Joined {formatDate(joinedDate)}</span>
                        </div>
                    </div>
                    <div className="grid w-full grid-cols-2 gap-4 text-center md:grid-cols-4">
                        <div className="flex flex-col items-center justify-center">
                            <div className="mb-1 text-lg font-bold text-green-600 md:text-2xl">
                                {formatCurrency(totalSpending)}
                            </div>
                            <div className="text-xs leading-tight text-gray-500">
                                Total Spent
                            </div>
                        </div>
                        <div>
                            <div className="mb-1 text-lg font-bold text-blue-600 md:text-2xl">
                                {appointmentCount}
                            </div>
                            <div className="text-xs leading-tight text-gray-500">
                                Appointments
                            </div>
                        </div>
                        <div>
                            <div className="mb-1 text-lg font-bold text-red-600 md:text-2xl">
                                {canceledPercentage.toFixed(1)}%
                            </div>
                            <div className="text-xs leading-tight text-gray-500">
                                Cancel Rate
                            </div>
                        </div>
                        <div>
                            <div className="mb-1 text-lg font-bold text-orange-600 md:text-2xl">
                                {rescheduledPercentage.toFixed(1)}%
                            </div>
                            <div className="text-xs leading-tight text-gray-500">
                                Reschedule Rate
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Modal
                show={showMap}
                onClose={() => setShowMap(false)}
                closeable={true}
                className="h-96"
            >
                <GoogleMap
                    lat={location_service?.latitude ?? 0}
                    lng={location_service?.longitude ?? 0}
                    address_one={location || ''}
                    address_two={''}
                    use_location={true}
                />
                <p className="absolute bottom-0 w-full bg-sf-white/90 p-0.5 text-center text-sm">
                    {location}
                </p>
            </Modal>
        </div>
    );
};

export default CustomerProfileCard;
