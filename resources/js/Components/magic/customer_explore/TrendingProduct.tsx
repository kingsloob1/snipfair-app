import CustomButton from '@/Components/common/CustomButton';
import FallbackImage from '@/Components/FallbackImage';
import { useLike } from '@/hooks/useLike';
import { MergedStylistPortfolioItem } from '@/types/custom_types';
import { router } from '@inertiajs/react';
import { Heart, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

const TrendingProduct = ({
    stylist,
}: {
    stylist: MergedStylistPortfolioItem;
}) => {
    const { toggleLike, isLoading } = useLike();
    const [isLiked, setIsLiked] = useState(stylist.is_liked || false);
    const [likesCount, setLikesCount] = useState(stylist.likes_count || 0);

    const handleLikeClick = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!stylist.id) {
            console.error('Stylist portfolio ID not found');
            return;
        }

        // Optimistically update the UI
        const previousLiked = isLiked;
        const previousCount = likesCount;
        setIsLiked(!isLiked);
        setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));

        // Make the API call
        const response = await toggleLike('portfolio', stylist.id);

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
            className="w-full cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm"
            whileHover={{
                scale: 1.01,
                boxShadow:
                    '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                transition: { duration: 0.2, ease: 'easeOut' },
            }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex h-full flex-col font-inter">
                {/* Image Section */}
                <div className="relative h-40 overflow-hidden bg-gradient-to-br from-orange-100 to-pink-100 md:h-48">
                    <FallbackImage
                        src={stylist.banner_image || ''}
                        alt={stylist.title || ''}
                        className="h-full w-full object-cover"
                    />

                    {/* Badges */}
                    <div className="absolute left-2 right-2 top-2 flex items-start justify-between md:left-4 md:right-4 md:top-4">
                        <motion.button
                            className={`${isLiked ? 'bg-sf-gradient-primary' : 'bg-sf-gradient-secondary'} rounded-full px-3 py-1.5 text-xs font-medium text-white opacity-95`}
                            whileHover={{ scale: 1.05 }}
                            onClick={handleLikeClick}
                            disabled={isLoading}
                        >
                            {likesCount}
                            <span className="hidden md:inline">
                                {' '}
                                Like{likesCount !== 1 ? 's' : ''}
                            </span>
                            <span className="ps-1 md:hidden">
                                <Heart
                                    className="inline"
                                    fill="white"
                                    size={12}
                                />
                            </span>
                        </motion.button>
                        <motion.span
                            className="rounded-full bg-sf-white/90 px-3 py-1.5 text-xs font-medium text-gray-700 backdrop-blur-sm"
                            whileHover={{ scale: 1.05 }}
                        >
                            {stylist.category}
                        </motion.span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex flex-1 flex-col p-1.5 sm:p-3 md:p-6">
                    <motion.h3
                        className="mb-1 text-base font-medium text-sf-black-secondary sm:mb-3 sm:text-lg sm:font-bold md:text-xl"
                        whileHover={{ color: '#7c3aed' }}
                        transition={{ duration: 0.2 }}
                    >
                        {stylist.name}
                    </motion.h3>

                    <p className="mb-3 text-xs leading-relaxed text-sf-black-neutral sm:mb-6 sm:text-sm">
                        {stylist.description}
                    </p>

                    {/* Footer */}
                    <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sf-black-neutral md:gap-2">
                            <Users size={14} />
                            <span className="text-xs">
                                {stylist.appointment_counts}{' '}
                                <span className="hidden md:inline">
                                    booking
                                    {stylist.appointment_counts !== 1
                                        ? 's'
                                        : ''}
                                </span>
                            </span>
                        </div>

                        <CustomButton
                            onClick={() =>
                                router.visit(
                                    route(
                                        'customer.appointment.book',
                                        stylist.id,
                                    ),
                                )
                            }
                            fullWidth={false}
                            className="px-2 py-1.5 md:px-3 md:py-2 [&_span]:!text-[12px]"
                        >
                            Book Now
                        </CustomButton>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default TrendingProduct;
