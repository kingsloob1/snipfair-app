import React from 'react';

interface PaymentMethodCardProps {
    cardNumber?: string;
    expiryDate?: string;
    amount?: string;
    billingAddress?: {
        street: string;
        area: string;
        state: string;
        country: string;
    };
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
    cardNumber = '9049',
    expiryDate = '06/2027',
    amount = 'R120',
    billingAddress = {
        street: 'No 7 school road unguwan boro sabo, Before Ugwan Boro',
        area: 'Secondary school unguwan boro, Kaduna South',
        state: 'Kaduna',
        country: 'Nigeria',
    },
}) => {
    return (
        <div className="max-w-2xl rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            {/* Header */}
            <div className="mb-8 flex items-start justify-between">
                <h2 className="text-3xl font-bold text-gray-900">
                    Payment method
                </h2>
                <div className="text-4xl font-bold text-gray-900">{amount}</div>
            </div>

            {/* Card Information */}
            <div className="mb-8 flex items-center gap-4">
                {/* Mastercard Logo */}
                <div className="flex">
                    <div className="h-8 w-8 rounded-full bg-red-500"></div>
                    <div className="-ml-3 h-8 w-8 rounded-full bg-orange-400"></div>
                </div>

                {/* Card Details */}
                <div className="flex flex-col">
                    <span className="text-2xl font-semibold text-gray-700">
                        {cardNumber}
                    </span>
                    <span className="text-lg text-gray-500">
                        Expiry {expiryDate}
                    </span>
                </div>
            </div>

            {/* Billing Address */}
            <div>
                <h3 className="mb-4 text-2xl font-bold text-gray-900">
                    Billing Address:
                </h3>
                <div className="text-lg leading-relaxed text-gray-600">
                    <p>{billingAddress.street}</p>
                    <p>
                        {billingAddress.area}, {billingAddress.state},{' '}
                        {billingAddress.country}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentMethodCard;
