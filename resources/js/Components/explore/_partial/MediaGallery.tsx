import GradientText from '@/Components/common/GradientText';
import { Refresh } from '@/Components/icon/Icons';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useMemo, useState } from 'react';
import MediaCard from './MediaCard';

interface MediaGalleryProps {
    portfolios: string[];
    batchSize?: number;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({
    portfolios,
    batchSize = 4,
}) => {
    const [loadedImageCount, setLoadedImageCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Calculate the number of images to load based on the batch size (rows)
    // For simplicity, we assume a max of 4 images per row (large screen) to calculate the initial load.
    // In a real application, you might dynamically detect screen size for initial load.
    const initialLoadCount = batchSize * 4; // 4 images per row on large screens

    useEffect(() => {
        setLoadedImageCount(Math.min(initialLoadCount, portfolios.length));
    }, [portfolios, initialLoadCount]);

    const imagesToDisplay = useMemo(() => {
        return portfolios.slice(0, loadedImageCount);
    }, [portfolios, loadedImageCount]);

    const hasMoreImages = loadedImageCount < portfolios.length;

    const loadMoreImages = () => {
        const nextLoadCount = loadedImageCount + batchSize * 4; // Add 4 more rows (max 16 images)
        setLoadedImageCount(Math.min(nextLoadCount, portfolios.length));
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05, // Stagger the appearance of individual cards
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
        },
    };

    return (
        <div className="py-8">
            <motion.div
                className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <AnimatePresence>
                    {imagesToDisplay.map((portfolio, i) => (
                        <motion.div key={i} variants={itemVariants} layout>
                            <MediaCard
                                imageUrl={`/storage/${portfolio}` || ''}
                                altText="Media"
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            <AnimatePresence>
                {hasMoreImages && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-12 flex justify-center"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setIsLoading(true);
                                setTimeout(() => {
                                    loadMoreImages();
                                    setIsLoading(false);
                                }, 1500);
                            }}
                            className="flex items-center gap-2.5 rounded-full border border-sf-gradient-purple bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-3 text-sm font-medium text-sf-gradient-purple transition-shadow duration-200 hover:shadow-md"
                        >
                            <span className="flex h-5 w-5 items-center">
                                <Refresh
                                    className={cn(
                                        isLoading && 'animate-spin opacity-50',
                                    )}
                                />
                            </span>
                            <GradientText className="hover:text-sf-gradient-pink">
                                Load More
                            </GradientText>
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MediaGallery;
