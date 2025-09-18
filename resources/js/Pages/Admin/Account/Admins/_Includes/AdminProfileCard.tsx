import CustomButton from '@/Components/common/CustomButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Dialog, DialogContent } from '@/Components/ui/dialog';
import { getInitials } from '@/lib/helper';
import { Calendar, Clock, Mail, Pen, Shield } from 'lucide-react';
import React, { useState } from 'react';
import AdminProfileForm from './AdminProfileForm';

interface AdminProfileCardProps {
    admin: {
        id: number;
        name: string;
        first_name: string;
        last_name: string;
        email: string;
        role: 'super-admin' | 'moderator' | 'support-admin' | 'editor';
        status: 'active' | 'inactive';
        avatar?: string;
        phone?: string;
        created_at: string;
        last_login?: string;
        email_verified_at?: string;
    };
}

const AdminProfileCard: React.FC<AdminProfileCardProps> = ({ admin }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const formatDate = (dateString: string, type = 'normal') => {
        if (type === 'normal') {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } else {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            });
        }
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

    return (
        <>
            <div className="mb-6 rounded-xl border border-sf-stroke bg-sf-white p-4 shadow-sm md:p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="mb-1 text-xl font-semibold text-sf-black md:text-2xl">
                        My Profile
                    </h1>
                    <p className="text-sf-secondary">
                        Manage your administrator profile information
                    </p>
                </div>

                {/* Profile Section */}
                <div className="relative mb-5 flex items-center justify-between">
                    <div className="flex w-full flex-col items-center gap-4 sm:flex-row">
                        <Avatar className="h-28 w-28 rounded-full border-2 border-gray-100">
                            <AvatarImage
                                className="h-28 w-28"
                                src={
                                    admin.avatar
                                        ? `/storage/${admin.avatar}`
                                        : ''
                                }
                                alt={admin.name || 'Admin'}
                            />
                            <AvatarFallback className="font-inter text-2xl">
                                {getInitials(admin.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="mb-2 flex items-center gap-3">
                                <h3 className="text-xl font-semibold text-sf-black">
                                    {admin.name}
                                </h3>
                                <span
                                    className={`rounded-full px-2 py-1 text-xs font-medium ${getRoleBadgeColor(admin.role)}`}
                                >
                                    {admin.role.replace('-', ' ').toUpperCase()}
                                </span>
                                <span
                                    className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(admin.status)}`}
                                >
                                    {admin.status.toUpperCase()}
                                </span>
                            </div>
                            <div className="mb-2 flex items-center gap-1.5">
                                <Mail size="16" className="text-sf-secondary" />
                                <span className="text-sf-secondary">
                                    {admin.email}
                                </span>
                            </div>
                            {admin.phone && (
                                <div className="mb-2 flex items-center gap-1.5">
                                    <Shield
                                        size="16"
                                        className="text-sf-secondary"
                                    />
                                    <span className="text-sf-secondary">
                                        {admin.phone}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    <CustomButton
                        onClick={() => setIsEditModalOpen(true)}
                        fullWidth={false}
                        className="absolute -top-4 right-0"
                    >
                        <div className="flex items-center gap-1">
                            <Pen size={14} />
                            <span className="hidden sm:inline">
                                Edit Profile
                            </span>
                        </div>
                    </CustomButton>
                </div>

                {/* Details Grid */}
                <div className="mb-4 grid grid-cols-1 gap-7 md:grid-cols-2">
                    <div className="flex items-center gap-3 text-gray-700">
                        <Calendar className="h-4 w-4 shrink-0 text-sf-secondary" />
                        <div>
                            <span className="text-sm font-medium text-sf-black">
                                Account Created
                            </span>
                            <p className="text-sm text-sf-secondary">
                                {formatDate(admin.created_at)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                        <Clock className="h-4 w-4 shrink-0 text-sf-secondary" />
                        <div>
                            <span className="text-sm font-medium text-sf-black">
                                Last Login
                            </span>
                            <p className="text-sm text-sf-secondary">
                                {admin.email_verified_at
                                    ? formatDate(
                                          admin.email_verified_at,
                                          'full',
                                      )
                                    : 'Never'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Admin Privileges */}
                <div className="rounded-lg bg-blue-50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-600" />
                        <h4 className="font-semibold text-blue-900">
                            Administrator Privileges
                        </h4>
                    </div>
                    <p className="text-sm text-blue-700">
                        {admin.role === 'super-admin'
                            ? 'Full system access including user management, settings, and admin invitations.'
                            : admin.role === 'moderator'
                              ? 'Content and user moderation with admin management capabilities.'
                              : admin.role === 'support-admin'
                                ? 'Support access including user management and basic system operations.'
                                : 'Limited admin access for specific operational tasks.'}
                    </p>
                </div>
            </div>

            {/* Edit Profile Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="no-scrollbar max-w-96 overflow-y-auto sm:max-w-[500px]">
                    <AdminProfileForm
                        admin={admin}
                        onClose={() => setIsEditModalOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AdminProfileCard;
