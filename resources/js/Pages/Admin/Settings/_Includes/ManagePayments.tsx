import CustomButton from '@/Components/common/CustomButton';
import { router, useForm } from '@inertiajs/react';
import { CreditCard, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ToggleSwitch from './ToggleSwitch';

interface PaymentMethod {
    id: number;
    updated_by?: number | null;
    account_number: string;
    account_name: string;
    bank_name: string;
    routing_number: string;
    is_default: boolean;
    is_active: boolean;
}

type PaymentFormProps = {
    account_number: string;
    account_name: string;
    bank_name: string;
    routing_number: string;
    is_default: boolean;
    is_active: boolean;
};

interface PaymentMethodProps {
    payment_methods: PaymentMethod[];
}

const ManagePayments = ({ payment_methods }: PaymentMethodProps) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] =
        useState<PaymentMethod | null>(null);

    const {
        data: addData,
        setData: setAddData,
        post,
        processing: addProcessing,
        reset: resetAdd,
    } = useForm<PaymentFormProps>({
        account_number: '',
        account_name: '',
        bank_name: '',
        routing_number: '',
        is_default: false,
        is_active: true,
    });

    const {
        data: editData,
        setData: setEditData,
        put,
        processing: editProcessing,
        reset: resetEdit,
    } = useForm<PaymentFormProps>({
        account_number: '',
        account_name: '',
        bank_name: '',
        routing_number: '',
        is_default: false,
        is_active: true,
    });

    const { delete: destroy, processing: deleteProcessing } = useForm();

    const handleToggleActive = (paymentMethodId: number, value: boolean) => {
        router.put(
            route('admin.payment-methods.toggle-active', paymentMethodId),
            {
                is_active: value,
            },
        );
    };

    const handleToggleDefault = (paymentMethodId: number, value: boolean) => {
        router.put(
            route('admin.payment-methods.toggle-default', paymentMethodId),
            {
                is_default: value,
            },
        );
    };

    const handleAdd = () => {
        post(route('admin.payment-methods.store'), {
            onSuccess: () => {
                setShowAddModal(false);
                resetAdd();
            },
        });
    };

    const handleEdit = () => {
        if (selectedPaymentMethod) {
            put(
                route('admin.payment-methods.update', selectedPaymentMethod.id),
                {
                    onSuccess: () => {
                        setShowEditModal(false);
                        resetEdit();
                        setSelectedPaymentMethod(null);
                    },
                },
            );
        }
    };

    const handleDelete = () => {
        if (selectedPaymentMethod) {
            destroy(
                route(
                    'admin.payment-methods.destroy',
                    selectedPaymentMethod.id,
                ),
                {
                    onSuccess: () => {
                        setShowDeleteModal(false);
                        setSelectedPaymentMethod(null);
                    },
                },
            );
        }
    };

    const openEditModal = (paymentMethod: PaymentMethod) => {
        setSelectedPaymentMethod(paymentMethod);
        setEditData({
            account_number: paymentMethod.account_number,
            account_name: paymentMethod.account_name,
            bank_name: paymentMethod.bank_name,
            routing_number: paymentMethod.routing_number,
            is_default: paymentMethod.is_default,
            is_active: paymentMethod.is_active,
        });
        setShowEditModal(true);
    };

    const openDeleteModal = (paymentMethod: PaymentMethod) => {
        setSelectedPaymentMethod(paymentMethod);
        setShowDeleteModal(true);
    };

    const maskAccountNumber = (accountNumber: string) => {
        if (accountNumber.length <= 4) return accountNumber;
        return '•'.repeat(accountNumber.length - 4) + accountNumber.slice(-4);
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                    Payment Methods Management
                </h2>
                <CustomButton
                    variant="primary"
                    fullWidth={false}
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2"
                >
                    <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add New
                    </div>
                </CustomButton>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {payment_methods.map((paymentMethod) => (
                    <div
                        key={paymentMethod.id}
                        className="rounded-lg border border-gray-200 p-4"
                    >
                        <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-gray-400" />
                                {paymentMethod.is_default && (
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => openEditModal(paymentMethod)}
                                    className="text-blue-600 hover:text-blue-900"
                                >
                                    <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() =>
                                        openDeleteModal(paymentMethod)
                                    }
                                    className="text-red-600 hover:text-red-900"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <h3 className="mb-2 text-lg font-semibold text-gray-900">
                            {paymentMethod.bank_name}
                        </h3>
                        <div className="mb-3 space-y-1 text-sm text-gray-600">
                            <p>
                                <span className="font-medium">
                                    Account Name:
                                </span>{' '}
                                {paymentMethod.account_name}
                            </p>
                            <p>
                                <span className="font-medium">
                                    Account Number:
                                </span>{' '}
                                {maskAccountNumber(
                                    paymentMethod.account_number,
                                )}
                            </p>
                            <p>
                                <span className="font-medium">
                                    Routing Number:
                                </span>{' '}
                                {paymentMethod.routing_number}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                    Active
                                </span>
                                <ToggleSwitch
                                    enabled={paymentMethod.is_active}
                                    onChange={(value) =>
                                        handleToggleActive(
                                            paymentMethod.id,
                                            value,
                                        )
                                    }
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                    Default
                                </span>
                                <ToggleSwitch
                                    enabled={paymentMethod.is_default}
                                    onChange={(value) =>
                                        handleToggleDefault(
                                            paymentMethod.id,
                                            value,
                                        )
                                    }
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6">
                        <h3 className="mb-4 text-lg font-semibold">
                            Add New Payment Method
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Bank Name
                                </label>
                                <input
                                    type="text"
                                    value={addData.bank_name}
                                    onChange={(e) =>
                                        setAddData('bank_name', e.target.value)
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Account Name
                                </label>
                                <input
                                    type="text"
                                    value={addData.account_name}
                                    onChange={(e) =>
                                        setAddData(
                                            'account_name',
                                            e.target.value,
                                        )
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Account Number
                                </label>
                                <input
                                    type="text"
                                    value={addData.account_number}
                                    onChange={(e) =>
                                        setAddData(
                                            'account_number',
                                            e.target.value,
                                        )
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Routing Number
                                </label>
                                <input
                                    type="text"
                                    value={addData.routing_number}
                                    onChange={(e) =>
                                        setAddData(
                                            'routing_number',
                                            e.target.value,
                                        )
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-gray-700">
                                    Set as Default
                                </label>
                                <ToggleSwitch
                                    enabled={addData.is_default}
                                    onChange={(value) =>
                                        setAddData('is_default', value)
                                    }
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-gray-700">
                                    Active
                                </label>
                                <ToggleSwitch
                                    enabled={addData.is_active}
                                    onChange={(value) =>
                                        setAddData('is_active', value)
                                    }
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <CustomButton
                                variant="secondary"
                                fullWidth={false}
                                onClick={() => {
                                    setShowAddModal(false);
                                    resetAdd();
                                }}
                            >
                                Cancel
                            </CustomButton>
                            <CustomButton
                                variant="black"
                                fullWidth={false}
                                onClick={handleAdd}
                                disabled={addProcessing}
                            >
                                {addProcessing
                                    ? 'Adding...'
                                    : 'Add Payment Method'}
                            </CustomButton>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedPaymentMethod && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6">
                        <h3 className="mb-4 text-lg font-semibold">
                            Edit Payment Method
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Bank Name
                                </label>
                                <input
                                    type="text"
                                    value={editData.bank_name}
                                    onChange={(e) =>
                                        setEditData('bank_name', e.target.value)
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Account Name
                                </label>
                                <input
                                    type="text"
                                    value={editData.account_name}
                                    onChange={(e) =>
                                        setEditData(
                                            'account_name',
                                            e.target.value,
                                        )
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Account Number
                                </label>
                                <input
                                    type="text"
                                    value={editData.account_number}
                                    onChange={(e) =>
                                        setEditData(
                                            'account_number',
                                            e.target.value,
                                        )
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Routing Number
                                </label>
                                <input
                                    type="text"
                                    value={editData.routing_number}
                                    onChange={(e) =>
                                        setEditData(
                                            'routing_number',
                                            e.target.value,
                                        )
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-gray-700">
                                    Set as Default
                                </label>
                                <ToggleSwitch
                                    enabled={editData.is_default}
                                    onChange={(value) =>
                                        setEditData('is_default', value)
                                    }
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-gray-700">
                                    Active
                                </label>
                                <ToggleSwitch
                                    enabled={editData.is_active}
                                    onChange={(value) =>
                                        setEditData('is_active', value)
                                    }
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <CustomButton
                                variant="secondary"
                                fullWidth={false}
                                onClick={() => {
                                    setShowEditModal(false);
                                    resetEdit();
                                    setSelectedPaymentMethod(null);
                                }}
                            >
                                Cancel
                            </CustomButton>
                            <CustomButton
                                variant="black"
                                fullWidth={false}
                                onClick={handleEdit}
                                disabled={editProcessing}
                            >
                                {editProcessing
                                    ? 'Updating...'
                                    : 'Update Payment Method'}
                            </CustomButton>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && selectedPaymentMethod && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-md rounded-lg bg-white p-6">
                        <h3 className="mb-4 text-lg font-semibold">
                            Delete Payment Method
                        </h3>
                        <p className="mb-6 text-gray-600">
                            Are you sure you want to delete the payment method
                            for "{selectedPaymentMethod.bank_name}" ending in{' '}
                            {selectedPaymentMethod.account_number.slice(-4)}?
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <CustomButton
                                variant="secondary"
                                fullWidth={false}
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedPaymentMethod(null);
                                }}
                            >
                                Cancel
                            </CustomButton>
                            <CustomButton
                                variant="black"
                                fullWidth={false}
                                onClick={handleDelete}
                                disabled={deleteProcessing}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {deleteProcessing ? 'Deleting...' : 'Delete'}
                            </CustomButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagePayments;
