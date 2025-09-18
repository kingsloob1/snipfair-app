import Modal from '@/Components/Modal';
import CustomButton from '@/Components/common/CustomButton';
import { CustomToast } from '@/Components/common/CustomToast';
import GoogleMap from '@/Components/contact/_partial/GoogleMap';
import { Chat } from '@/Components/icon/Icons';
import { apiCall } from '@/hooks/api';
import { appointmentPercentage } from '@/lib/helper';
import { router } from '@inertiajs/react';
import { MapPin } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import AppointmentModal from './AppointmentModal';
import UploadModal from './UploadModal';

interface AppointmentData {
    id: number;
    status: string;
    appointment_code: string;
    completion_code?: string;
    amount: number;
    proof?: boolean;
    service_notes?: string;
    first_dispute?: {
        id: number;
        status: string;
    };
}

const StatusDisplay = ({ step }: { step: number }) => {
    const getStatusInfo = () => {
        switch (step) {
            case 2:
                return {
                    color: 'bg-blue-100 text-blue-800',
                    text: 'Appointment Approved',
                };
            case 3:
                return {
                    color: 'bg-green-100 text-green-600',
                    text: 'Appointment Confirmed',
                };
            case 4:
                return {
                    color: 'bg-purple-100 text-purple-800',
                    text: 'Appointment Completed',
                };
            case 5:
                return {
                    color: 'bg-purple-100 text-purple-800',
                    text: 'Appointment Completed',
                };
            case 6:
                return {
                    color: 'bg-red-100 text-red-800',
                    text: 'Appointment Canceled',
                };
            case 7:
                return {
                    color: 'bg-indigo-100 text-indigo-800',
                    text: 'Service Rescheduled',
                };
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
        <div className="mb-4 rounded-lg p-3">
            <div
                className={`rounded-lg px-3 py-2 text-center ${statusInfo.color}`}
            >
                <p className="font-medium">{statusInfo.text}</p>
            </div>
        </div>
    );
};

interface AppointmentActionsProps {
    location_service?: {
        latitude?: number;
        longitude?: number;
    };
    address?: string;
    customer: string;
    customerId: number;
    customerUseLocation: boolean;
    total_appointments: number;
    total_no_show_rate: number;
    total_cancellations: number;
    appointmentId: number;
    appointment: AppointmentData | null;
    setAppointment: React.Dispatch<
        React.SetStateAction<AppointmentData | null>
    >;
}

const AppointmentActions: React.FC<AppointmentActionsProps> = ({
    location_service,
    address,
    customer,
    customerId,
    customerUseLocation,
    total_appointments,
    total_no_show_rate,
    total_cancellations,
    appointmentId,
    appointment,
    setAppointment,
}) => {
    const [step, setStep] = useState(1);
    const [isOpen, setIsOpen] = useState(false);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [variant, setVariant] = useState('');
    const [showMap, setShowMap] = useState(false);
    const [loading, setIsLoading] = useState<boolean>(false);

    const getStepFromStatus = useCallback((status: string, proof?: boolean) => {
        switch (status) {
            case 'approved':
                return 2;
            case 'confirmed':
                return 3;
            case 'completed':
                return proof ? 5 : 4;
            case 'canceled':
                return 6;
            case 'rescheduled':
                return 7;
            case 'escalated':
                return 8;
            default:
                return 1;
        }
    }, []);

    const fetchStatus = useCallback(async () => {
        try {
            const response = await apiCall(
                `/api/stylist/appointment-status/${appointmentId}`,
                {
                    method: 'GET',
                },
            );
            const data = await response.json();

            if (data.success) {
                if (data.appointment) {
                    setAppointment(data.appointment);
                    setStep(
                        getStepFromStatus(
                            data.appointment.status,
                            data.appointment.proof ? true : false,
                        ),
                    );
                    if (
                        data.appointment.status === 'completed' &&
                        !data.appointment.proof
                    ) {
                        setVariant('proof');
                        setUploadOpen(true);
                    }
                }
            }
        } catch (error) {
            toast.error('Failed to fetch booking status:');
            console.error(error);
        }
    }, [appointmentId, getStepFromStatus, setAppointment]);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    useEffect(() => {
        if (step >= 2 && step <= 5) {
            const interval = setInterval(() => {
                fetchStatus();
            }, 300000);

            return () => clearInterval(interval);
        }
    }, [step, fetchStatus]);

    useEffect(() => {
        if (!isOpen && !uploadOpen) {
            fetchStatus();
        }
    }, [fetchStatus, isOpen, uploadOpen]);

    const onConfirm = (step: number) => {
        // Handle confirmation logic based on the step
        if (step < 4) {
            switch (step) {
                case 1:
                    updateStatus('approved');
                    break;
                case 2:
                    setVariant('start');
                    setIsOpen(true);
                    // updateStatus('confirmed');
                    break;
                case 3:
                    setVariant('finish');
                    setIsOpen(true);
                    break;
                default:
                    break;
            }
        } else if (step === 4) {
            // uploadProof();
            setVariant('proof');
            setUploadOpen(true);
        }
    };

    const onCancel = (step: number) => {
        if (step < 3) {
            CustomToast({
                message: "Are you sure? This can't be reversed",
                action: 'Reject Appointment',
                onConfirm: () => {
                    updateStatus('canceled');
                },
            });
        } else {
            // updateStatus('escalated');
            setVariant('dispute');
            setUploadOpen(true);
        }
    };

    const updateStatus = async (verdict: string) => {
        setIsLoading(true);
        try {
            const response = await apiCall('/api/stylist/update-appointment', {
                method: 'POST',
                body: JSON.stringify({
                    appointment_id: appointmentId,
                    verdict: verdict,
                }),
            });
            const data = await response.json();
            if (data.success) {
                toast.success(`Appointment ${verdict} successfully`);
                setAppointment(data.appointment);
                setStep(getStepFromStatus(data.appointment.status));
            } else {
                toast.error(data.message || 'Failed to create appointment');
            }
        } catch (error) {
            toast.error('Failed to process booking');
        } finally {
            setIsLoading(false);
        }
    };

    const onFollowLocation = () => {
        if (
            !location_service ||
            !location_service.latitude ||
            !location_service.longitude ||
            !address
        ) {
            toast.error('Location not available');
            return;
        }

        setShowMap(true);
    };

    const toTicket = () => {
        if (!appointment?.first_dispute) {
            toast.error('Error occured!');
            return;
        }
        if (appointment?.first_dispute?.status == 'open') {
            toast.info(
                'The details are being verified, you will be invited by support team soon',
            );
        } else if (appointment?.first_dispute?.status == 'in_progress') {
            router.visit(route('disputes.show', appointment?.first_dispute.id));
        } else if (appointment?.first_dispute?.status == 'closed') {
            toast.info('Dispute Already Closed');
        } else if (appointment?.first_dispute?.status == 'resolved') {
            toast.info('Dispute Already Resolved');
        }
    };
    return (
        <>
            <div className="mb-6 rounded-xl border border-sf-stroke bg-sf-white p-4 shadow-sm md:p-6">
                <StatusDisplay step={step} />
                <h2 className="mb-5 text-lg font-bold text-sf-black md:text-xl xl:text-2xl">
                    Appointment Actions
                </h2>

                <div className="space-y-3">
                    <CustomButton
                        className="py-2"
                        disabled={step > 4}
                        loading={loading}
                        onClick={() => onConfirm(step)}
                    >
                        {step === 1 || step > 5
                            ? 'Approve Appointment'
                            : step === 2
                              ? 'Confirm Arrival'
                              : step === 3
                                ? 'Complete Appointment'
                                : step === 4
                                  ? 'Upload Proof'
                                  : 'Proof Uploaded'}
                    </CustomButton>
                    <CustomButton
                        className="border border-sf-orange-53 bg-sf-orange-53/5 py-2 text-danger-normal"
                        variant="secondary"
                        loading={loading}
                        disabled={step === 8 || step === 5}
                        onClick={() => onCancel(step)}
                    >
                        {step < 3 ? 'Reject Appointment' : 'Report Dispute'}
                    </CustomButton>
                    {step === 8 && (
                        <CustomButton variant="secondary" onClick={toTicket}>
                            {appointment?.first_dispute?.status == 'open'
                                ? 'Verifying dispute details...'
                                : appointment?.first_dispute?.status ==
                                    'in_progress'
                                  ? 'Talk to someone to resolve'
                                  : appointment?.first_dispute?.status ==
                                      'closed'
                                    ? 'Dispute Already Closed'
                                    : 'Dispute Already Resolved'}
                        </CustomButton>
                    )}
                </div>
            </div>

            {/* Quick Actions Section */}
            <div className="mb-6 rounded-xl border border-sf-stroke bg-sf-white p-4 shadow-sm md:p-6">
                <h2 className="mb-5 text-lg font-bold text-sf-black md:text-xl xl:text-2xl">
                    Quick Actions
                </h2>

                <div className="space-y-3">
                    <CustomButton
                        variant="secondary"
                        onClick={() =>
                            router.post(
                                route('chat.start', {
                                    recipient_id: customerId,
                                }),
                            )
                        }
                    >
                        <div className="flex items-center gap-2">
                            <Chat className="h-5 w-5" />
                            Send a Message
                        </div>
                    </CustomButton>
                    {/* <CustomButton variant="secondary" onClick={onCallToBook}>
                        <div className="flex items-center gap-2">
                            <Phone className="h-5 w-5" />
                            Call to Book Now
                        </div>
                    </CustomButton> */}
                    {(step === 1 || step === 2 || step === 3) && (
                        <CustomButton
                            variant="secondary"
                            onClick={onFollowLocation}
                        >
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Follow Location
                            </div>
                        </CustomButton>
                    )}
                </div>
            </div>

            {/* Client History Section */}
            <div className="mb-6 rounded-xl border border-sf-stroke bg-sf-white p-4 shadow-sm md:p-6">
                <h2 className="mb-5 text-lg font-bold text-sf-black md:text-xl xl:text-2xl">
                    Client History
                </h2>

                <div className="space-y-6">
                    <div className="text-center">
                        <div className="mb-1 font-inter text-2xl font-bold text-sf-gradient-purple">
                            {total_appointments}
                        </div>
                        <div className="font-medium text-sf-gray-zinc">
                            Total Appointments
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="mb-1 font-inter text-2xl font-bold text-sf-gradient-purple">
                            {appointmentPercentage(
                                Math.max(
                                    total_no_show_rate,
                                    total_cancellations,
                                ),
                                total_appointments,
                            )}
                        </div>
                        <div className="font-medium text-sf-gray-zinc">
                            No-Show Rate
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="mb-1 font-inter text-2xl font-bold text-sf-gradient-purple">
                            {total_cancellations}
                        </div>
                        <div className="font-medium text-sf-gray-zinc">
                            Total Cancellations
                        </div>
                    </div>
                </div>
            </div>
            <AppointmentModal
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                customer={customer}
                variant={variant as 'start' | 'finish' | 'success'}
                setVariant={setVariant}
                appointmentId={appointmentId}
            />
            <UploadModal
                uploadOpen={uploadOpen}
                setUploadOpen={setUploadOpen}
                appointmentId={appointmentId}
                variant={variant as 'dispute' | 'proof'}
                customer={customer}
            />
            <Modal
                show={showMap}
                onClose={() => setShowMap(false)}
                closeable={true}
                className="h-96"
            >
                <GoogleMap
                    lat={location_service?.latitude ?? 0}
                    lng={location_service?.longitude ?? 0}
                    address_one={address || ''}
                    address_two={appointment?.service_notes || ''}
                    use_location={customerUseLocation}
                />
                <p className="absolute bottom-0 w-full bg-sf-white/90 p-0.5 text-center text-sm">
                    {appointment?.service_notes}
                </p>
            </Modal>
        </>
    );
};

export default AppointmentActions;
