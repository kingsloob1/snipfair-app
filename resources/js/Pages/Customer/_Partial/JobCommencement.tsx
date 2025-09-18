import CustomButton from '@/Components/common/CustomButton';
import { router } from '@inertiajs/react';
import { CheckCircle, Copy } from 'lucide-react';
import { useState } from 'react';

export default function JobCommencement({
    appointmentData,
    stylist,
    onReschedule,
    onCancel,
}: {
    appointmentData: {
        appointment_code: string;
    } | null;
    stylist: {
        id: number;
    };
    onReschedule?: () => void;
    onCancel?: () => void;
}) {
    const [hasCopied, setHasCopied] = useState<boolean>(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(appointmentData?.appointment_code || '');
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 800);
    };
    return (
        <div className="rounded-2xl bg-success-light p-6">
            <h2 className="mb-4 text-center text-2xl font-bold text-gray-900">
                Booking Confirmed
            </h2>

            <p className="mb-6 text-center text-sm text-gray-600">
                Your appointment is confirmed. Please Save your security code.
            </p>

            <div className="mb-6 rounded-xl border-2 border-green-400 bg-white p-4">
                <div className="text-center">
                    <h3 className="mb-2 font-inter text-sm font-bold text-gray-900">
                        Security Code
                    </h3>
                    <div className="relative mb-2 font-inter text-3xl font-black tracking-wider text-green-500">
                        {appointmentData?.appointment_code?.split('-')[1] ||
                            'N/A'}
                        <button
                            onClick={handleCopy}
                            className="absolute right-2 top-2 rounded p-1 transition-colors hover:bg-gray-100"
                            title="Copy booking ID"
                        >
                            {hasCopied ? (
                                <CheckCircle className="h-4 w-4 text-success-normal" />
                            ) : (
                                <Copy className="h-4 w-4 text-gray-500" />
                            )}
                        </button>
                    </div>
                    <p className="text-xs text-sf-secondary-paragraph">
                        Show this code to your stylist to verify appointment. It
                        should only be given when the scheduled stylist shows up
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                <CustomButton onClick={onReschedule}>
                    Reschedule Booking
                </CustomButton>
                <CustomButton variant="secondary" onClick={onCancel}>
                    Cancel Booking
                </CustomButton>
                <CustomButton
                    variant="black"
                    onClick={() =>
                        router.post('/chat/start', {
                            recipient_id: stylist.id,
                        })
                    }
                >
                    Send a Message
                </CustomButton>
            </div>
        </div>
    );
}
