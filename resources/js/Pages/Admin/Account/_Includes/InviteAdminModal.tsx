import { ChevronDown, Mail, X } from 'lucide-react';
import React, { useState } from 'react';

interface Permission {
    id: string;
    label: string;
    checked: boolean;
}

interface InviteAdminModalProps {
    isOpen?: boolean;
    onClose?: () => void;
    onSubmit?: (data: AdminInviteData) => void;
}

interface AdminInviteData {
    email: string;
    phoneNumber: string;
    role: string;
    permissions: string[];
}

const InviteAdminModal: React.FC<InviteAdminModalProps> = ({
    isOpen = true,
    onClose = () => {},
    onSubmit = () => {},
}) => {
    const [email, setEmail] = useState('superadmin@snipfair.com');
    const [phoneNumber, setPhoneNumber] = useState('+1 908 765 4321');
    const [role, setRole] = useState('admin');
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);

    const [permissions, setPermissions] = useState<Permission[]>([
        { id: 'systemSettings', label: 'System Settings', checked: false },
        { id: 'analytics', label: 'Analytics', checked: false },
        {
            id: 'contentModeration',
            label: 'Content Moderation',
            checked: false,
        },
        { id: 'userManagement', label: 'User Management', checked: false },
        { id: 'supportCenter', label: 'Support Center', checked: false },
        {
            id: 'financialOperations',
            label: 'Financial Operations',
            checked: false,
        },
    ]);

    const roles = ['admin', 'super admin', 'moderator', 'support'];

    const handlePermissionChange = (id: string) => {
        setPermissions((prev) =>
            prev.map((perm) =>
                perm.id === id ? { ...perm, checked: !perm.checked } : perm,
            ),
        );
    };

    const handleSubmit = () => {
        const selectedPermissions = permissions
            .filter((perm) => perm.checked)
            .map((perm) => perm.id);

        const data: AdminInviteData = {
            email,
            phoneNumber,
            role,
            permissions: selectedPermissions,
        };

        onSubmit(data);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="mx-4 w-full max-w-md rounded-lg bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 p-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Invite New Admin
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Send Invite to a new admin
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Form Content */}
                <div className="space-y-6 p-6">
                    {/* Email Field */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter email address"
                        />
                    </div>

                    {/* Phone Number Field */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 flex -translate-y-1/2 transform items-center">
                                <span className="mr-2 text-lg">🇺🇸</span>
                            </div>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 py-3 pl-16 pr-4 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-purple-500"
                                placeholder="+1 xxx xxx xxxx"
                            />
                        </div>
                    </div>

                    {/* Role Dropdown */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Assign Role
                        </label>
                        <div className="relative">
                            <button
                                onClick={() =>
                                    setShowRoleDropdown(!showRoleDropdown)
                                }
                                className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 text-left outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-purple-500"
                            >
                                <span className="text-gray-700">{role}</span>
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                            </button>

                            {showRoleDropdown && (
                                <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-gray-300 bg-white shadow-lg">
                                    {roles.map((roleOption) => (
                                        <button
                                            key={roleOption}
                                            onClick={() => {
                                                setRole(roleOption);
                                                setShowRoleDropdown(false);
                                            }}
                                            className="w-full px-4 py-2 text-left transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-gray-50"
                                        >
                                            {roleOption}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Permissions */}
                    <div>
                        <label className="mb-4 block text-sm font-medium text-gray-700">
                            Set Permissions
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            {permissions.map((permission) => (
                                <label
                                    key={permission.id}
                                    className="flex cursor-pointer items-center space-x-3"
                                >
                                    <input
                                        type="checkbox"
                                        checked={permission.checked}
                                        onChange={() =>
                                            handlePermissionChange(
                                                permission.id,
                                            )
                                        }
                                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="select-none text-sm text-gray-700">
                                        {permission.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-6">
                    <button
                        onClick={handleSubmit}
                        className="flex w-full items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 font-medium text-white transition-all duration-200 hover:from-purple-700 hover:to-pink-700"
                    >
                        <Mail className="h-5 w-5" />
                        <span>Send Invitation</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InviteAdminModal;
