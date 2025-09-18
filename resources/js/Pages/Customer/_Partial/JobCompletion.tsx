import CustomButton from '@/Components/common/CustomButton';
import InputError from '@/Components/InputError';
import { Dialog, DialogContent } from '@/Components/ui/dialog';
import { useForm } from '@inertiajs/react';
import { CheckCircle, Copy, Star } from 'lucide-react';
import React, { useState } from 'react';

interface JobCompletionProps {
    name: string;
    securityCode: string;
    step: number;
    appointmentId: number;
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
}

type ReviewData = {
    name: string;
    rating: number;
    review: string;
};

const JobCompletion: React.FC<JobCompletionProps> = ({
    name,
    securityCode,
    step,
    appointmentId,
    isModalOpen,
    setIsModalOpen,
}) => {
    const { data, setData, processing, errors, post } = useForm<ReviewData>({
        name: name || '',
        rating: 0,
        review: '',
    });
    const [hoveredStar, setHoveredStar] = useState(0);

    const submit = () => {
        post(route('customer.appointment.review', appointmentId), {
            onSuccess: () => setIsModalOpen(false),
        });
    };

    const [hasCopied, setHasCopied] = useState<boolean>(false);
    const handleCopy = () => {
        navigator.clipboard.writeText('CP-' + securityCode);
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 800);
    };

    return (
        <>
            <div className="rounded-2xl border border-sf-gradient-purple bg-purple-50 p-6">
                {/* Header */}
                <h2 className="text-center text-2xl font-bold text-gray-900">
                    Job Completion Code
                </h2>
                <p className="mb-6 text-center text-sm text-gray-600">
                    Thank you for using Snipfair
                </p>

                {/* Security Code Section */}
                <div className="mb-6 rounded-xl border-2 border-sf-primary-light bg-sf-primary-light p-4">
                    <div className="text-center">
                        <h3 className="mb-2 font-inter text-sm font-bold text-gray-900">
                            Security Code
                        </h3>
                        <div className="relative mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text font-inter text-3xl font-black tracking-wider text-transparent">
                            {securityCode}
                            <button
                                onClick={handleCopy}
                                className="absolute right-2 top-2 rounded p-1 transition-colors hover:bg-gray-100/40"
                                title="Copy completion code"
                            >
                                {hasCopied ? (
                                    <CheckCircle className="h-4 w-4 text-success-normal" />
                                ) : (
                                    <Copy className="h-4 w-4 text-gray-500" />
                                )}
                            </button>
                        </div>
                        <p className="text-xs text-sf-secondary-paragraph">
                            Show this code to your stylist to verify appointment
                            completion. It should only be given when the
                            scheduled stylist completes the service.
                        </p>
                    </div>
                </div>

                {/* Rate Service Button */}
                {step === 6 ? (
                    <CustomButton onClick={() => setIsModalOpen(true)}>
                        <div className="flex gap-2">
                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                            Rate This Service
                        </div>
                    </CustomButton>
                ) : null}
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-sm">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                        <h2 className="text-lg font-bold text-sf-black">
                            Rate Your Experience
                        </h2>
                    </div>

                    {/* Modal Content */}
                    <div className="space-y-4">
                        {/* Star Rating */}
                        <div className="text-center">
                            <p className="mb-3 text-sm font-medium text-sf-secondary-paragraph">
                                How would you rate this service?
                            </p>
                            <div className="flex justify-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setData('rating', star)}
                                        onMouseEnter={() =>
                                            setHoveredStar(star)
                                        }
                                        onMouseLeave={() => setHoveredStar(0)}
                                        className="transition-transform hover:scale-110"
                                    >
                                        <Star
                                            className={`h-5 w-5 ${
                                                star <=
                                                (hoveredStar || data.rating)
                                                    ? 'fill-sf-yellow-47 text-sf-yellow-47'
                                                    : 'text-gray-300'
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Name Input */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Your Name
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500"
                                readOnly={true}
                            />
                            <InputError
                                message={errors.name}
                                className="mt-1"
                            />
                        </div>

                        {/* Review Text */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Your Review
                            </label>
                            <textarea
                                value={data.review}
                                onChange={(e) =>
                                    setData('review', e.target.value)
                                }
                                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500"
                                rows={4}
                                placeholder="Tell us about your experience..."
                            />
                            <InputError
                                message={errors.review}
                                className="mt-1"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-3">
                            <CustomButton
                                variant="secondary"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancel
                            </CustomButton>
                            <CustomButton
                                onClick={submit}
                                disabled={
                                    data.rating === 0 ||
                                    !data.name.trim() ||
                                    !data.review.trim() ||
                                    processing
                                }
                                loading={processing}
                            >
                                Submit Review
                            </CustomButton>
                        </div>
                        <InputError
                            message={errors.name}
                            className="mt-1 block w-full text-center"
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default JobCompletion;
