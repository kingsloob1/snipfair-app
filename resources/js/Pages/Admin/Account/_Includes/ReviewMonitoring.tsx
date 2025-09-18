import { Check, Eye, Flag, X } from 'lucide-react';
import React, { useState } from 'react';

interface Review {
    id: string;
    customerName: string;
    serviceName: string;
    rating: number;
    reviewText: string;
    date: string;
    status: 'approved' | 'flagged' | 'pending';
}

const ReviewMonitoring: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([
        {
            id: '1',
            customerName: 'David Wilson',
            serviceName: 'David Wilson',
            rating: 3,
            reviewText:
                'Amazing haircut! Jessica was professional and friendly.',
            date: '2024-03-15',
            status: 'approved',
        },
        {
            id: '2',
            customerName: 'David Wilson',
            serviceName: 'David Wilson',
            rating: 3,
            reviewText:
                'Amazing haircut! Jessica was professional and friendly.',
            date: '2024-03-15',
            status: 'approved',
        },
        {
            id: '3',
            customerName: 'David Wilson',
            serviceName: 'David Wilson',
            rating: 3,
            reviewText:
                'Amazing haircut! Jessica was professional and friendly.',
            date: '2024-03-15',
            status: 'flagged',
        },
        {
            id: '4',
            customerName: 'David Wilson',
            serviceName: 'David Wilson',
            rating: 3,
            reviewText:
                'Amazing haircut! Jessica was professional and friendly.',
            date: '2024-03-15',
            status: 'approved',
        },
    ]);

    const approvedCount = reviews.filter((r) => r.status === 'approved').length;
    const flaggedCount = reviews.filter((r) => r.status === 'flagged').length;

    const handleApprove = (reviewId: string) => {
        setReviews(
            reviews.map((review) =>
                review.id === reviewId
                    ? { ...review, status: 'approved' as const }
                    : review,
            ),
        );
    };

    // const handleFlag = (reviewId: string) => {
    //     setReviews(
    //         reviews.map((review) =>
    //             review.id === reviewId
    //                 ? { ...review, status: 'flagged' as const }
    //                 : review,
    //         ),
    //     );
    // };

    const handleRemove = (reviewId: string) => {
        setReviews(reviews.filter((review) => review.id != reviewId));
    };

    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span
                    key={i}
                    className={`text-lg ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                    ★
                </span>,
            );
        }
        return stars;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-6xl">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Review Monitoring
                    </h1>
                    <div className="flex gap-4">
                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                            Approved({approvedCount})
                        </span>
                        <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                            Flagged({flaggedCount})
                        </span>
                    </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div
                            key={review.id}
                            className="rounded-lg border border-gray-200 bg-white p-6"
                        >
                            <div className="mb-4 flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900">
                                        {review.customerName}
                                    </span>
                                    <span className="text-gray-400">›</span>
                                    <span className="text-gray-700">
                                        {review.serviceName}
                                    </span>
                                    <div className="ml-2 flex">
                                        {renderStars(review.rating)}
                                    </div>
                                </div>
                                <button className="p-2 text-gray-400 hover:text-gray-600">
                                    <Eye size={20} />
                                </button>
                            </div>

                            <div className="mb-4">
                                <h3 className="mb-2 font-medium text-gray-900">
                                    Review:
                                </h3>
                                <p className="text-gray-700">
                                    {review.reviewText}
                                </p>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <span className="text-sm">
                                        ⏰ {review.date}
                                    </span>
                                    {review.status === 'approved' && (
                                        <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                                            Approved <Check size={16} />
                                        </span>
                                    )}
                                    {review.status === 'flagged' && (
                                        <span className="flex items-center gap-1 text-sm font-medium text-red-600">
                                            Flagged <Flag size={16} />
                                        </span>
                                    )}
                                </div>

                                {review.status === 'flagged' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() =>
                                                handleApprove(review.id)
                                            }
                                            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
                                        >
                                            <Check size={16} />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleRemove(review.id)
                                            }
                                            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
                                        >
                                            <X size={16} />
                                            Remove
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
export default ReviewMonitoring;
