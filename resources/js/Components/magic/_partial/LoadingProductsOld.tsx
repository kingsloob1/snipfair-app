import GradientText from '@/Components/common/GradientText';
import { Refresh } from '@/Components/icon/Icons';
import { cn } from '@/lib/utils';
import { MergedStylistPortfolioItem } from '@/types/custom_types';
import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useMemo, useState } from 'react';
import AvailableProduct from '../customer_explore/AvailableProduct';

interface MediaGalleryProps {
    stylists: MergedStylistPortfolioItem[];
    batchSize?: number;
    rowCount?: number;
}

const LoadingProducts: React.FC<MediaGalleryProps> = ({
    stylists,
    batchSize = 3,
    rowCount = 2,
}) => {
    const [loadedStylistCount, setLoadedStylistCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const initialLoadCount = batchSize * rowCount;

    useEffect(() => {
        setLoadedStylistCount(Math.min(initialLoadCount, stylists.length));
    }, [stylists, initialLoadCount]);

    const stylistsToDisplay = useMemo(() => {
        return stylists.slice(0, loadedStylistCount);
    }, [stylists, loadedStylistCount]);

    const hasMoreStylists = loadedStylistCount < stylists.length;

    const loadMoreImages = () => {
        const nextLoadCount = loadedStylistCount + batchSize * rowCount;
        setLoadedStylistCount(Math.min(nextLoadCount, stylists.length));
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
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
        <div className="py-0 sm:py-4 md:py-8">
            <motion.div
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <AnimatePresence>
                    {stylistsToDisplay.map((stylist) => (
                        <motion.div
                            key={stylist.id}
                            variants={itemVariants}
                            layout
                        >
                            <AvailableProduct
                                stylist={stylist}
                                key={stylist.id}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            <AnimatePresence>
                {hasMoreStylists && (
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

export default LoadingProducts;
