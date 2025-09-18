import FallbackImage from '@/Components/FallbackImage';
import { useLike } from '@/hooks/useLike';
import { MergedStylistPortfolioItem } from '@/types/custom_types';
import { router } from '@inertiajs/react';
import { Clock, Crown, Heart, MapPin, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

type TopRatedProductProps = {
    stylist: MergedStylistPortfolioItem;
};

const TopRatedProduct = ({ stylist }: TopRatedProductProps) => {
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
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className="min-w-72 overflow-hidden rounded-2xl bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl xl:min-w-80"
        >
            {/* Image Container */}
            <div className="relative">
                <FallbackImage
                    src={
                        // stylist.banner_image
                        //     ? stylist.banner_image :
                        stylist.profile_image
                            ? stylist.profile_image
                            : '/placeholder.svg'
                    }
                    alt={stylist.name || ''}
                    className="h-64 w-full object-cover"
                />

                {/* Top Rated Badge */}
                <div className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-sf-gradient-secondary px-3 py-1 text-xs font-medium text-white">
                    <Crown size={14} />
                    Top Rated
                </div>

                {/* Rating */}
                <div className="absolute right-4 top-4 rounded-lg bg-black bg-opacity-70 px-2 py-1 text-base text-white">
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
                </div>

                {/* Favorite Button */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLikeClick}
                    disabled={isLoading}
                    className="absolute bottom-4 right-4 rounded-full bg-sf-white bg-opacity-90 p-2 shadow-md backdrop-blur-sm transition-colors duration-200 hover:bg-sf-white"
                >
                    <Heart
                        size={20}
                        className={`${isLiked ? 'fill-danger-normal text-danger-normal' : 'text-sf-black-neutral'} transition-colors duration-200`}
                    />
                </motion.button>
            </div>

            {/* Content */}
            <div className="p-3 lg:p-5">
                {/* Name and Title */}
                <h3 className="mb-0.5 text-base font-bold text-sf-black md:text-lg">
                    {stylist.name}
                </h3>
                <p className="mb-2 text-sm font-medium text-sf-gradient-purple">
                    {stylist.title}
                </p>

                {/* Location */}
                <div className="mb-2 flex items-center gap-2 text-xs text-sf-gray">
                    <MapPin size={16} />
                    <span className="text-xs">{stylist.location}</span>
                </div>

                {/* Award Badge */}
                <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-sf-yellow-47">
                    <Crown size={14} />
                    {stylist.certificates && stylist.certificates[0]}
                </div>

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
                                    {specialty.category}
                                </span>
                            ))}
                    </div>
                </div>

                {/* Price and Experience */}
                <div className="mb-2 flex items-center justify-between">
                    <span className="rounded-full bg-sf-white-neutral/70 px-2 py-1 font-inter text-base font-medium text-sf-gradient-purple md:text-lg">
                        R{stylist.price}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-sf-gray">
                        <Clock size={14} />
                        {stylist.years_of_experience}y exp
                    </div>
                </div>

                {/* Next Available */}
                <p className="mb-2 text-xs text-sf-gray">
                    Next available:{' '}
                    <span className="font-medium">
                        {stylist.next_available}
                    </span>
                </p>

                {/* Book Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                        router.visit(
                            route('customer.stylists.show', stylist.id),
                        )
                    }
                    className="w-full rounded-xl bg-gradient-to-r from-sf-yellow-47 to-sf-orange-53 px-6 py-3 font-semibold text-sf-white shadow-md transition-all duration-200 hover:from-sf-orange-53 hover:to-sf-yellow-47 hover:shadow-lg"
                >
                    Check Availability
                </motion.button>
            </div>
        </motion.div>
    );
};

export default TopRatedProduct;
