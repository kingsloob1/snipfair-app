import { Calendar, Check, CreditCard, User, X } from 'lucide-react';
import React from 'react';

interface SubscriptionTransactionDetailsProps {
    isOpen?: boolean;
    onClose?: () => void;
    onProcessRefund?: () => void;
    customerName?: string;
    date?: string;
    amount?: string;
    billingCircle?: string;
    status?: 'Confirmed' | 'Pending' | 'Failed';
    billingDate?: string;
    nextBilling?: string;
    paymentMethod?: string;
    transactionId?: string;
}

const SubscriptionTransactionDetails: React.FC<
    SubscriptionTransactionDetailsProps
> = ({
    isOpen = true,
    onClose = () => {},
    onProcessRefund = () => {},
    customerName = 'Sarah Johnson',
    date = '2025-08-15',
    amount = 'R29.99',
    billingCircle = 'Monthly',
    status = 'Confirmed',
    billingDate = '2026-03-15',
    nextBilling = '2026-04-15',
    paymentMethod = 'Credit Card',
    transactionId = 'PREM-00',
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="mx-4 w-full max-w-md rounded-lg bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Subscription Transaction Details - {transactionId}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 transition-colors hover:text-gray-600"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Customer and Date Section */}
                <div className="border-b border-gray-100 p-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex items-center gap-3">
                            <User size={20} className="text-gray-500" />
                            <div>
                                <p className="mb-1 text-sm text-gray-600">
                                    Customer
                                </p>
                                <p className="font-medium text-gray-900">
                                    {customerName}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar size={20} className="text-gray-500" />
                            <div>
                                <p className="mb-1 text-sm text-gray-600">
                                    Date
                                </p>
                                <p className="font-medium text-gray-900">
                                    {date}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transaction Details Section */}
                <div className="space-y-4 p-6">
                    <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">
                            Amount
                        </span>
                        <span className="text-xl font-semibold text-gray-900">
                            {amount}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Billing Circle</span>
                        <span className="text-gray-900">{billingCircle}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Status</span>
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-green-600">
                                {status}
                            </span>
                            <Check size={16} className="text-green-600" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Billing Date</span>
                        <span className="text-gray-900">{billingDate}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Next Billing</span>
                        <span className="text-gray-900">{nextBilling}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Payment Method</span>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-900">
                                {paymentMethod}
                            </span>
                            <CreditCard size={16} className="text-gray-600" />
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 p-6 pt-4">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-lg bg-gray-100 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200"
                    >
                        Close
                    </button>
                    <button
                        onClick={onProcessRefund}
                        className="flex-1 rounded-lg bg-gray-900 px-4 py-3 font-medium text-white transition-colors hover:bg-gray-800"
                    >
                        Process Refund
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionTransactionDetails;
