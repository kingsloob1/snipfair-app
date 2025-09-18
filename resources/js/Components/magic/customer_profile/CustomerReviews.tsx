import StarRating from '@/Components/common/StarRating';
import { User } from 'lucide-react';
import { motion } from 'motion/react';

interface CustomerReview {
    id: number;
    stylist_name: string;
    service_name: string;
    rating: number;
    comment: string;
    review_date: string;
}

interface CustomerReviewsProps {
    reviews: CustomerReview[];
}

export default function CustomerReviews({ reviews }: CustomerReviewsProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="w-full space-y-6 overflow-hidden rounded-2xl border border-sf-stroke p-3.5 shadow-sm shadow-sf-gray/20 md:p-6">
            <h2 className="mb-8 text-2xl font-bold text-sf-black">
                Reviews Given by Customer
            </h2>
            <div className="grid grid-cols-1 gap-4">
                {reviews.length === 0 ? (
                    <div className="text-center text-sf-gray">
                        No reviews given yet.
                    </div>
                ) : (
                    reviews.slice(0, 5).map((review, index) => (
                        <motion.div
                            key={review.id}
                            className="relative"
                            whileHover={{ scale: 1.02 }}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="flex flex-col rounded-2xl border border-sf-stroke bg-sf-white p-4 shadow-sm transition-shadow hover:shadow-md">
                                <div className="mb-3 flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="mb-2 flex items-center gap-2">
                                            <User className="h-5 w-5 text-purple-600" />
                                            <h3 className="text-lg font-semibold text-sf-primary-paragraph">
                                                {review.stylist_name}
                                            </h3>
                                        </div>
                                        <p className="mb-2 text-sm font-medium text-blue-600">
                                            {review.service_name}
                                        </p>
                                        <StarRating
                                            rating={review.rating}
                                            showCount={false}
                                            showRating={true}
                                            ratingDate={formatDate(
                                                review.review_date,
                                            )}
                                            size="small"
                                        />
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <p className="text-sm leading-relaxed text-sf-primary-paragraph">
                                        "{review.comment}"
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
            {reviews.length > 5 && (
                <div className="text-center">
                    <button className="font-medium text-purple-600 hover:text-purple-800">
                        View All Reviews ({reviews.length})
                    </button>
                </div>
            )}
        </div>
    );
}
