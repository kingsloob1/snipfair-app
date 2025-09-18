import CustomButton from '@/Components/common/CustomButton';
import { CustomToast } from '@/Components/common/CustomToast';
import GradientTextSpan from '@/Components/common/GradientTextSpan';
import PaymentModal from '@/Components/modals/PaymentModal';
import { apiCall } from '@/hooks/api';
import { router } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import DisputeModal from './DisputeModal';
import JobCommencement from './JobCommencement';
import JobCompletion from './JobCompletion';

// Define interfaces for type safety
interface AppointmentData {
    id: number;
    status: string;
    appointment_code: string;
    completion_code?: string;
    amount: number;
    review?: boolean;
    canRescheduleFree?: boolean;
    reschedulePenaltyPercentage?: number;
    canCancelFree?: boolean;
    cancelPenaltyPercentage?: number;
    hoursUntilAppointment?: number;
    appointment_time: string;
    appointment_date: string;
    extra?: string;
    first_dispute?: {
        id: number;
        status: string;
    };
}

// Status Display Component
const StatusDisplay = ({ step }: { step: number }) => {
    const getStatusInfo = () => {
        switch (step) {
            case 2:
                return {
                    color: 'bg-blue-100 text-blue-800',
                    text: 'Processing Payment...',
                };
            case 3:
                return {
                    color: 'bg-yellow-100 text-yellow-800',
                    text: 'Awaiting Stylist Approval',
                };
            case 4:
                return {
                    color: 'bg-purple-100 text-purple-800',
                    text: 'Appointment Confirmed',
                };
            case 5:
                return {
                    color: 'bg-green-100 text-green-800',
                    text: 'Appointment Started',
                };
            case 6:
                return {
                    color: 'bg-indigo-100 text-indigo-800',
                    text: 'Service Completed',
                };
            // case 7:
            //     return {
            //         color: 'bg-green-100 text-green-800',
            //         text: 'Thank You!',
            //     };
            case 8:
                return {
                    color: 'bg-red-100 text-red-800',
                    text: 'Issue Reported',
                };
            default:
                return null;
        }
    };

    const statusInfo = getStatusInfo();
    if (!statusInfo) return null;

    return (
        <div className="rounded-lg p-3">
            <div
                className={`rounded-lg px-3 py-2 text-center ${statusInfo.color}`}
            >
                <p className="font-medium">{statusInfo.text}</p>
            </div>
        </div>
    );
};

