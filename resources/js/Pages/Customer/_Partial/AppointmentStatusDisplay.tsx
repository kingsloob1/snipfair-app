import {
    AlertCircle,
    CheckCircle,
    Clock,
    Sparkles,
    User,
    XCircle,
} from 'lucide-react';

interface AppointmentStatusDisplayProps {
    step: number;
    appointmentData?: {
        id: number;
        status: string;
        appointment_code: string;
        completion_code?: string;
        amount: number;
        review?: boolean;
    };
}

const AppointmentStatusDisplay: React.FC<AppointmentStatusDisplayProps> = ({
    step,
    appointmentData,
}) => {
    const getStepInfo = (stepNumber: number) => {
        switch (stepNumber) {
            case 1:
                return {
                    icon: Clock,
                    title: 'Ready to Book',
                    description: 'Select your preferred date and time',
                    color: 'text-gray-500',
                    bgColor: 'bg-gray-100',
                };
            case 2:
                return {
                    icon: Clock,
                    title: 'Processing Payment',
                    description:
                        'Your booking is being processed. Please wait...',
                    color: 'text-blue-500',
                    bgColor: 'bg-blue-100',
                };
            case 3:
                return {
                    icon: AlertCircle,
                    title: 'Awaiting Admin Approval',
                    description: 'Admin is verifying your payment',
                    color: 'text-yellow-500',
                    bgColor: 'bg-yellow-100',
                };
            case 4:
                return {
                    icon: User,
                    title: 'Stylist Review',
                    description:
                        'Your stylist is reviewing the appointment request',
                    color: 'text-purple-500',
                    bgColor: 'bg-purple-100',
                };
            case 5:
                return {
                    icon: CheckCircle,
                    title: 'Appointment Confirmed',
                    description:
                        'Ready for your appointment! Show your code to the stylist.',
                    color: 'text-green-500',
                    bgColor: 'bg-green-100',
                };
            case 6:
                return {
                    icon: Sparkles,
                    title: 'Service Completed',
                    description:
                        'Your appointment has been completed. Please leave a review.',
                    color: 'text-indigo-500',
                    bgColor: 'bg-indigo-100',
                };
            case 7:
                return {
                    icon: CheckCircle,
                    title: 'Complete',
                    description: 'Thank you for your review!',
                    color: 'text-green-600',
                    bgColor: 'bg-green-100',
                };
            case 8:
                return {
                    icon: XCircle,
                    title: 'Issue Reported',
                    description:
                        'There was an issue with your appointment. Support will contact you.',
                    color: 'text-red-500',
                    bgColor: 'bg-red-100',
                };
            default:
                return {
                    icon: Clock,
                    title: 'Ready to Book',
                    description: 'Select your preferred date and time',
                    color: 'text-gray-500',
                    bgColor: 'bg-gray-100',
                };
        }
    };

    const stepInfo = getStepInfo(step);
    const StepIcon = stepInfo.icon;

    if (step === 1) {
        return null; // Don't show status display for initial booking step
    }

    return (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-4">
                <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${stepInfo.bgColor}`}
                >
                    <StepIcon className={`h-6 w-6 ${stepInfo.color}`} />
                </div>
                <div className="flex-1">
                    <h3 className={`font-semibold ${stepInfo.color}`}>
                        {stepInfo.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                        {stepInfo.description}
                    </p>
                </div>
            </div>

            {/* Show appointment code when confirmed */}
            {step === 5 && appointmentData?.appointment_code && (
                <div className="mt-4 rounded-lg border-2 border-green-300 bg-green-50 p-3">
                    <div className="text-center">
                        <p className="text-sm font-medium text-green-800">
                            Your Appointment Code
                        </p>
                        <p className="text-xl font-bold text-green-600">
                            {appointmentData.appointment_code}
                        </p>
                        <p className="text-xs text-green-700">
                            Show this to your stylist
                        </p>
                    </div>
                </div>
            )}

            {/* Show completion code when service is done */}
            {step === 6 && appointmentData?.completion_code && (
                <div className="mt-4 rounded-lg border-2 border-indigo-300 bg-indigo-50 p-3">
                    <div className="text-center">
                        <p className="text-sm font-medium text-indigo-800">
                            Service Completion Code
                        </p>
                        <p className="text-xl font-bold text-indigo-600">
                            {appointmentData.completion_code}
                        </p>
                        <p className="text-xs text-indigo-700">
                            Your service was completed successfully
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppointmentStatusDisplay;
