import CommonAvatar from '@/Components/common/forms/CommonAvatar';
import Modal from '@/Components/Modal';
import { router } from '@inertiajs/react';
import { Calendar, Check, X } from 'lucide-react';
import React, { useState } from 'react';

interface DeletedUser {
    id: string;
    name: string;
    email: string;
    created_at: string;
    avatar?: string;
    deleted_at: string;
    deleted_by?: string;
    role: string;
}

interface DeletedUsersProps {
    deleted_users?: DeletedUser[];
}

const DeletedUsers: React.FC<DeletedUsersProps> = ({ deleted_users = [] }) => {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{
        type: 'restore' | 'delete';
        user: DeletedUser;
    } | null>(null);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handleActionConfirm = (
        type: 'restore' | 'delete',
        user: DeletedUser,
    ) => {
        setConfirmAction({ type, user });
        setShowConfirmDialog(true);
    };

    const executeAction = () => {
        if (!confirmAction) return;

        const { type, user } = confirmAction;

        switch (type) {
            case 'restore':
                router.post(route('admin.users.restore', user.id), {});
                break;
            case 'delete':
                router.post(route('admin.users.delete', user.id), {});
                break;
        }

        setShowConfirmDialog(false);
        setConfirmAction(null);
    };

    const getActionText = () => {
        if (!confirmAction) return '';
        const { type, user } = confirmAction;
        return type === 'restore'
            ? `restore ${user.name}'s account`
            : `delete ${user.name}'s account`;
    };

    return (
        <div className="rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900">
                    Deleted Users
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Review and manage deleted users
                </p>
            </div>

            <div className="p-6">
                <div className="space-y-4">
                    {deleted_users.map((user) => (
                        <div
                            key={user.id}
                            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
                        >
                            <div className="flex items-center space-x-4">
                                <CommonAvatar
                                    image={user.avatar}
                                    name={user.name}
                                    className="h-16 w-16"
                                />

                                <div className="flex flex-col">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {user.name}
                                    </h3>
                                    <p className="mb-2 text-sm text-gray-600">
                                        {user.email}
                                    </p>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Calendar className="mr-1 h-4 w-4" />
                                        <span>
                                            Registered on{' '}
                                            {formatDate(user.created_at)}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Calendar className="mr-1 h-4 w-4" />
                                        <span>
                                            Deleted on{' '}
                                            {formatDate(user.deleted_at)}
                                        </span>
                                    </div>
                                    {/* {user.deleted_by && (
                                        <p className="mt-1 text-sm text-gray-500">
                                            Deleted By {user.deleted_by}
                                        </p>
                                    )} */}
                                </div>
                            </div>

                            <div className="flex flex-col items-end space-y-2">
                                <button
                                    onClick={() =>
                                        handleActionConfirm('restore', user)
                                    }
                                    className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                >
                                    <Check className="mr-1 h-4 w-4" />
                                    Restore
                                </button>
                                <button
                                    onClick={() =>
                                        handleActionConfirm('delete', user)
                                    }
                                    className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                >
                                    <X className="mr-1 h-4 w-4" />
                                    Permanently Delete
                                </button>
                            </div>
                        </div>
                    ))}

                    {deleted_users.length === 0 && (
                        <div className="py-12 text-center">
                            <div className="text-gray-500">
                                No deleted users
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Dialog */}
            <Modal
                show={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
                maxWidth="md"
            >
                <div className="p-6">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">
                        Confirm Action
                    </h3>
                    <p className="mb-6 text-gray-600">
                        Are you sure you want to {getActionText()}?
                    </p>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => setShowConfirmDialog(false)}
                            className="rounded-md bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={executeAction}
                            className={`rounded-md px-4 py-2 text-white ${
                                confirmAction?.type === 'restore'
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-red-600 hover:bg-red-700'
                            }`}
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default DeletedUsers;
