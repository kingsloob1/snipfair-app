import { Wallet } from '@/Components/magic/customer_wallet/Wallet';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

interface WalletTransaction {
    id: number;
    type: 'topup' | 'refund' | 'payment' | 'deduction';
    amount: number;
    description: string;
    status: 'completed' | 'pending' | 'failed' | 'processing';
    reference: string;
    created_at: string;
    updated_at: string;
}

interface WalletStats {
    currentBalance: number;
    totalTopups: number;
    totalRefunds: number;
    pendingTransactions: number;
}

interface PaymentMethod {
    id: number;
    account_name: string;
    bank_name: string;
    account_number: string;
    routing_number?: string;
}

interface WalletProps {
    walletBalance: number;
    walletStats: WalletStats;
    transactions: WalletTransaction[];
    paymentMethods: PaymentMethod[];
    pendingAmount: number;
}

export default function WalletPage(props: WalletProps) {
    return (
        <AuthenticatedLayout
            showToExplore={false}
            exploreRoute={{ name: 'Back to Explore', path: route('dashboard') }}
        >
            <Head title="Wallet" />
            <section className="mx-auto max-w-7xl px-5 py-2 md:py-4 xl:py-6">
                <h1 className="my-5 font-inter text-2xl font-bold text-sf-black md:text-3xl">
                    Snipfair Wallet
                </h1>
                <Wallet {...props} />
            </section>
        </AuthenticatedLayout>
    );
}
