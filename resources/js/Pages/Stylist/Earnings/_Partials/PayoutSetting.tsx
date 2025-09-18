import CustomButton from '@/Components/common/CustomButton';
import { CreditCard, Edit3, Settings } from 'lucide-react';
import React, { useState } from 'react';

interface PayoutSettingsProps {
    onEditBankAccount?: () => void;
    onChangeSettings?: () => void;
    onPayoutFrequencyChange?: (frequency: string) => void;
    payment_method: {
        bank: string;
        account: string;
        routing: string;
    };
    settings: {
        automatic_payout: boolean;
        payout_frequency: string;
    };
}

const PayoutSettings: React.FC<PayoutSettingsProps> = ({
    onEditBankAccount,
    onChangeSettings,
    onPayoutFrequencyChange,
    payment_method,
    settings,
}) => {
    const [payoutFrequency, setPayoutFrequency] = useState<string>(
        settings.payout_frequency,
    );

    const handleFrequencyChange = (frequency: string) => {
        setPayoutFrequency(frequency);
        onPayoutFrequencyChange?.(frequency);
    };

    return (
        <div className="mb-6 rounded-xl border border-sf-stroke bg-sf-white p-4 shadow-sm md:p-6">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between border-b border-sf-stroke py-4">
                <h3 className="text-lg font-semibold text-sf-black md:text-xl xl:text-2xl">
                    Payout Settings
                </h3>
                <CustomButton
                    variant="secondary"
                    onClick={onChangeSettings}
                    fullWidth={false}
                >
                    <div className="flex gap-2">
                        <Settings className="h-4 w-4" />
                        <span className="text-sm font-medium">
                            Change Setting
                        </span>
                    </div>
                </CustomButton>
            </div>

            {/* Main Content */}
            <div className="flex flex-col-reverse items-center justify-between gap-4 md:flex-row">
                {payment_method ? (
                    <div className="flex items-center gap-1">
                        <div className="flex items-center justify-center rounded-md bg-sf-white p-2.5">
                            <CreditCard
                                size={40}
                                strokeWidth={1}
                                className="text-sf-gradient-pink"
                            />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="mb-1 text-lg font-medium text-gray-900">
                                {payment_method.bank}
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>Routing:</span>
                                <span className="font-mono">
                                    {payment_method.routing}
                                </span>
                                <span>-</span>
                                <span>Account:</span>
                                <span className="font-mono">
                                    {payment_method.account}
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="italic text-sf-primary-paragraph">
                        No payout method created yet
                    </p>
                )}

                {/* Automatic Payout Section */}
                <div className="flex flex-col items-center gap-2 md:items-end">
                    <span className="text-sm font-medium text-gray-600">
                        {settings.automatic_payout
                            ? 'Automatic Payout'
                            : 'Manual Request'}
                    </span>

                    {/* Frequency Selector */}
                    <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
                        {['Daily', 'Bi-weekly', 'Weekly', 'Monthly'].map(
                            (frequency) => (
                                <button
                                    key={frequency}
                                    onClick={() =>
                                        handleFrequencyChange(
                                            frequency.toLowerCase(),
                                        )
                                    }
                                    className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                                        payoutFrequency ===
                                        frequency.toLowerCase()
                                            ? 'bg-green-100 text-green-700'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                                    }`}
                                >
                                    {frequency}
                                </button>
                            ),
                        )}
                    </div>
                </div>
            </div>
            <div className="mt-4">
                <button
                    onClick={onEditBankAccount}
                    className="ml-4 flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800"
                >
                    <Edit3 className="h-4 w-4" />
                    <span className="text-sm font-medium">
                        Edit Bank Account
                    </span>
                </button>
            </div>
        </div>
    );
};

export default PayoutSettings;
