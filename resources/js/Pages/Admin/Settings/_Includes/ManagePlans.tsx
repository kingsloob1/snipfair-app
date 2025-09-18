import CustomButton from '@/Components/common/CustomButton';
import { router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ToggleSwitch from './ToggleSwitch';

interface Plan {
    id: number;
    name: string;
    amount: number;
    duration: number;
    status: boolean;
    created_at: Date | string;
    updated_at: Date | string;
}

type PlanFormProps = {
    name: string;
    amount: number;
    duration: number;
    status: boolean;
};

interface PlansProps {
    plans: Plan[];
}

const ManagePlans = ({ plans }: PlansProps) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

    const {
        data: addData,
        setData: setAddData,
        post,
        processing: addProcessing,
        reset: resetAdd,
    } = useForm<PlanFormProps>({
        name: '',
        amount: 0,
        duration: 0,
        status: true,
    });

    const {
        data: editData,
        setData: setEditData,
        put,
        processing: editProcessing,
        reset: resetEdit,
    } = useForm<PlanFormProps>({
        name: '',
        amount: 0,
        duration: 0,
        status: true,
    });

    const { delete: destroy, processing: deleteProcessing } = useForm();

    const handleToggle = (planId: number, value: boolean) => {
        router.put(route('admin.plans.toggle', planId), {
            status: value,
        });
    };

    const handleAdd = () => {
        post(route('admin.plans.store'), {
            onSuccess: () => {
                setShowAddModal(false);
                resetAdd();
            },
        });
    };

    const handleEdit = () => {
        if (selectedPlan) {
            put(route('admin.plans.update', selectedPlan.id), {
                onSuccess: () => {
                    setShowEditModal(false);
                    resetEdit();
                    setSelectedPlan(null);
                },
            });
        }
    };

    const handleDelete = () => {
        if (selectedPlan) {
            destroy(route('admin.plans.destroy', selectedPlan.id), {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setSelectedPlan(null);
                },
            });
        }
    };

    const openEditModal = (plan: Plan) => {
        setSelectedPlan(plan);
        setEditData({
            name: plan.name,
            amount: plan.amount,
            duration: plan.duration,
            status: plan.status,
        });
        setShowEditModal(true);
    };

    const openDeleteModal = (plan: Plan) => {
        setSelectedPlan(plan);
        setShowDeleteModal(true);
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                    Plans Management
                </h2>
                <CustomButton
                    fullWidth={false}
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2"
                >
                    <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add New Plan
                    </div>
                </CustomButton>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Duration (Days)
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {plans.map((plan) => (
                            <tr key={plan.id} className="hover:bg-gray-50">
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                    {plan.name}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    R{plan.amount}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    {plan.duration}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    <ToggleSwitch
                                        enabled={plan.status}
                                        onChange={(value) =>
                                            handleToggle(plan.id, value)
                                        }
                                    />
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => openEditModal(plan)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                openDeleteModal(plan)
                                            }
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-md rounded-lg bg-white p-6">
                        <h3 className="mb-4 text-lg font-semibold">
                            Add New Plan
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={addData.name}
                                    onChange={(e) =>
                                        setAddData('name', e.target.value)
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Price
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={addData.amount}
                                    onChange={(e) =>
                                        setAddData(
                                            'amount',
                                            Number(e.target.value),
                                        )
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Duration (Days)
                                </label>
                                <input
                                    type="number"
                                    value={addData.duration}
                                    onChange={(e) =>
                                        setAddData(
                                            'duration',
                                            Number(e.target.value),
                                        )
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex items-center">
                                <label className="mr-4 block text-sm font-medium text-gray-700">
                                    Active
                                </label>
                                <ToggleSwitch
                                    enabled={addData.status}
                                    onChange={(value) =>
                                        setAddData('status', value)
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
                                {addProcessing ? 'Adding...' : 'Add Plan'}
                            </CustomButton>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-md rounded-lg bg-white p-6">
                        <h3 className="mb-4 text-lg font-semibold">
                            Edit Plan
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={editData.name}
                                    onChange={(e) =>
                                        setEditData('name', e.target.value)
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Price
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={editData.amount}
                                    onChange={(e) =>
                                        setEditData(
                                            'amount',
                                            Number(e.target.value),
                                        )
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Duration (Days)
                                </label>
                                <input
                                    type="number"
                                    value={editData.duration}
                                    onChange={(e) =>
                                        setEditData(
                                            'duration',
                                            Number(e.target.value),
                                        )
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex items-center">
                                <label className="mr-4 block text-sm font-medium text-gray-700">
                                    Active
                                </label>
                                <ToggleSwitch
                                    enabled={editData.status}
                                    onChange={(value) =>
                                        setEditData('status', value)
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
                                    setSelectedPlan(null);
                                }}
                            >
                                Cancel
                            </CustomButton>
                            <CustomButton
                                fullWidth={false}
                                variant="black"
                                onClick={handleEdit}
                                disabled={editProcessing}
                            >
                                {editProcessing ? 'Updating...' : 'Update Plan'}
                            </CustomButton>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && selectedPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-md rounded-lg bg-white p-6">
                        <h3 className="mb-4 text-lg font-semibold">
                            Delete Plan
                        </h3>
                        <p className="mb-6 text-gray-600">
                            Are you sure you want to delete "{selectedPlan.name}
                            "? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <CustomButton
                                variant="secondary"
                                fullWidth={false}
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedPlan(null);
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

export default ManagePlans;
