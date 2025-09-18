import React, { useState } from 'react';

interface BookingData {
    service: string;
    duration: string;
    date: string;
    time: string;
    total: number;
    securityCode: string;
}

const BookingSummaryOld: React.FC = () => {
    const [bookingData] = useState<BookingData>({
        service: 'Hair Color',
        duration: '2hours',
        date: 'June - 18- 2025',
        time: '1:PM',
        total: 80,
        securityCode: 'NX6E8Y',
    });

    const [isCompleted, setIsCompleted] = useState<boolean>(false);

    const handleConfirmCompletion = (): void => {
        setIsCompleted(true);
        // Here you would typically make an API call to confirm completion
        console.log('Job completion confirmed');
    };

    return (
        <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <h1 className="mb-6 text-2xl font-bold text-gray-900">
                Booking Summary
            </h1>

            <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-gray-500">Service:</span>
                    <span className="font-medium text-gray-900">
                        {bookingData.service}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-gray-500">Duration:</span>
                    <span className="font-medium text-gray-900">
                        {bookingData.duration}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-gray-500">Date:</span>
                    <span className="font-medium text-gray-900">
                        {bookingData.date}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-gray-500">Time</span>
                    <span className="font-medium text-gray-900">
                        {bookingData.time}
                    </span>
                </div>
            </div>

            <hr className="mb-6 border-gray-200" />

            <div className="mb-8 flex items-center justify-between">
                <span className="text-xl font-bold text-gray-900">Total</span>
                <span className="text-xl font-bold text-pink-500">
                    R{bookingData.total}
                </span>
            </div>

            <div className="rounded-2xl bg-green-50 p-6">
                <h2 className="mb-4 text-center text-2xl font-bold text-gray-900">
                    Booking Confirmed
                </h2>

                <p className="mb-6 text-center text-gray-600">
                    Your appointment is confirmed. Please Save your security
                    code.
                </p>

                <div className="mb-6 rounded-xl border-2 border-green-400 bg-white p-4">
                    <div className="text-center">
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">
                            Security Code
                        </h3>
                        <div className="mb-2 text-3xl font-bold tracking-wider text-green-500">
                            {bookingData.securityCode}
                        </div>
                        <p className="text-sm text-gray-600">
                            show this code to your stylist to verify appointment
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleConfirmCompletion}
                    className={`w-full rounded-2xl px-6 py-4 font-semibold text-white transition-all duration-200 ${
                        isCompleted
                            ? 'cursor-not-allowed bg-gray-400'
                            : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 active:scale-95'
                    }`}
                    disabled={isCompleted}
                >
                    {isCompleted ? 'Job Completed ✓' : 'Confirm Job Completion'}
                </button>

                <p className="mt-4 text-center text-xs text-gray-500">
                    By booking, you agree to our terms and cancellation policy.
                </p>
            </div>
        </div>
    );
};

export default BookingSummaryOld;
