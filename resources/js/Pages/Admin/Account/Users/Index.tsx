import { StylistNavigationSteps } from '@/Components/magic/StylistNavigationSteps';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { AdminAccountLayout } from '@/Layouts/AdminAccountLayout';
import { useState } from 'react';
import CustomersTable from './_Includes/CustomersTable';
import DeletedUsers from './_Includes/DeletedUsers';
import PendingStylistApprovals from './_Includes/PendingStylistApprovals';
import StylistsTable from './_Includes/StylistsTable';

interface Customer {
    id: number;
    name: string;
    email: string;
    country?: string;
    created_at: string;
    status: 'active' | 'disabled';
    avatar?: string;
    total_spent?: number;
    total_bookings?: number;
}

interface Stylist {
    id: number;
    name: string;
    email: string;
    country?: string;
    created_at: string;
    status: 'active' | 'disabled' | 'flagged';
    avatar?: string;
    total_earned?: number;
    total_appointments?: number;
    portfolios_count?: number;
    subscription?: string;
    stylistAppointments?: {
        id: number;
        customer: {
            id: number;
            name: string;
            email: string;
            avatar?: string;
        };
        portfolio: {
            category: {
                id: number;
                name: string;
            };
        };
        amount: number;
        status: string;
        created_at: string;
    }[];
    transactions?: {
        id: number;
        type: string;
        status: string;
        amount: number;
        created_at: string;
    }[];
}

interface StylistApplication {
    id: string;
    name: string;
    email: string;
    created_at: string;
    avatar?: string;
    country?: string;
    bio?: string;
    phone?: string;
}

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

interface UsersProps {
    customers: Customer[];
    stylists: Stylist[];
    stylist_approvals: StylistApplication[];
    deleted_users?: DeletedUser[];
}

export default function Users({
    customers,
    stylists,
    stylist_approvals,
    deleted_users,
}: UsersProps) {
    const [activeTab, setActiveTab] = useState<
        'customers' | 'stylists' | 'approvals' | 'deleted_users'
    >('customers');

    const routes = [
        {
            name: 'Manage Users',
            path: route('admin.users'),
            active: false,
        },
    ];

    const handleTabChange = (value: string) => {
        setActiveTab(
            value as 'customers' | 'stylists' | 'approvals' | 'deleted_users',
        );
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'customers':
                return <CustomersTable customers={customers} />;
            case 'stylists':
                return <StylistsTable stylists={stylists} />;
            case 'approvals':
                return (
                    <PendingStylistApprovals applications={stylist_approvals} />
                );
            case 'deleted_users':
                return <DeletedUsers deleted_users={deleted_users} />;
            default:
                return <CustomersTable customers={customers} />;
        }
    };

    const getTabDisplayText = () => {
        switch (activeTab) {
            case 'customers':
                return 'Customers';
            case 'stylists':
                return 'Stylists';
            case 'approvals':
                return 'Stylist Approvals';
            case 'deleted_users':
                return 'Deleted Users';
            default:
                return 'Customers';
        }
    };
    return (
        <AdminAccountLayout header="Admin Dashboard">
            <StylistNavigationSteps
                routes={routes}
                sub="Here's what's happening with your platform today"
            >
                <Select value={activeTab} onValueChange={handleTabChange}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder={getTabDisplayText()} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="customers">Customers</SelectItem>
                        <SelectItem value="stylists">Stylists</SelectItem>
                        <SelectItem value="approvals">
                            Stylist Approvals
                        </SelectItem>
                        <SelectItem value="deleted_users">
                            Deleted Users
                        </SelectItem>
                    </SelectContent>
                </Select>
            </StylistNavigationSteps>
            <section className="mx-auto max-w-7xl px-5">
                {renderTabContent()}
            </section>
        </AdminAccountLayout>
    );
}
