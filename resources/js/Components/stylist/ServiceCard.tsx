import { Check, Clock, MapPin, MessageCircle, Star, X } from 'lucide-react';
import React from 'react';
import GradientText from '../common/GradientText';
interface ServiceCardProps {
    image: string;
    name: string;
    category: string;
    rating: number;
    bookings: number;
    title: string;
    description: string;
    location: string;
    distance: string;
    time: string;
    duration: string;
    price: number;
    isPremium?: boolean;
    onAccept?: () => void;
    onMessage?: () => void;
    onDecline?: () => void;
}
export const ServiceCard: React.FC<ServiceCardProps> = ({
    image,
    name,
    category,
    rating,
    bookings,
    title,
    description,
    location,
    distance,
    time,
    duration,
    price,
    isPremium = false,
    onAccept,
    onMessage,
    onDecline,
}) => {
    return (
        <div className="w-full rounded-lg bg-white p-4 shadow-sm md:p-6">
            <div className="flex flex-col justify-between gap-3 md:flex-row">
                <div className="max-w-2xl">
                    <div className="flex items-start justify-between">
                        <div className="flex w-full gap-4">
                            <img
                                src={image}
                                alt="Service provider"
                                className="h-16 w-16 rounded-full object-cover"
                            />
                            <div className="flex-1">
                                <div className="flex items-center justify-between gap-2 md:justify-start">
                                    <h2 className="text-lg font-semibold text-sf-black">
                                        {name}
                                    </h2>
                                    {isPremium && (
                                        <span className="flex items-center justify-center rounded-xl bg-gradient-to-r from-sf-yellow-47 to-sf-orange-53 p-px font-semibold shadow-md">
                                            <span className="rounded-xl bg-sf-white px-3 py-1 text-[10px]">
                                                <GradientText variant="secondary">
                                                    Premium Request
                                                </GradientText>
                                            </span>
                                        </span>
                                    )}
                                </div>
                                <p className="text-sf-primary-paragraph">
                                    {category}
                                </p>
                                <div className="mt-1 flex items-center gap-3 text-sm">
                                    <div className="flex items-center">
                                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                        <span className="ml-1 font-medium">
                                            {rating}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-sf-secondary-paragraph">
                                        <Clock className="mr-1 h-4 w-4" />
                                        <span>
                                            {bookings} Booking
                                            {bookings !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-3">
                        <h3 className="font-semibold text-sf-black">{title}</h3>
                        <p className="mt-2 text-sm text-sf-secondary-paragraph">
                            {description}
                        </p>
                    </div>
                    <div className="mt-5 flex items-center gap-6">
                        <div className="flex items-center text-sm text-sf-primary-paragraph">
                            <MapPin className="mr-2 h-4 w-4" />
                            <span>{location}</span>
                            <span className="ml-2 whitespace-nowrap rounded-xl border border-sf-stroke px-1.5 py-0.5 text-xs text-sf-primary-paragraph">
                                ({distance})
                            </span>
                        </div>
                        <div className="flex items-center text-sm text-sf-primary-paragraph">
                            <Clock className="mr-2 h-5 w-5" />
                            <span>{time}</span>
                            <span className="ml-1">({duration})</span>
                        </div>
                        <div className="ml-auto font-bold text-sf-gradient-purple">
                            R{price}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col justify-between gap-2">
                    <button
                        onClick={onAccept}
                        className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-6 py-2.5 text-sm text-white transition-colors hover:bg-emerald-600"
                    >
                        <Check className="h-5 w-5" />
                        Accept
                    </button>
                    <button
                        onClick={onMessage}
                        className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                    >
                        <MessageCircle className="h-5 w-5" />
                        Message
                    </button>
                    <button
                        onClick={onDecline}
                        className="flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                    >
                        <X className="h-5 w-5" />
                        Decline
                    </button>
                </div>
            </div>
        </div>
    );
};

{
    /* <span
                                            className="w-full rounded-xl bg-gradient-to-r from-sf-yellow-47 to-sf-orange-53 p-0.5 font-semibold text-sf-white shadow-md transition-all duration-200 hover:from-sf-orange-53 hover:to-sf-yellow-47 hover:shadow-lg"
                                        >
                                            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-600">
                                                Premium Request
                                            </span>
                                        </span> */
}
