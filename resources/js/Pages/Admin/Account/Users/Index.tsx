import { StylistNavigationSteps } from '@/Components/magic/StylistNavigationSteps';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { AdminAccountLayout } from '@/Layouts/AdminAccountLayout';
import { Deferred } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import CustomersTable from './_Includes/CustomersTable';
import DeletedUsers from './_Includes/DeletedUsers';
import PendingStylistApprovals from './_Includes/PendingStylistApprovals';
import StylistsTable from './_Includes/StylistsTable';

interface Customer {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    phone: string;
    gender: string | null;
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
    first_name: string;
    last_name: string;
    phone: string;
    gender: string | null;
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
    first_name: string;
    last_name: string;
    phone: string;
    gender: string | null;
    email: string;
    created_at: string;
    avatar?: string;
    country?: string;
    bio?: string;
}

interface DeletedUser {
    id: string;
    name: string;
    first_name: string;
    last_name: string;
    phone: string;
    gender: string | null;
    email: string;
    created_at: string;
    avatar?: string;
    deleted_at: string;
    deleted_by?: string;
    role: string;
}

interface UsersProps {
    customers: Customer[];
    all_stylists: Stylist[];
    rejected_stylists: Stylist[];
    stylists: Stylist[];
    stylist_approvals: StylistApplication[];
    deleted_users?: DeletedUser[];
}

export default function Users({
    customers,
    all_stylists,
    rejected_stylists,
    stylists,
    stylist_approvals,
    deleted_users,
}: UsersProps) {
    const [activeTab, setActiveTab] = useState<
        | 'customers'
        | 'all_stylists'
        | 'rejected_stylists'
        | 'stylists'
        | 'approvals'
        | 'deleted_users'
    >('customers');

    const routes = [
        {
            name: 'Manage Users',
            path: window.route('admin.users'),
            active: false,
        },
    ];

    const handleTabChange = (value: string) => {
        setActiveTab(
            value as
                | 'customers'
                | 'all_stylists'
                | 'rejected_stylists'
                | 'stylists'
                | 'approvals'
                | 'deleted_users',
        );
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'all_stylists':
                return (
                    <Deferred
                        data="all_stylists"
                        fallback={
                            <Loader2 className="h-3 w-3 animate-spin text-white" />
                        }
                    >
                        <StylistsTable stylists={all_stylists} />;
                    </Deferred>
                );

            case 'rejected_stylists':
                return (
                    <Deferred
                        data="rejected_stylists"
                        fallback={
                            <Loader2 className="h-3 w-3 animate-spin text-white" />
                        }
                    >
                        <StylistsTable stylists={rejected_stylists} />;
                    </Deferred>
                );

            case 'stylists':
                return (
                    <Deferred
                        data="stylists"
                        fallback={
                            <Loader2 className="h-3 w-3 animate-spin text-white" />
                        }
                    >
                        <StylistsTable stylists={stylists} />;
                    </Deferred>
                );

            case 'approvals':
                return (
                    <Deferred
                        data="stylist_approvals"
                        fallback={
                            <Loader2 className="h-3 w-3 animate-spin text-white" />
                        }
                    >
                        <PendingStylistApprovals
                            applications={stylist_approvals}
                        />
                        ;
                    </Deferred>
                );

            case 'deleted_users':
                return (
                    <Deferred
                        data="deleted_users"
                        fallback={
                            <Loader2 className="h-3 w-3 animate-spin text-white" />
                        }
                    >
                        <DeletedUsers deleted_users={deleted_users} />;
                    </Deferred>
                );

            case 'customers':
            default:
                return <CustomersTable customers={customers} />;
        }
    };

    const getTabDisplayText = () => {
        switch (activeTab) {
            case 'customers':
                return 'Customers';
            case 'all_stylists':
                return 'All Stylists';
            case 'stylists':
                return 'Approved Stylists';
            case 'rejected_stylists':
                return 'Rejected Stylists';
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
                        <SelectItem value="all_stylists">
                            All Stylists
                        </SelectItem>
                        <SelectItem value="stylists">
                            Approved Stylists
                        </SelectItem>
                        <SelectItem value="rejected_stylists">
                            Rejected Stylists
                        </SelectItem>
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