const BookingSummary = ({
    stylist,
    portfolio,
    selectedDate = '',
    selectedDateDb = '',
    selectedTime = '',
    extra = '',
    setExtra,
    address,
    name,
    setEnableCreate,
    setSelectedTime,
    setSelectedDate,
    appointment_id,
}: {
    stylist: {
        id: number;
        name: string;
        stylist_profile: { business_name: string; is_available?: boolean };
    };
    portfolio: {
        id: number;
        title: string;
        category: { name: string };
        duration: string;
        price: number;
    };
    selectedDate?: string;
    selectedDateDb?: string;
    selectedTime?: string;
    extra?: string;
    address: string;
    name: string;
    setEnableCreate: (value: boolean) => void;
    setSelectedTime: (time: string) => void;
    setSelectedDate: (date: Date | undefined) => void;
    setExtra: (extra: string) => void;
    appointment_id?: number;
}) => {
    const [step, setStep] = useState(1);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [duckModal, setDuckModal] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [disputeOpen, setDisputeOpen] = useState(false);
    const [userBalance, setUserBalance] = useState(0);
    const [appointmentData, setAppointmentData] =
        useState<AppointmentData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const getStepFromStatus = useCallback(
        (status: string) => {
            switch (status) {
                case 'processing':
                    return 2;
                case 'pending':
                    return 3;
                case 'approved':
                    return 4;
                case 'confirmed':
                    return 5;
                case 'completed':
                    return appointmentData?.review ? 7 : 6;
                case 'escalated':
                    return 8;
                default:
                    return 1;
            }
        },
        [appointmentData?.review],
    );

    // Get user balance and existing appointment status on mount
    const fetchUserBalanceAndStatus = useCallback(async () => {
        try {
            const response = await apiCall(
                `/api/customer/booking-status/${portfolio.id}?appointment=${appointment_id || ''}`,
                {
                    method: 'GET',
                },
            );
            const data = await response.json();

            if (data.success) {
                setUserBalance(data.user_balance || 0);
                if (data.appointment) {
                    setAppointmentData(data.appointment);
                    setStep(getStepFromStatus(data.appointment.status));
                }
            }
        } catch (error) {
            console.error('Failed to fetch booking status:', error);
        }
    }, [portfolio.id, getStepFromStatus, appointment_id]);

    useEffect(() => {
        if (step !== 1 && step !== 7 && appointmentData) {
            setSelectedTime(appointmentData.appointment_time);
            setExtra(appointmentData.extra || '');
            const appointmentDate = new Date(appointmentData.appointment_date);
            if (!isNaN(appointmentDate.getTime())) {
                setSelectedDate(appointmentDate);
            }
            setEnableCreate(false);
        } else setEnableCreate(true);
    }, [
        step,
        setExtra,
        setEnableCreate,
        appointmentData,
        setSelectedTime,
        setSelectedDate,
    ]);

    useEffect(() => {
        if (duckModal && !showPaymentModal) setDuckModal(false);
    }, [showPaymentModal, duckModal]);

    useEffect(() => {
        if (portfolio.id && stylist.id && !isModalOpen) {
            fetchUserBalanceAndStatus();
        }
    }, [portfolio.id, stylist.id, fetchUserBalanceAndStatus, isModalOpen]);

    // Set up real-time event listening for appointment updates
    useEffect(() => {
        if (appointmentData && typeof window !== 'undefined') {
            const interval = setInterval(() => {
                fetchUserBalanceAndStatus();
            }, 30000);

            return () => clearInterval(interval);
        }
    }, [appointmentData, fetchUserBalanceAndStatus]);

    const handleBookingClick = () => {
        if (!stylist.stylist_profile.is_available) {
            toast.warning(
                'This stylist is currently unavailable. Please choose another stylist or try again later.',
            );
            return;
        }
        if (!selectedDate || !selectedDateDb || !selectedTime) {
            toast.warning('Please select both date and time before booking.');
            return;
        }
        if (!address || address.length < 12) {
            toast.warning(
                'Please provide a valid address with at least 12 characters.',
            );
            return;
        }

        // Check if user balance is sufficient
        if (userBalance >= portfolio.price) {
            // Sufficient balance, proceed directly
            processBooking('pending');
        } else {
            // Insufficient balance, show payment modal
            setShowPaymentModal(true);
        }
    };

    const processBooking = async (verdict: string) => {
        setIsLoading(true);
        try {
            const response = await apiCall('/api/customer/create-appointment', {
                method: 'POST',
                body: JSON.stringify({
                    portfolio_id: portfolio.id,
                    stylist_id: stylist.id,
                    amount: portfolio.price,
                    selected_date: selectedDateDb,
                    selected_time: selectedTime,
                    extra,
                    address,
                    type: verdict,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setAppointmentData(data.appointment);
                setStep(2); // Processing
                // Refresh user balance
                fetchUserBalanceAndStatus();
            } else {
                toast.error(data.message || 'Failed to create appointment');
            }
        } catch (error) {
            toast.error('Failed to process booking');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePaymentSuccess = () => {
        setDuckModal(false);
        processBooking('processing');
    };

    const handleUpdate = async (
        appointment_id: number,
        is_free: boolean,
        verdict: 'canceled' | 'rescheduled',
    ) => {
        setIsLoading(true);
        try {
            const response = await apiCall('/api/customer/update-appointment', {
                method: 'POST',
                body: JSON.stringify({
                    appointment_id,
                    is_free,
                    verdict,
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(`Appointment ${verdict} successfully`);
                fetchUserBalanceAndStatus();
            } else {
                toast.error(data.message || 'Payment failed');
            }
        } catch (error) {
            toast.error('Payment processing failed');
        } finally {
            setIsLoading(false);
        }
    };

    const onCancel = () => {
        if (step > 1 && step < 5 && appointmentData) {
            CustomToast({
                message: appointmentData?.canCancelFree
                    ? "Are you sure you want to cancel this appointment? This can't be undone."
                    : `It is less than ${appointmentData.hoursUntilAppointment} hours to your appointment, you will be charged extra ${appointmentData.cancelPenaltyPercentage ?? 0}% to cancel, proceed?`,
                action: 'Cancel Appointment',
                onConfirm: () => {
                    handleUpdate(
                        appointmentData.id,
                        appointmentData?.canCancelFree ? true : false,
                        'canceled',
                    );
                },
            });
        }
    };
    const onReschedule = () => {
        if (step > 1 && step < 5 && appointmentData) {
            CustomToast({
                message: appointmentData?.canRescheduleFree
                    ? "Are you sure you want to reschedule this appointment? This can't be undone."
                    : `It is less than ${appointmentData.hoursUntilAppointment} hours to your appointment, you will be charged extra ${appointmentData.reschedulePenaltyPercentage ?? 0}% to reschedule, proceed?`,
                action: 'Reschedule Appointment',
                onConfirm: () => {
                    handleUpdate(
                        appointmentData.id,
                        appointmentData?.canRescheduleFree ? true : false,
                        'rescheduled',
                    );
                },
            });
        }
    };
    const toTicket = () => {
        if (!appointmentData?.first_dispute) {
            toast.error('Error occured!');
            return;
        }
        if (appointmentData?.first_dispute?.status == 'open') {
            toast.info(
                'The details are being verified, you will be invited by support team soon',
            );
        } else if (appointmentData?.first_dispute?.status == 'in_progress') {
            router.visit(
                route('disputes.show', appointmentData?.first_dispute.id),
            );
        } else if (appointmentData?.first_dispute?.status == 'closed') {
            toast.info('Dispute Already Closed');
        } else if (appointmentData?.first_dispute?.status == 'resolved') {
            toast.info('Dispute Already Resolved');
        }
    };
    const onDispute = () => {
        setDisputeOpen(true);
    };

    return (
        <div className="space-y-2 rounded-2xl border border-sf-stroke bg-sf-white-card p-4 md:space-y-4 md:p-6">
            {/* Status Display */}
            <StatusDisplay step={step} />

            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-sf-black md:text-xl">
                    Booking Summary
                </h2>
            </div>

            {/* Divider */}
            <div className="border-t border-sf-secondary-paragraph"></div>

            {/* Booking Details */}
            <div className="space-y-2 md:mb-4 md:space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-sf-secondary-paragraph">
                        Service:
                    </span>
                    <span className="text-sm font-semibold text-sf-black">
                        {portfolio.title ||
                            stylist.stylist_profile.business_name}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-sf-secondary-paragraph">
                        Category:
                    </span>
                    <span className="text-sm font-semibold text-sf-black">
                        {portfolio.category.name}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-sf-secondary-paragraph">
                        Duration:
                    </span>
                    <span className="text-sm font-semibold text-sf-black">
                        {portfolio.duration}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-sf-secondary-paragraph">
                        Date:
                    </span>
                    <span className="text-sm font-semibold text-sf-black">
                        {(step > 1 && appointmentData?.appointment_date
                            ? new Date(
                                  appointmentData.appointment_date,
                              ).toLocaleDateString()
                            : null) ||
                            selectedDate ||
                            'Select a date'}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-sf-secondary-paragraph">
                        Time:
                    </span>
                    <span className="text-sm font-semibold text-sf-black">
                        {(step > 1 && appointmentData?.appointment_time) ||
                            selectedTime ||
                            'Select a time'}
                    </span>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-sf-secondary-paragraph"></div>

            {/* Total */}
            <div className="mb-1 flex items-center justify-between text-base font-bold md:mb-4">
                <span className="text-sf-black">Total</span>
                <GradientTextSpan text={`R${portfolio.price}`} />
            </div>

            <div className="space-y-2.5 md:space-y-4">
                {/* Step one */}
                {(step === 1 || step === 7) && (
                    <CustomButton
                        onClick={handleBookingClick}
                        disabled={
                            !selectedDate ||
                            !selectedTime ||
                            isLoading ||
                            !address
                        }
                    >
                        {isLoading ? 'Processing...' : 'Book Appointment'}
                    </CustomButton>
                )}

                {step === 2 && (
                    <CustomButton disabled={true} className="italic">
                        Processing Booking
                    </CustomButton>
                )}

                {step === 3 && (
                    <>
                        <CustomButton disabled={true} className="italic">
                            Pending Approval
                        </CustomButton>
                        {step > 1 && step < 5 && (
                            <>
                                <CustomButton onClick={onReschedule}>
                                    Reschedule Booking
                                </CustomButton>
                                <CustomButton
                                    variant="secondary"
                                    onClick={onCancel}
                                >
                                    Cancel Booking
                                </CustomButton>
                            </>
                        )}
                    </>
                )}

                {/* Step four */}
                {step < 4 && (
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
                )}

                {/* Step four */}
                {step === 4 && (
                    <JobCommencement
                        appointmentData={appointmentData}
                        stylist={stylist}
                        onReschedule={onReschedule}
                        onCancel={onCancel}
                    />
                )}

                {/* Step six */}
                {(step === 5 || step === 6) && appointmentData && (
                    <JobCompletion
                        securityCode={
                            appointmentData?.completion_code?.split('-')[1] ||
                            ''
                        }
                        appointmentId={appointmentData.id}
                        step={step}
                        name={name}
                        isModalOpen={isModalOpen}
                        setIsModalOpen={setIsModalOpen}
                    />
                )}

                {step === 8 && (
                    <CustomButton variant="secondary" onClick={toTicket}>
                        {appointmentData?.first_dispute?.status == 'open'
                            ? 'Verifying dispute details...'
                            : appointmentData?.first_dispute?.status ==
                                'in_progress'
                              ? 'Talk to someone to resolve'
                              : appointmentData?.first_dispute?.status ==
                                  'closed'
                                ? 'Dispute Already Closed'
                                : 'Dispute Already Resolved'}
                    </CustomButton>
                )}
            </div>

            {/* Payment Modal */}
            <PaymentModal
                isOpen={showPaymentModal}
                amount={portfolio.price}
                userBalance={userBalance}
                portfolioId={portfolio.id}
                onPaymentSuccess={handlePaymentSuccess}
                onClose={() => {
                    setDuckModal(true);
                    setTimeout(() => setShowPaymentModal(false), 10000);
                }}
                duckModal={duckModal}
            />
            {appointmentData && (
                <DisputeModal
                    disputeOpen={disputeOpen}
                    setDisputeOpen={setDisputeOpen}
                    appointmentId={appointmentData.id}
                    stylist={stylist.name}
                />
            )}

            {/* Terms */}
            <p className="mt-6 text-center text-sm leading-relaxed text-sf-secondary-paragraph">
                By booking, you agree to our terms and cancellation policy.
            </p>
            {step > 1 && step < 7 && (
                <div className="flex items-center justify-center space-x-1 font-inter">
                    <button
                        onClick={onDispute}
                        className="text-sm font-medium text-sf-primary no-underline transition-colors duration-200 hover:text-sf-primary-hover hover:underline"
                    >
                        Report dispute with this Appointment
                    </button>
                </div>
            )}
        </div>
    );
};

export default BookingSummary;
