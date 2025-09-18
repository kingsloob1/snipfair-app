import CustomButton from '@/Components/common/CustomButton';
import AvailableProduct from '@/Components/magic/customer_explore/AvailableProduct';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { MergedStylistPortfolioItem } from '@/types/custom_types';
import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';

const Favorites = ({
    favorite_stylists,
}: {
    favorite_stylists: MergedStylistPortfolioItem[];
}) => {
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
        },
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

    return (
        <AuthenticatedLayout
            showToExplore={false}
            exploreRoute={{ name: 'Back to Explore', path: route('dashboard') }}
        >
            <Head title="Favorites" />
            <section className="mx-auto max-w-7xl px-5 py-2 md:py-4 xl:py-6">
                <h2 className="font-inter text-xl font-bold text-sf-gray-zinc sm:text-2xl md:text-3xl">
                    My Favorites
                </h2>
                <motion.div
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <AnimatePresence>
                        {favorite_stylists && favorite_stylists.length > 0 ? (
                            favorite_stylists.map((stylist) => (
                                <motion.div
                                    key={stylist.id}
                                    variants={itemVariants}
                                    className={stylist.is_liked ? '' : 'hidden'}
                                    layout
                                >
                                    <AvailableProduct
                                        stylist={stylist}
                                        key={stylist.id}
                                    />
                                </motion.div>
                            ))
                        ) : (
                            <div className="sm:col-span-2 lg:col-span-3">
                                <p className="py-10 text-center text-base italic text-sf-primary-paragraph">
                                    Nothing saved to favorites yet
                                </p>
                                <CustomButton
                                    className="mx-auto w-48"
                                    fullWidth={false}
                                    onClick={() =>
                                        router.visit(route('customer.explore'))
                                    }
                                >
                                    Explore Stylists
                                </CustomButton>
                            </div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </section>
        </AuthenticatedLayout>
    );
};

export default Favorites;
