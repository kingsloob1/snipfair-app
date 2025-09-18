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
import AppointmentsTable from './_Includes/AppointmentsTable';
import DepositRequests from './_Includes/DepositRequests';
import PayoutRequests from './_Includes/PayoutRequests';
import DashboardMetrics from './_Includes/StatCards';
import SubscriptionsTable from './_Includes/SubscriptionsTable';
import TransactionsTable from './_Includes/TransactionsTable';

interface Appointment {
    id: number;
    customer: {
        id: number;
        name: string;
        email: string;
        avatar?: string;
    };
    stylist: {
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
    appointment_date: string;
    amount: number;
    status: string;
    created_at: string;
}

interface Transaction {
    id: number;
    user: {
        id: number;
        name: string;
        email: string;
        avatar?: string;
    };
    type: string;
    ref: string;
    amount: number;
    status: string;
    description?: string;
    created_at: string;
}

interface Subscription {
    id: number;
    user: {
        id: number;
        name: string;
        email: string;
        avatar?: string;
    };
    plan: {
        id: number;
        name: string;
        amount: number;
    };
    payment: {
        id: number;
        status: string;
    };
    expiry: string;
    created_at: string;
}

interface PayoutRequest {
    id: number;
    user_name: string;
    amount: number;
    payment_method: string;
    submitted_date: string;
    status: 'pending' | 'processing' | 'approved' | 'declined';
    profile_image: string;
    account_name?: string;
    bank_name?: string;
    account_number?: string;
}

interface DashboardMetrics {
    totalRevenue: {
        value: string;
        change: string;
        changeType: 'positive' | 'negative' | 'neutral';
    };
    commissionEarned: {
        value: string;
        change: string;
        changeType: 'positive' | 'negative' | 'neutral';
    };
    pendingPayouts: {
        value: string;
        subtitle: string;
    };
    failedRequests: {
        value: string;
        subtitle: string;
    };
}

export default function Transactions({
    appointments,
    transactions,
    payout_requests,
    deposit_requests,
    subscriptions,
    metrics,
}: {
    appointments: Appointment[];
    transactions: Transaction[];
    payout_requests: PayoutRequest[];
    deposit_requests: PayoutRequest[];
    subscriptions: Subscription[];
    metrics: DashboardMetrics;
}) {
    const [activeTab, setActiveTab] = useState<
        | 'appointments'
        | 'deposits'
        | 'payouts'
        | 'transactions'
        | 'subscriptions'
    >('appointments');

    const routes = [
        {
            name: 'Manage Transactions',
            path: route('admin.transactions'),
            active: false,
        },
    ];

    const handleTabChange = (value: string) => {
        setActiveTab(
            value as
                | 'appointments'
                | 'deposits'
                | 'payouts'
                | 'transactions'
                | 'subscriptions',
        );
    };

    const getTabDisplayText = () => {
        switch (activeTab) {
            case 'appointments':
                return 'Appointments';
            case 'payouts':
                return 'Payout Requests';
            case 'deposits':
                return 'Deposits';
            case 'transactions':
                return 'Transactions';
            case 'subscriptions':
                return 'Subscriptions';
            default:
                return 'Transactions';
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'appointments':
                return <AppointmentsTable appointments={appointments} />;
            case 'deposits':
                return <DepositRequests requests={deposit_requests} />;
            case 'payouts':
                return <PayoutRequests requests={payout_requests} />;
            case 'transactions':
                return <TransactionsTable transactions={transactions} />;
            case 'subscriptions':
                return <SubscriptionsTable subscriptions={subscriptions} />;
            default:
                return <AppointmentsTable appointments={appointments} />;
        }
    };

    return (
        <AdminAccountLayout header="Admin Dashboard">
            <StylistNavigationSteps
                routes={routes}
                sub="Manage transactions and withdrawals"
            >
                <Select value={activeTab} onValueChange={handleTabChange}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder={getTabDisplayText()} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="appointments">
                            Appointments
                        </SelectItem>
                        <SelectItem value="deposits">Deposits</SelectItem>
                        <SelectItem value="payouts">Payout Requests</SelectItem>
                        <SelectItem value="transactions">
                            Transactions
                        </SelectItem>
                        <SelectItem value="subscriptions">
                            Subscriptions
                        </SelectItem>
                    </SelectContent>
                </Select>
            </StylistNavigationSteps>
            <section className="mx-auto max-w-7xl px-5">
                <DashboardMetrics metrics={metrics} />
            </section>
            <section className="mx-auto max-w-7xl px-5">
                {renderTabContent()}
            </section>
        </AdminAccountLayout>
    );
}
