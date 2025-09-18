import { Calendar, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import PayoutRequestModal from './PayoutRequestModal';

interface PayoutRequest {
    id: number;
    stylist_name: string;
    amount: number;
    payment_method: string;
    submitted_date: string;
    status: 'pending' | 'processing' | 'approved' | 'declined';
    profile_image: string;
    account_name?: string;
    bank_name?: string;
    account_number?: string;
}

interface PayoutRequestsProps {
    requests: PayoutRequest[];
}

const PayoutRequests: React.FC<PayoutRequestsProps> = ({ requests }) => {
    const [selectedRequest, setSelectedRequest] =
        useState<PayoutRequest | null>(null);
    const [showModal, setShowModal] = useState(false);

    const handleViewDetails = (request: PayoutRequest) => {
        setSelectedRequest(request);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedRequest(null);
    };

    const formatAmount = (amount: number) => {
        return `R${amount.toFixed(2)}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'declined':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="mx-auto max-w-6xl bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Stylist Payout Requests
                </h1>
                <button className="flex items-center font-medium text-blue-600 hover:text-blue-700">
                    View all Requests
                    <ChevronRight className="ml-1 h-4 w-4" />
                </button>
            </div>

            {/* Request Cards */}
            <div className="space-y-4">
                {requests.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
                        <p className="text-gray-500">
                            No payout requests found.
                        </p>
                    </div>
                ) : (
                    requests.map((request) => (
                        <div
                            key={request.id}
                            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                        >
                            <div className="flex items-center justify-between">
                                {/* Left side - Profile and details */}
                                <div className="flex items-center space-x-4">
                                    <img
                                        src={request.profile_image}
                                        alt={request.stylist_name}
                                        className="h-12 w-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <h3 className="font-medium text-gray-900">
                                            {request.stylist_name}
                                        </h3>
                                        <p className="text-gray-600">
                                            {formatAmount(request.amount)} via{' '}
                                            {request.payment_method}
                                        </p>
                                        <div className="mt-1 flex items-center text-sm text-gray-500">
                                            <Calendar className="mr-1 h-3 w-3" />
                                            Submitted:{' '}
                                            {formatDate(request.submitted_date)}
                                        </div>
                                    </div>
                                </div>

                                {/* Right side - Status and Actions */}
                                <div className="flex items-center space-x-3">
                                    <span
                                        className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(request.status)}`}
                                    >
                                        {request.status
                                            .charAt(0)
                                            .toUpperCase() +
                                            request.status.slice(1)}
                                    </span>
                                    <button
                                        onClick={() =>
                                            handleViewDetails(request)
                                        }
                                        className="rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && selectedRequest && (
                <PayoutRequestModal
                    request={selectedRequest}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default PayoutRequests;
