import CommonAvatar from '@/Components/common/forms/CommonAvatar';
import { router } from '@inertiajs/react';
import { Check, X } from 'lucide-react';
import React, { useState } from 'react';

interface PayoutRequest {
    id: number;
    user_name: string;
    amount: number;
    payment_method: string;
    submitted_date: string;
    status: 'pending' | 'processing' | 'approved' | 'declined';
    profile_image: string;
    account_name?: string;
    bank_name?: string;
    account_number?: string;
}

interface PayoutRequestModalProps {
    request: PayoutRequest;
    onClose: () => void;
}

const PayoutRequestModal: React.FC<PayoutRequestModalProps> = ({
    request,
    onClose,
}) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleApprove = async () => {
        setIsProcessing(true);
        try {
            router.post(
                route('admin.payouts.approve', request.id),
                {},
                {
                    onSuccess: () => {
                        onClose();
                    },
                    onError: (errors) => {
                        console.error('Error approving payout:', errors);
                    },
                    onFinish: () => {
                        setIsProcessing(false);
                    },
                },
            );
        } catch (error) {
            console.error('Error approving payout:', error);
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        setIsProcessing(true);
        try {
            router.post(
                route('admin.payouts.reject', request.id),
                {},
                {
                    onSuccess: () => {
                        onClose();
                    },
                    onError: (errors) => {
                        console.error('Error rejecting payout:', errors);
                    },
                    onFinish: () => {
                        setIsProcessing(false);
                    },
                },
            );
        } catch (error) {
            console.error('Error rejecting payout:', error);
            setIsProcessing(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'text-yellow-600 bg-yellow-100';
            case 'processing':
                return 'text-blue-600 bg-blue-100';
            case 'approved':
                return 'text-green-600 bg-green-100';
            case 'declined':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
                <div className="p-6">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Payout Request Details
                        </h2>
                        <button
                            onClick={onClose}
                            className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Request Info */}
                    <div className="mb-6 rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center space-x-4">
                            <CommonAvatar
                                name={request.user_name}
                                image={`/storage/${request.profile_image}`}
                            />
                            <div className="flex-1">
                                <h3 className="text-lg font-medium text-gray-900">
                                    {request.user_name}
                                </h3>
                                <div className="flex items-center space-x-2">
                                    <span
                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(request.status)}`}
                                    >
                                        {request.status
                                            .charAt(0)
                                            .toUpperCase() +
                                            request.status.slice(1)}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(request.amount)}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Requested Amount
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Information */}
                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-gray-200 p-4">
                            <h4 className="mb-3 font-medium text-gray-900">
                                Payment Details
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Method:
                                    </span>
                                    <span className="font-medium">
                                        {request.payment_method}
                                    </span>
                                </div>
                                {request.bank_name && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Bank:
                                        </span>
                                        <span className="font-medium">
                                            {request.bank_name}
                                        </span>
                                    </div>
                                )}
                                {request.account_name && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Account Name:
                                        </span>
                                        <span className="font-medium">
                                            {request.account_name}
                                        </span>
                                    </div>
                                )}
                                {request.account_number && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Account:
                                        </span>
                                        <span className="font-medium">
                                            ****
                                            {request.account_number.slice(-4)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 p-4">
                            <h4 className="mb-3 font-medium text-gray-900">
                                Request Information
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Request ID:
                                    </span>
                                    <span className="font-medium">
                                        #{request.id}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Submitted:
                                    </span>
                                    <span className="font-medium">
                                        {formatDate(request.submitted_date)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Status:
                                    </span>
                                    <span
                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(request.status)}`}
                                    >
                                        {request.status
                                            .charAt(0)
                                            .toUpperCase() +
                                            request.status.slice(1)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    {request.status === 'pending' && (
                        <div className="flex space-x-4">
                            <button
                                onClick={handleReject}
                                disabled={isProcessing}
                                className="flex flex-1 items-center justify-center rounded-md border border-red-300 bg-white px-4 py-2 font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                            >
                                <X className="mr-2 h-4 w-4" />
                                {isProcessing
                                    ? 'Processing...'
                                    : 'Reject Request'}
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={isProcessing}
                                className="flex flex-1 items-center justify-center rounded-md bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
                            >
                                <Check className="mr-2 h-4 w-4" />
                                {isProcessing
                                    ? 'Processing...'
                                    : 'Approve Request'}
                            </button>
                        </div>
                    )}

                    {request.status !== 'pending' && (
                        <div className="rounded-lg bg-gray-50 p-4 text-center">
                            <p className="text-sm text-gray-600">
                                This request has already been {request.status}.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PayoutRequestModal;
