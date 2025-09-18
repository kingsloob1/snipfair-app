import { useEffect, useState } from 'react';
import TopupSection from './_partial/TopupSection';
import TransactionHistory from './_partial/TransactionHistory';
import WalletCard from './_partial/WalletCard';
import WalletTopupModal from './_partial/WalletTopupModal';

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

interface WalletPageProps {
    walletBalance: number;
    walletStats: WalletStats;
    transactions: WalletTransaction[];
    paymentMethods: PaymentMethod[];
    pendingAmount: number;
}

export const Wallet: React.FC<WalletPageProps> = (props) => {
    const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
    const [duckModal, setDuckModal] = useState(false);
    const [topupAmount, setTopupAmount] = useState(0);

    useEffect(() => {
        if (duckModal && !isTopupModalOpen) setDuckModal(false);
    }, [isTopupModalOpen, duckModal]);

    const handleTopupClick = (amount: number) => {
        setTopupAmount(amount);
        setIsTopupModalOpen(true);
    };

    const handleTopupSuccess = () => {
        setIsTopupModalOpen(false);
        setDuckModal(false);
        // Refresh the page data - in a real app you'd update the state
        // window.location.reload();
    };

    return (
        <>
            <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="col-span-1 lg:col-span-2">
                    <div className="sticky top-10">
                        <WalletCard
                            walletBalance={props.walletBalance}
                            walletStats={props.walletStats}
                            pendingAmount={props.pendingAmount}
                        />
                        <TopupSection onTopupClick={handleTopupClick} />
                    </div>
                </div>
                <div>
                    <div className="sticky top-10">
                        <TransactionHistory transactions={props.transactions} />
                    </div>
                </div>
            </div>

            <WalletTopupModal
                isOpen={isTopupModalOpen}
                onClose={() => {
                    setDuckModal(true);
                    setTimeout(() => setIsTopupModalOpen(false), 10000);
                }}
                amount={topupAmount}
                onTopupSuccess={handleTopupSuccess}
                duckModal={duckModal}
            />
        </>
    );
};
