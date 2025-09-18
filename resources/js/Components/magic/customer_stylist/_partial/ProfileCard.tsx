import Modal from '@/Components/Modal';
import GoogleMap from '@/Components/contact/_partial/GoogleMap';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { getInitials } from '@/lib/helper';
import { cn } from '@/lib/utils';
import { BadgeCheck, Heart, MapPin, Star } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface ProfileCardProps {
    banner: string;
    name: string;
    profession: string;
    rating: number;
    reviewCount: number;
    location: string;
    distance: string;
    servicesCompleted: string;
    workExperience: string;
    maxResponseTime: string;
    profileImage: string;
    isFavorite?: boolean;
    location_service?: {
        latitude?: number;
        longitude?: number;
    };
}

const ProfileCard: React.FC<ProfileCardProps> = ({
    banner,
    name,
    profession,
    rating,
    reviewCount,
    location,
    distance,
    servicesCompleted,
    workExperience,
    maxResponseTime,
    profileImage,
    isFavorite,
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
            console.log(location_service, location);
            toast.error('Location not available');
            return;
        }

        setShowMap(true);
    };
    return (
        <div className="w-full overflow-hidden rounded-2xl shadow-md shadow-sf-gray/20">
            {/* Header with gradient background */}
            <div
                className="relative h-40 bg-gradient-to-r from-sf-gradient-purple to-sf-gradient-pink bg-cover bg-no-repeat"
                style={banner ? { backgroundImage: `url(${banner})` } : {}}
            >
                {/* Heart icon */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => null}
                    className={cn(
                        typeof isFavorite === 'undefined'
                            ? 'hidden'
                            : 'absolute bottom-4 right-4 rounded-full bg-sf-white bg-opacity-90 p-2 shadow-md backdrop-blur-sm transition-colors duration-200 hover:bg-sf-white',
                    )}
                >
                    <Heart
                        size={20}
                        className={`${isFavorite ? 'fill-danger-normal text-danger-normal' : 'text-sf-black-neutral'} transition-colors duration-200`}
                    />
                </motion.button>

                {/* Profile image */}
                <div className="absolute -bottom-8 left-6">
                    <div className="relative">
                        <Avatar className="h-20 w-20 rounded-full border-2 border-gray-100">
                            <AvatarImage
                                className="h-full w-full object-cover"
                                src={profileImage}
                                alt={name || 'Stylist'}
                            />
                            <AvatarFallback className="font-inter text-2xl">
                                {getInitials(name)}
                            </AvatarFallback>
                        </Avatar>
                        {/* Online indicator */}
                        <div className="absolute bottom-1 right-1 flex h-3 w-3 items-center justify-center rounded-full border-2 border-white bg-green-500" />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-3.5 pb-6 pt-12 md:px-6">
                {/* Name and profession */}
                <div className="mb-4 flex justify-between font-inter">
                    <div>
                        <div className="mb-1 flex items-center gap-2">
                            <h2 className="text-2xl font-semibold text-gray-900 md:text-3xl">
                                {name}
                            </h2>
                            <BadgeCheck className="h-6 w-6 fill-success-normal text-sf-white-neutral" />
                        </div>
                        <p className="font-medium text-purple-600">
                            {profession}
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

                        {/* Action buttons */}
                        {/* <div className="flex gap-2">
                            <button className="flex h-6 w-6 items-center justify-center text-gray-400 hover:text-gray-600">
                                <Star className="h-4 w-4" />
                            </button>
                            <button className="flex h-6 w-6 items-center justify-center text-gray-400 hover:text-gray-600">
                                <ArrowUpRightFromSquare className="h-4 w-4" />
                            </button>
                            <button className="flex h-6 w-6 items-center justify-center text-gray-400 hover:text-gray-600">
                                <Flag className="h-4 w-4" />
                            </button>
                        </div> */}
                    </div>
                </div>

                <div className="flex flex-col items-start justify-between gap-4 font-inter md:flex-row">
                    <div className="flex items-center gap-5 md:gap-8">
                        <div className="flex items-center gap-4">
                            {/* Rating */}
                            <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-current text-yellow-400" />
                                <span className="font-semibold text-gray-900">
                                    {rating}
                                </span>
                                <span className="text-sm text-gray-500">
                                    ({reviewCount} review
                                    {reviewCount !== 1 ? 's' : ''})
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                            <MapPin className="h-4 w-4" />
                            <span>
                                {location} • {distance}
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="mb-1 text-2xl font-bold text-purple-600">
                                {servicesCompleted}
                            </div>
                            <div className="text-xs leading-tight text-gray-500">
                                Services Completed
                            </div>
                        </div>
                        <div>
                            <div className="mb-1 text-2xl font-bold text-purple-600">
                                {workExperience}
                            </div>
                            <div className="text-xs leading-tight text-gray-500">
                                Work Experience
                            </div>
                        </div>
                        <div>
                            <div className="mb-1 text-2xl font-bold text-purple-600">
                                {maxResponseTime}
                            </div>
                            <div className="text-xs leading-tight text-gray-500">
                                Max Response Time
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

export default ProfileCard;
