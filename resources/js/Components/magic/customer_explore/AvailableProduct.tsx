import CustomButton from '@/Components/common/CustomButton';
import FallbackImage from '@/Components/FallbackImage';
import { useLike } from '@/hooks/useLike';
import { openFullscreenOverlay } from '@/lib/helper';
import { MergedStylistPortfolioItem } from '@/types/custom_types';
import { router } from '@inertiajs/react';
import { CalendarRange, Heart, MapPin, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

const AvailableProduct = ({
    stylist,
}: {
    stylist: MergedStylistPortfolioItem;
}) => {
    const { toggleLike, isLoading } = useLike();
    const [isLiked, setIsLiked] = useState(stylist.is_liked || false);
    const [likesCount, setLikesCount] = useState(stylist.likes_count || 0);

    const handleLikeClick = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!stylist.profile_id) {
            console.error('Stylist profile ID not found');
            return;
        }

        // Optimistically update the UI
        const previousLiked = isLiked;
        const previousCount = likesCount;
        setIsLiked(!isLiked);
        setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));

        // Make the API call
        const response = await toggleLike('profile', stylist.profile_id);

        if (response && response.success) {
            // Update with actual server response
            setIsLiked(response.is_liked);
            setLikesCount(response.likes_count);
        } else {
            // Revert optimistic update on error
            setIsLiked(previousLiked);
            setLikesCount(previousCount);
        }
    };

    const availabilityColors = {
        'Online Now': 'bg-green-500',
        Today: 'bg-yellow-500',
        Tomorrow: 'bg-orange-500',
        'This Week': 'bg-yellow-500',
        'Available Later': 'bg-red-500',
    };

    return (
        <motion.div
            className="mx-auto flex h-full max-w-sm cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
        >
            <motion.div
                className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-900 to-gray-700 md:h-64"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.3 }}
            >
                <FallbackImage
                    src={
                        // stylist.banner_image :
                        //     ? stylist.banner_image
                        stylist.profile_image
                            ? stylist.profile_image
                            : '/placeholder.svg'
                    }
                    alt={stylist.name || ''}
                    className="h-full w-full object-cover"
                />

                {/* Availability Badge */}
                {stylist.availability && (
                    <motion.div
                        className={`absolute left-3 top-3 rounded-full bg-green-500 px-3 py-1 text-xs font-medium text-white ${availabilityColors[stylist.availability]}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {stylist.availability}
                    </motion.div>
                )}

                {/* Distance */}
                <motion.div
                    className="absolute left-3 top-12 rounded-full bg-sf-white bg-opacity-80 px-2 py-1 text-xs text-sf-black-secondary"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    {stylist.distance}
                </motion.div>

                {/* Rating */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="absolute right-3 top-3 rounded-lg bg-black bg-opacity-70 px-2 py-1 text-base text-white"
                >
                    <div className="flex items-center justify-center gap-1">
                        <Star
                            size={18}
                            className="fill-yellow-400 text-yellow-400"
                        />
                        <span className="font-semibold">
                            {stylist.average_rating}
                        </span>
                    </div>
                    <div className="text-center text-xs font-semibold">
                        {stylist.total_reviews} Review
                        {stylist.total_reviews !== 1 ? 's' : ''}
                    </div>
                </motion.div>

                {/* Heart Icon */}
                <motion.button
                    className="absolute bottom-3 right-3 rounded-full bg-sf-white bg-opacity-90 p-2 shadow-md backdrop-blur-sm transition-colors duration-200 hover:bg-sf-white"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleLikeClick}
                    disabled={isLoading}
                >
                    <Heart
                        size={20}
                        className={`${isLiked ? 'fill-danger-normal text-danger-normal' : 'text-sf-black-neutral'} transition-colors duration-200`}
                    />
                </motion.button>
            </motion.div>

            <motion.div
                className="flex flex-1 flex-col p-5 transition-shadow duration-300 hover:shadow-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                {/* Name and Profession */}
                <div>
                    <div className="mb-2">
                        <h3 className="mb-0.5 text-base font-bold text-sf-black md:text-lg">
                            {stylist.name}
                        </h3>
                        <p className="mb-2 text-sm font-medium text-sf-gradient-purple">
                            {stylist.title}
                        </p>
                    </div>

                    {/* Location */}
                    <div className="mb-2 flex items-center gap-2 text-xs text-sf-gray">
                        <MapPin size={16} />
                        <span className="text-xs">{stylist.location}</span>
                    </div>

                    {/* Certification */}
                    {stylist.certificates &&
                        stylist.certificates.length > 0 && (
                            <div className="mb-2 flex items-center gap-2 text-xs text-sf-gray">
                                <CalendarRange size={16} />
                                <span className="text-xs">
                                    {stylist.certificates[0]}
                                </span>
                            </div>
                        )}

                    {/* Specialties */}
                    <div className="mb-2">
                        <p className="mb-2 text-sm font-medium text-sf-black-neutral">
                            Specialties:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {stylist.categories &&
                                stylist.categories.map((specialty, index) => (
                                    <span
                                        key={index}
                                        className="rounded-full bg-sf-white-neutral/70 px-2 py-1 text-xs text-sf-gray-zinc"
                                    >
                                        <span>{specialty.category}</span>{' '}
                                        <span className="font-medium">
                                            - R{specialty.price}
                                        </span>
                                    </span>
                                ))}
                        </div>
                    </div>

                    {/* Work Samples */}
                    <div className="mb-2">
                        <p className="mb-2 text-sm font-medium text-sf-black-neutral">
                            Work Sample:
                        </p>
                        <div className="flex gap-2">
                            {stylist.sample_images &&
                                stylist.sample_images.map((image, index) => (
                                    <motion.div
                                        key={index}
                                        className="relative h-10 w-10 overflow-hidden rounded-lg md:h-14 md:w-14"
                                        whileHover={{ scale: 1.05 }}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{
                                            delay: 0.4 + index * 0.1,
                                        }}
                                    >
                                        <FallbackImage
                                            src={`/storage/${image}`}
                                            onClick={() =>
                                                openFullscreenOverlay(
                                                    `/storage/${image}`,
                                                )
                                            }
                                            alt={`${stylist.name} work sample`}
                                            className="h-full w-full object-cover"
                                        />
                                    </motion.div>
                                ))}
                        </div>
                    </div>
                </div>

                <div className="mt-auto">
                    {/* Price and Button */}
                    <div className="mb-3 flex items-center justify-between">
                        <motion.span
                            className="rounded-full bg-sf-white-neutral/70 px-2 py-1 font-inter text-base font-medium text-sf-gradient-purple md:text-lg"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            {stylist.price_range}
                        </motion.span>
                        <CustomButton
                            onClick={() =>
                                router.visit(
                                    route('customer.stylists.show', stylist.id),
                                )
                            }
                            className="w-28 px-2 py-1.5 text-[10px] md:px-3 md:py-2"
                        >
                            View Profile
                        </CustomButton>
                    </div>

                    {/* Response Time */}
                    <motion.p
                        className="text-xs text-gray-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                    >
                        Usually Respond within {stylist.response_time}
                    </motion.p>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AvailableProduct;

// Demo with multiple cards
// const App = () => {
//   const sampleProducts = [
//     {
//       name: "Micheal Chen",
//       profession: "Makeup Artist",
//       location: "Mbape Abuja",
//       rating: 4.8,
//       reviewCount: 591,
//       isAvailable: true,
//       distance: "2.1 Miles",
//       isCertified: true,
//       certificationText: "Master Barber Certified",
//       specialties: [
//         { name: "Bridal Makeup", price: "$125" },
//         { name: "Special Events", price: "$250" }
//       ],
//       priceRange: "$45 - 90",
//       responseTime: "Usually Respond within 15mins",
//       workSamples: [
//         "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop",
//         "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop",
//         "https://images.unsplash.com/photo-1594736797933-d0fa0a4f5bb9?w=400&h=400&fit=crop"
//       ]
//     },
//     {
//       name: "Sarah Johnson",
//       profession: "Hair Stylist",
//       location: "Victoria Island",
//       rating: 4.9,
//       reviewCount: 342,
//       isAvailable: false,
//       distance: "3.5 Miles",
//       isCertified: true,
//       certificationText: "Licensed Hair Professional",
//       specialties: [
//         { name: "Hair Color", price: "$85" },
//         { name: "Wedding Styles", price: "$150" }
//       ],
//       priceRange: "$60 - 200",
//       responseTime: "Usually Respond within 30mins",
//       workSamples: [
//         "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400&h=400&fit=crop",
//         "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=400&fit=crop",
//         "https://images.unsplash.com/photo-1522336284037-91f7da800eaa?w=400&h=400&fit=crop"
//       ]
//     }
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50 py-12 px-4">
//       <div className="max-w-6xl mx-auto">
//         <h1 className="text-3xl font-bold text-center mb-12 text-gray-900">Service Providers</h1>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {sampleProducts.map((product, index) => (
//             <ServiceProviderCard key={index} product={product} />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default App;
