import GradientText from '@/Components/common/GradientText';
import { MergedStylistPortfolioItem } from '@/types/custom_types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useMemo, useState } from 'react';
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
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const itemsPerPage = batchSize * rowCount;
    const totalPages = Math.ceil(stylists.length / itemsPerPage);

    const stylistsToDisplay = useMemo(() => {
        const start = currentPage * itemsPerPage;
        const end = start + itemsPerPage;
        return stylists.slice(start, end);
    }, [stylists, currentPage, itemsPerPage]);

    const hasNextPage = currentPage < totalPages - 1;
    const hasPrevPage = currentPage > 0;

    const changePage = (newPage: number) => {
        setCurrentPage(newPage);
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
                {totalPages > 1 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-12 flex justify-center gap-4"
                    >
                        {hasPrevPage && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setIsLoading(true);
                                    setTimeout(() => {
                                        changePage(currentPage - 1);
                                        setIsLoading(false);
                                    }, 1500);
                                }}
                                disabled={isLoading}
                                className="flex items-center gap-2.5 rounded-full border border-sf-gradient-purple bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2.5 text-sm font-medium text-sf-gradient-purple transition-shadow duration-200 hover:shadow-md disabled:opacity-50"
                            >
                                <span className="flex h-5 w-5 items-center">
                                    <ChevronLeft />
                                </span>
                                <GradientText className="hover:text-sf-gradient-pink">
                                    Previous
                                </GradientText>
                            </motion.button>
                        )}

                        <div className="flex items-center gap-1 px-3 py-2.5 text-sm font-medium text-gray-600">
                            <span className="text-sf-gradient-purple">
                                {currentPage + 1}
                            </span>
                            <span>of</span>
                            <span className="text-sf-gradient-purple">
                                {totalPages}
                            </span>
                        </div>

                        {hasNextPage && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setIsLoading(true);
                                    setTimeout(() => {
                                        changePage(currentPage + 1);
                                        setIsLoading(false);
                                    }, 1500);
                                }}
                                disabled={isLoading}
                                className="flex items-center gap-2.5 rounded-full border border-sf-gradient-purple bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2.5 text-sm font-medium text-sf-gradient-purple transition-shadow duration-200 hover:shadow-md disabled:opacity-50"
                            >
                                <GradientText className="hover:text-sf-gradient-pink">
                                    Next
                                </GradientText>
                                <span className="flex h-5 w-5 items-center">
                                    <ChevronRight />
                                </span>
                            </motion.button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LoadingProducts;
