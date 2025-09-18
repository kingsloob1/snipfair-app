import CommonAvatar from '@/Components/common/forms/CommonAvatar';
import { Calendar } from 'lucide-react';
import React, { useState } from 'react';
import DepositRequestModal from './DepositRequestModal';

interface DepositRequest {
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

interface DepositRequestsProps {
    requests: DepositRequest[];
}

const DepositRequests: React.FC<DepositRequestsProps> = ({ requests }) => {
    const [selectedRequest, setSelectedRequest] =
        useState<DepositRequest | null>(null);
    const [showModal, setShowModal] = useState(false);

    const handleViewDetails = (request: DepositRequest) => {
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
        <div className="rounded-lg bg-white shadow">
            {/* Header */}
            <div className="border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Deposit Transactions
                    </h2>
                    <div className="text-sm text-gray-500">
                        {requests.length} total deposits
                    </div>
                </div>
            </div>

            {/* Request Cards */}
            <div className="space-y-4 p-6">
                {requests.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
                        <p className="text-gray-500">
                            No deposit transactions found.
                        </p>
                    </div>
                ) : (
                    requests.map((request) => (
                        <div
                            key={request.id}
                            className="rounded-lg border border-gray-200 bg-gray-50 p-6 hover:bg-gray-100"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <CommonAvatar
                                        name={request.user_name}
                                        image={`/storage/${request.profile_image}`}
                                    />
                                    <div>
                                        <h3 className="font-medium text-gray-900">
                                            {request.user_name}
                                        </h3>
                                        <p className="text-gray-600">
                                            {formatAmount(
                                                Number(request.amount),
                                            )}{' '}
                                            via {request.payment_method}
                                        </p>
                                        <div className="mt-1 flex items-center text-sm text-gray-500">
                                            <Calendar className="mr-1 h-3 w-3" />
                                            Submitted:{' '}
                                            {formatDate(request.submitted_date)}
                                        </div>
                                    </div>
                                </div>
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
                <DepositRequestModal
                    request={selectedRequest}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default DepositRequests;
