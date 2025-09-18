import CustomButton from '@/Components/common/CustomButton';
import { StylistNavigationSteps } from '@/Components/magic/StylistNavigationSteps';
import { AdminAccountLayout } from '@/Layouts/AdminAccountLayout';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import AdminProfileCard from './_Includes/AdminProfileCard';
import AdminsTable from './_Includes/AdminsTable';
import InviteAdminModal from './_Includes/InviteAdminModal';

interface AdminUser {
    id: number;
    name: string;
    email: string;
    role: 'super-admin' | 'moderator' | 'support-admin' | 'editor';
    status: 'active' | 'inactive';
    avatar?: string;
    created_at: string;
}

interface CurrentAdmin {
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
}

export default function AdminsIndex({
    currentAdmin,
    admins,
}: {
    currentAdmin: CurrentAdmin;
    admins: AdminUser[];
}) {
    const [showInviteModal, setShowInviteModal] = useState(false);

    const routes = [
        {
            name: 'Manage Admins',
            path: route('admin.admins.index'),
            active: false,
        },
    ];

    const canInviteAdmins = currentAdmin.role === 'super-admin';
    const canManageAdmins = [
        'super-admin',
        'moderator',
        'support-admin',
    ].includes(currentAdmin.role);

    return (
        <AdminAccountLayout header="Admin Management">
            <StylistNavigationSteps
                routes={routes}
                sub="Manage your profile and administrator accounts"
            >
                {canInviteAdmins && (
                    <CustomButton
                        onClick={() => setShowInviteModal(true)}
                        fullWidth={false}
                    >
                        <div className="flex gap-1">
                            <Plus size={14} />
                            Invite Admin
                        </div>
                    </CustomButton>
                )}
            </StylistNavigationSteps>
            {/* Current Admin Profile Section */}
            <section className="mx-auto max-w-7xl px-5">
                <AdminProfileCard admin={currentAdmin} />
            </section>

            {/* Admins Management Table Section */}
            {canManageAdmins && (
                <section className="mx-auto max-w-7xl px-5">
                    <AdminsTable
                        admins={admins}
                        currentAdminId={currentAdmin.id}
                        currentAdminRole={currentAdmin.role}
                    />
                </section>
            )}

            {/* Invite Admin Modal */}
            <InviteAdminModal
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
            />
        </AdminAccountLayout>
    );
}
