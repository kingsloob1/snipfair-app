import { router } from '@inertiajs/react';
import { Star, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

interface Review {
    id: number;
    rating: number;
    comment: string;
    appointment: {
        customer: string;
        stylist: string;
    };
    created_at: string;
}

interface ReviewMonitoringProps {
    reviews: Review[];
}

const ReviewMonitoring: React.FC<ReviewMonitoringProps> = ({ reviews }) => {
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    const handleDelete = (reviewId: number) => {
        if (confirm('Are you sure you want to delete this review?')) {
            setIsDeleting(reviewId);
            router.delete(route('admin.contents.reviews.delete', reviewId), {
                onFinish: () => setIsDeleting(null),
            });
        }
    };

    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    className={`h-4 w-4 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />,
            );
        }
        return stars;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                    Review Management
                </h2>
                <div className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                    Total Reviews: {reviews.length}
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                        <p className="text-gray-500">No reviews found.</p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div
                            key={review.id}
                            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                        >
                            <div className="mb-4 flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="font-medium text-gray-900">
                                        {review.appointment.customer}
                                    </span>
                                    <span className="text-gray-400">→</span>
                                    <span className="text-gray-700">
                                        {review.appointment.stylist}
                                    </span>
                                    <div className="ml-2 flex gap-1">
                                        {renderStars(review.rating)}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(review.id)}
                                    disabled={isDeleting === review.id}
                                    className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                                >
                                    <Trash2 size={16} />
                                    {isDeleting === review.id
                                        ? 'Deleting...'
                                        : 'Delete'}
                                </button>
                            </div>

                            <div className="mb-4">
                                <h3 className="mb-2 font-medium text-gray-900">
                                    Review:
                                </h3>
                                <p className="leading-relaxed text-gray-700">
                                    {review.comment}
                                </p>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Posted on {review.created_at}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ReviewMonitoring;
