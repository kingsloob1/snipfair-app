import StarRating from '@/Components/common/StarRating';
import { motion } from 'motion/react';

interface Review {
    name: string;
    title: string;
    message: string;
    rating: number;
    ratingDate: string;
}

export default function Reviews({ reviews }: { reviews: Review[] }) {
    return (
        <div className="w-full space-y-6 overflow-hidden rounded-2xl border border-sf-stroke p-3.5 shadow-sm shadow-sf-gray/20 md:p-6">
            <h2 className="mb-8 text-2xl font-bold text-sf-black">
                Recent Client Reviews
            </h2>
            <div className="grid grid-cols-1 gap-4">
                {reviews.length === 0 ? (
                    <div className="text-center text-sf-gray">
                        No reviews available yet.
                    </div>
                ) : (
                    reviews.slice(0, 5).map((review, index) => (
                        <motion.div
                            key={index}
                            className="relative"
                            whileHover={{ scale: 1.05 }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="flex flex-col rounded-2xl border-b border-sf-stroke px-3 py-4 last:border-b-0 hover:bg-sf-white">
                                <div className="mb-2 flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold text-sf-primary-paragraph">
                                            {review.name}
                                        </h3>
                                        <StarRating
                                            rating={review.rating}
                                            showCount={false}
                                            showRating={false}
                                            ratingDate={review.ratingDate}
                                            size="small"
                                        />
                                    </div>
                                    <p className="rounded-full border border-sf-stroke bg-sf-white-card p-2 text-xs text-sf-primary-paragraph">
                                        {review.title}
                                    </p>
                                </div>
                                <p className="rounded-full text-sm text-sf-primary-paragraph">
                                    {review.message}
                                </p>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
