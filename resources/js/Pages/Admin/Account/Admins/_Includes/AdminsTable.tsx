import CustomButton from '@/Components/common/CustomButton';
import CommonAvatar from '@/Components/common/forms/CommonAvatar';
import Modal from '@/Components/Modal';
import { Dialog, DialogContent } from '@/Components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { router } from '@inertiajs/react';
import {
    Eye,
    Mail,
    MoreVertical,
    Power,
    PowerOff,
    Search,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

interface AdminUser {
    id: number;
    name: string;
    email: string;
    role: 'super-admin' | 'moderator' | 'support-admin' | 'editor';
    status: 'active' | 'inactive';
    avatar?: string;
    created_at: string;
}

interface AdminsTableProps {
    admins: AdminUser[];
    currentAdminId: number;
    currentAdminRole: 'super-admin' | 'moderator' | 'support-admin' | 'editor';
}

const AdminsTable: React.FC<AdminsTableProps> = ({
    admins,
    currentAdminId,
    currentAdminRole,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
    const [resetPassword, setResetPassword] = useState('');
    const [confirmAction, setConfirmAction] = useState<{
        type: 'toggle' | 'delete' | 'reset-password';
        admin: AdminUser;
    } | null>(null);
    const [message, setMessage] = useState('');

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getRoleBadgeColor = (role: string) => {
        const colors = {
            'super-admin': 'bg-purple-100 text-purple-800',
            moderator: 'bg-indigo-100 text-indigo-800',
            'support-admin': 'bg-blue-100 text-blue-800',
            editor: 'bg-green-100 text-green-800',
        };
        return (
            colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'
        );
    };

    const getStatusColor = (status: string) => {
        return status === 'active'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800';
    };

    const filteredAdmins = admins.filter(
        (admin) =>
            admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admin.role.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const handleViewDetails = (admin: AdminUser) => {
        setSelectedAdmin(admin);
        setShowDetailsModal(true);
    };

    const handleSendMessage = (admin: AdminUser) => {
        setSelectedAdmin(admin);
        setShowMessageModal(true);
    };

    const handleActionConfirm = (
        type: 'toggle' | 'delete' | 'reset-password',
        admin: AdminUser,
    ) => {
        setConfirmAction({ type, admin });
        setShowConfirmDialog(true);
        setShowDetailsModal(false);
    };

    const handleResetPassword = (admin: AdminUser) => {
        // Generate a temporary password and show it to the super admin
        const tempPassword = Math.random().toString(36).slice(-12);
        setResetPassword(tempPassword);
        setSelectedAdmin(admin);
        setShowPasswordResetModal(true);
        setShowDetailsModal(false);

        // Send the reset request to backend
        router.post(
            route('admin.admins.reset-password', admin.id),
            { password: tempPassword },
            {
                onSuccess: () => {
                    // Keep modal open to show password
                },
            },
        );
    };

    const executeAction = () => {
        if (!confirmAction) return;

        const { type, admin } = confirmAction;

        if (type === 'toggle') {
            // Toggle admin status
            router.put(
                route('admin.admins.toggle-status', admin.id),
                {},
                {
                    onSuccess: () => {
                        setShowConfirmDialog(false);
                        setConfirmAction(null);
                    },
                },
            );
        } else if (type === 'delete') {
            // Delete admin
            router.delete(route('admin.admins.destroy', admin.id), {
                onSuccess: () => {
                    setShowConfirmDialog(false);
                    setConfirmAction(null);
                },
            });
        } else if (type === 'reset-password') {
            handleResetPassword(admin);
            setShowConfirmDialog(false);
            setConfirmAction(null);
        }
    };

    const sendMessage = () => {
        if (!selectedAdmin || !message.trim()) return;

        router.post(
            route('admin.admins.send-message'),
            {
                admin_id: selectedAdmin.id,
                message: message.trim(),
            },
            {
                onSuccess: () => {
                    setShowMessageModal(false);
                    setMessage('');
                    setSelectedAdmin(null);
                },
            },
        );
    };

    const updateAdminRole = (newRole: string) => {
        if (!selectedAdmin) return;

        router.put(
            route('admin.admins.update-role', selectedAdmin.id),
            { role: newRole },
            {
                onSuccess: () => {
                    setSelectedAdmin({
                        ...selectedAdmin,
                        role: newRole as
                            | 'super-admin'
                            | 'moderator'
                            | 'support-admin'
                            | 'editor',
                    });
                },
            },
        );
    };

    const canManageAdmin = (admin: AdminUser) => {
        if (admin.id === currentAdminId) return false;
        if (currentAdminRole === 'super-admin') return true;
        if (currentAdminRole === 'support-admin' && admin.role === 'editor')
            return true;
        return false;
    };

    return (
        <div className="mb-6 rounded-xl border border-sf-stroke bg-sf-white p-4 shadow-sm md:p-6">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-bold text-sf-black md:text-2xl">
                        Admin Management
                    </h2>
                    <p className="text-sf-secondary">
                        Manage administrator accounts and permissions
                    </p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search admins..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-64"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 text-left">
                            <th className="pb-3 font-medium text-gray-700">
                                Admin
                            </th>
                            <th className="pb-3 font-medium text-gray-700">
                                Role
                            </th>
                            <th className="pb-3 font-medium text-gray-700">
                                Status
                            </th>
                            <th className="pb-3 font-medium text-gray-700">
                                Date Added
                            </th>
                            <th className="pb-3 font-medium text-gray-700">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAdmins.map((admin) => (
                            <tr
                                key={admin.id}
                                className="border-b border-gray-100 hover:bg-gray-50"
                            >
                                <td className="py-4">
                                    <div className="flex items-center gap-3">
                                        <CommonAvatar
                                            image={
                                                admin.avatar
                                                    ? `/storage/${admin.avatar}`
                                                    : ''
                                            }
                                            name={admin.name}
                                            className="h-10 w-10"
                                        />
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {admin.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {admin.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4">
                                    <span
                                        className={`rounded-full px-2 py-1 text-xs font-medium ${getRoleBadgeColor(admin.role)}`}
                                    >
                                        {admin.role
                                            .replace('-', ' ')
                                            .toUpperCase()}
                                    </span>
                                </td>
                                <td className="py-4">
                                    <span
                                        className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(admin.status)}`}
                                    >
                                        {admin.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="py-4 text-sm text-gray-600">
                                    {formatDate(admin.created_at)}
                                </td>
                                <td className="py-4">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                                                <MoreVertical className="h-4 w-4" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            className="z-50 w-48"
                                        >
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleViewDetails(admin)
                                                }
                                                className="flex items-center"
                                            >
                                                <Eye className="mr-2 h-4 w-4" />
                                                View Details
                                            </DropdownMenuItem>
                                            {currentAdminId !== admin.id && (
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleSendMessage(admin)
                                                    }
                                                    className="flex items-center"
                                                >
                                                    <Mail className="h-4 w-4" />
                                                    Send Message
                                                </DropdownMenuItem>
                                            )}
                                            {canManageAdmin(admin) && (
                                                <>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleActionConfirm(
                                                                'toggle',
                                                                admin,
                                                            )
                                                        }
                                                        className="flex items-center"
                                                    >
                                                        {admin.status ===
                                                        'active' ? (
                                                            <>
                                                                <PowerOff className="h-4 w-4" />
                                                                Disable
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Power className="h-4 w-4" />
                                                                Enable
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleActionConfirm(
                                                                'delete',
                                                                admin,
                                                            )
                                                        }
                                                        className="flex items-center text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredAdmins.length === 0 && (
                    <div className="py-8 text-center text-gray-500">
                        No admins found matching your search.
                    </div>
                )}
            </div>

            {/* Admin Details Modal */}
            <Dialog
                open={showDetailsModal}
                onOpenChange={() => setShowDetailsModal(false)}
            >
                <DialogContent>
                    {selectedAdmin && (
                        <div className="p-1">
                            <h3 className="mb-4 text-lg font-semibold">
                                Admin Details
                            </h3>

                            <div className="mb-6 flex items-center gap-4">
                                <CommonAvatar
                                    image={
                                        selectedAdmin.avatar
                                            ? `/storage/${selectedAdmin.avatar}`
                                            : ''
                                    }
                                    name={selectedAdmin.name}
                                    className="h-16 w-16"
                                />
                                <div>
                                    <h4 className="text-xl font-semibold">
                                        {selectedAdmin.name}
                                    </h4>
                                    <p className="text-gray-600">
                                        {selectedAdmin.email}
                                    </p>
                                </div>
                            </div>

                            <div className="mb-6 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Current Role
                                    </label>
                                    {currentAdminRole === 'super-admin' &&
                                    selectedAdmin.id !== currentAdminId ? (
                                        <Select
                                            value={selectedAdmin.role}
                                            onValueChange={updateAdminRole}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="super-admin">
                                                    Super Admin
                                                </SelectItem>
                                                <SelectItem value="moderator">
                                                    Moderator
                                                </SelectItem>
                                                <SelectItem value="support-admin">
                                                    Support Admin
                                                </SelectItem>
                                                <SelectItem value="editor">
                                                    Editor
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <p className="mt-1 text-sm">
                                            {selectedAdmin.role
                                                .replace('-', ' ')
                                                .toUpperCase()}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Status
                                    </label>
                                    <span
                                        className={`mt-1 inline-block rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(selectedAdmin.status)}`}
                                    >
                                        {selectedAdmin.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {canManageAdmin(selectedAdmin) && (
                                    <>
                                        <CustomButton
                                            onClick={() =>
                                                handleActionConfirm(
                                                    'toggle',
                                                    selectedAdmin,
                                                )
                                            }
                                            variant="secondary"
                                        >
                                            {selectedAdmin.status === 'active'
                                                ? 'Disable'
                                                : 'Enable'}
                                        </CustomButton>
                                        <CustomButton
                                            onClick={() =>
                                                handleActionConfirm(
                                                    'delete',
                                                    selectedAdmin,
                                                )
                                            }
                                            variant="black"
                                        >
                                            Delete
                                        </CustomButton>
                                    </>
                                )}
                                {currentAdminRole === 'super-admin' &&
                                    selectedAdmin.id !== currentAdminId && (
                                        <CustomButton
                                            onClick={() =>
                                                handleActionConfirm(
                                                    'reset-password',
                                                    selectedAdmin,
                                                )
                                            }
                                            variant="primary"
                                        >
                                            Reset Password
                                        </CustomButton>
                                    )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Confirmation Modal */}
            <Dialog
                open={showConfirmDialog}
                onOpenChange={() => setShowConfirmDialog(false)}
            >
                <DialogContent>
                    <h3 className="mb-4 text-lg font-semibold text-red-600">
                        Confirm Action
                    </h3>
                    <p className="mb-6 text-gray-600">
                        {confirmAction?.type === 'delete'
                            ? `Are you sure you want to delete ${confirmAction.admin.name}? This action cannot be undone.`
                            : confirmAction?.type === 'reset-password'
                              ? `Are you sure you want to reset the password for ${confirmAction.admin.name}? A new temporary password will be generated and sent to their email.`
                              : `Are you sure you want to ${confirmAction?.admin.status === 'active' ? 'disable' : 'enable'} ${confirmAction?.admin.name}?`}
                    </p>
                    <div className="flex justify-center gap-2">
                        <CustomButton
                            onClick={executeAction}
                            variant={
                                confirmAction?.type === 'delete'
                                    ? 'black'
                                    : 'primary'
                            }
                        >
                            {confirmAction?.type === 'delete'
                                ? 'Delete'
                                : confirmAction?.type === 'reset-password'
                                  ? 'Reset Password'
                                  : 'Confirm'}
                        </CustomButton>
                        <CustomButton
                            onClick={() => setShowConfirmDialog(false)}
                            variant="secondary"
                        >
                            Cancel
                        </CustomButton>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Send Message Modal */}
            <Modal
                show={showMessageModal}
                onClose={() => setShowMessageModal(false)}
            >
                <div className="p-6">
                    <h3 className="mb-4 text-lg font-semibold">Send Message</h3>
                    <p className="mb-4 text-gray-600">
                        Send a notification message to {selectedAdmin?.name}
                    </p>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Enter your message..."
                        className="mb-4 w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        rows={4}
                    />
                    <div className="flex gap-2">
                        <CustomButton
                            onClick={sendMessage}
                            disabled={!message.trim()}
                            fullWidth={false}
                        >
                            Send Message
                        </CustomButton>
                        <CustomButton
                            onClick={() => setShowMessageModal(false)}
                            variant="secondary"
                            fullWidth={false}
                        >
                            Cancel
                        </CustomButton>
                    </div>
                </div>
            </Modal>

            {/* Password Reset Result Modal */}
            <Dialog
                open={showPasswordResetModal}
                onOpenChange={() => setShowPasswordResetModal(false)}
            >
                <DialogContent>
                    <div className="p-1">
                        <h3 className="mb-4 text-lg font-semibold text-green-600">
                            Password Reset Successful
                        </h3>
                        <p className="mb-4 text-gray-600">
                            The password for {selectedAdmin?.name} has been
                            reset successfully.
                        </p>

                        <div className="mb-6 rounded-lg bg-gray-50 p-4">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                New Temporary Password
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={resetPassword}
                                    readOnly
                                    className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-sm"
                                />
                                <CustomButton
                                    onClick={() =>
                                        navigator.clipboard.writeText(
                                            resetPassword,
                                        )
                                    }
                                    variant="secondary"
                                    fullWidth={false}
                                >
                                    Copy
                                </CustomButton>
                            </div>
                        </div>

                        <div className="mb-4 rounded-lg bg-blue-50 p-4">
                            <p className="text-sm text-blue-800">
                                <strong>Note:</strong> This password has also
                                been sent to {selectedAdmin?.email}. The admin
                                should change this password upon their next
                                login.
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <CustomButton
                                onClick={() => {
                                    setShowPasswordResetModal(false);
                                    setResetPassword('');
                                    setSelectedAdmin(null);
                                }}
                                variant="primary"
                            >
                                Close
                            </CustomButton>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminsTable;
