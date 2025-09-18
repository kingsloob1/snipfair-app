import CustomButton from '@/Components/common/CustomButton';
import { PaymentMethod } from '@/types/custom_types';
import { CreditCard, Edit, Plus, Trash2 } from 'lucide-react';

interface PaymentMethodProps {
    handleAddNew: () => void;
    handleSelect: (id: number) => void;
    handleEdit: (id: number) => void;
    handleDelete: (id: number) => void;
    handleSetDefault: (id: number) => void;
    paymentMethods: PaymentMethod[];
}

const PaymentMethods = ({
    handleAddNew,
    paymentMethods,
    handleSelect,
    handleEdit,
    handleDelete,
    handleSetDefault,
}: PaymentMethodProps) => {
    return (
        <div className="mb-6 rounded-xl border border-sf-stroke bg-sf-white p-4 shadow-sm md:p-6">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-xl font-bold text-sf-black md:text-2xl">
                    Your Payment Methods
                </h1>
                <CustomButton onClick={handleAddNew} fullWidth={false}>
                    <div className="flex gap-2">
                        <Plus size={20} />
                        Add New <span className="hidden sm:block">Account</span>
                    </div>
                </CustomButton>
            </div>

            {/* Payment Methods List */}
            <div className="space-y-4">
                {paymentMethods.map((method) => (
                    <div
                        key={method.id}
                        className="rounded-xl border border-gray-200 bg-white p-6 transition-shadow duration-200 hover:shadow-md"
                    >
                        <div className="flex items-center justify-between">
                            {/* Left side - Checkbox, Icon, and Details */}
                            <div className="flex items-center gap-4">
                                {/* Checkbox */}
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={method.is_active}
                                        onChange={() => handleSelect(method.id)}
                                        className="sr-only"
                                    />
                                    <div
                                        onClick={() => handleSelect(method.id)}
                                        className={`flex h-6 w-6 cursor-pointer items-center justify-center rounded border-2 transition-colors duration-200 ${
                                            method.is_active
                                                ? 'border-purple-600 bg-purple-600'
                                                : 'border-gray-300 hover:border-purple-400'
                                        }`}
                                    >
                                        {method.is_active && (
                                            <svg
                                                className="h-4 w-4 text-white"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                </div>

                                {/* Card Icon */}
                                <div className="hidden rounded-lg bg-purple-100 p-3 md:block">
                                    <CreditCard className="h-6 w-6 text-purple-600" />
                                </div>

                                {/* Bank Details */}
                                <div>
                                    <h3 className="mb-1 text-lg font-semibold text-gray-900">
                                        {method.bank}
                                    </h3>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <div>Acct No: {method.account}</div>
                                        <div>Routing: {method.routing}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Right side - Actions */}
                            <div className="flex flex-col items-center gap-3 md:flex-row">
                                {/* Set as Default Button */}
                                {!method.is_default && (
                                    <button
                                        onClick={() =>
                                            handleSetDefault(method.id)
                                        }
                                        className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-200"
                                    >
                                        Set as Default
                                    </button>
                                )}

                                {Boolean(method.is_default) && (
                                    <span className="rounded-lg bg-purple-100 px-4 py-2 text-sm font-medium text-purple-700">
                                        Default
                                    </span>
                                )}

                                <div className="flex items-center gap-3">
                                    {/* Edit Button */}
                                    <button
                                        onClick={() => handleEdit(method.id)}
                                        className="p-2 text-gray-400 transition-colors duration-200 hover:text-gray-600"
                                        title="Edit payment method"
                                    >
                                        <Edit size={18} />
                                    </button>

                                    {/* Delete Button */}
                                    <button
                                        onClick={() => handleDelete(method.id)}
                                        className="p-2 text-red-400 transition-colors duration-200 hover:text-red-600"
                                        title="Delete payment method"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {paymentMethods.length === 0 && (
                <div className="py-12 text-center">
                    <CreditCard className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                    <h3 className="mb-2 text-lg font-medium text-gray-900">
                        No payment methods
                    </h3>
                    <p className="mb-6 text-gray-500">
                        Add your first payment method to get started.
                    </p>
                    <button
                        onClick={handleAddNew}
                        className="mx-auto flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-medium text-white transition-all duration-200 hover:from-purple-700 hover:to-pink-700"
                    >
                        <Plus size={20} />
                        Add New Card
                    </button>
                </div>
            )}
        </div>
    );
};

export default PaymentMethods;
