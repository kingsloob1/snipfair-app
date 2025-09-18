import { router } from '@inertiajs/react';
import { Heart, Pencil, Star, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

interface Portfolio {
    id: number;
    category: {
        name: string;
    };
    title: string;
    like_count: number;
    // rating: 3.4,
    media_urls: string[];
}
interface PortfolioCardProps {
    portfolio: Portfolio;
    showDelete?: boolean;
}

const PortfolioCard = ({
    portfolio,
    showDelete = false,
}: PortfolioCardProps) => {
    return (
        <motion.div
            className="mx-auto w-full max-w-md overflow-hidden rounded-2xl bg-white"
            whileHover={{
                scale: 1.02,
                boxShadow:
                    '0 10px 15px -5px rgb(0 0 0 / 0.1), 0 4px 5px -6px rgb(0 0 0 / 0.1)',
                transition: { duration: 0.2, ease: 'easeOut' },
            }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex h-full flex-col font-inter">
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-orange-100 to-pink-100">
                    <img
                        src={`/storage/${portfolio.media_urls[0]}`}
                        alt={portfolio.title}
                        className="h-full w-full object-cover"
                    />

                    {/* Badges */}
                    <div className="absolute right-4 top-4">
                        <div className="flex flex-row-reverse gap-2">
                            {showDelete && (
                                <motion.button
                                    className="flex items-center justify-center rounded-full bg-sf-white px-2 py-2 text-xs font-medium text-danger-normal hover:font-bold"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <Trash2 size={14} />
                                </motion.button>
                            )}
                            <motion.button
                                className="flex items-center justify-center rounded-full bg-sf-white px-2 py-2 text-xs font-medium text-sf-primary hover:font-bold"
                                whileHover={{ scale: 1.05 }}
                                onClick={() =>
                                    router.visit(
                                        route(
                                            'stylist.work.edit',
                                            portfolio.id,
                                        ),
                                    )
                                }
                            >
                                <Pencil size={14} />
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex flex-1 flex-col p-3">
                    <motion.h5
                        className="mb-1 text-sm font-bold text-sf-black-secondary"
                        whileHover={{ color: '#7c3aed' }}
                        transition={{ duration: 0.2 }}
                    >
                        {portfolio.title}
                    </motion.h5>

                    <p className="mb-2 text-xs leading-relaxed text-sf-black-neutral">
                        {portfolio.category.name}
                    </p>

                    {/* Footer */}
                    <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sf-black-neutral">
                            <Star
                                className="text-sf-yellow-47"
                                fill="hsl(var(--sf-yellow-47))"
                                size={16}
                            />
                            <span className="text-xs font-semibold">
                                {/* {portfolio.rating} */}0
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-sf-black-neutral">
                            <Heart size={16} />
                            <span className="text-xs">
                                {portfolio.like_count} like
                                {portfolio.like_count !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PortfolioCard;
