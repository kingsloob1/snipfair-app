interface WalletStats {
    currentBalance: number;
    totalTopups: number;
    totalRefunds: number;
    pendingTransactions: number;
}

interface WalletCardProps {
    walletBalance: number;
    walletStats: WalletStats;
    pendingAmount: number;
}

export default function WalletCard({
    walletBalance,
    walletStats,
    pendingAmount,
}: WalletCardProps) {
    const formatCurrency = (amount: number) => {
        const formattedAmount = new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
        }).format(amount);
        return formattedAmount.replace(/\s/g, '');
    };

    return (
        <div className="mb-6 space-y-6 rounded-xl bg-gradient-to-r from-sf-gradient-purple to-sf-gradient-pink p-6 font-inter text-white md:space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold md:text-2xl">
                    Your Wallet Balance
                </h2>
                <span className="rounded-full bg-white px-3 py-1 text-sm text-black">
                    Available
                </span>
            </div>

            <div className="mb-4">
                <div className="text-3xl font-bold md:text-4xl">
                    {formatCurrency(walletBalance)}
                </div>
                <div className="text-xs opacity-90 md:text-sm">
                    Current Balance
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-4 md:grid-cols-4">
                <div className="text-center">
                    <div className="text-xl font-bold md:text-2xl">
                        {formatCurrency(walletStats.totalTopups)}
                    </div>
                    <div className="text-xs opacity-90 md:text-sm">
                        Total Top-ups
                    </div>
                </div>
                <div className="hidden text-center md:block">
                    <div className="text-xl font-bold md:text-2xl">
                        {formatCurrency(walletStats.totalRefunds)}
                    </div>
                    <div className="text-xs opacity-90 md:text-sm">
                        Total Refunds
                    </div>
                </div>
                <div className="hidden text-center md:block">
                    <div className="text-xl font-bold md:text-2xl">
                        {formatCurrency(pendingAmount)}
                    </div>
                    <div className="text-xs opacity-90 md:text-sm">Pending</div>
                </div>
                <div className="text-center">
                    <div className="text-xl font-bold md:text-2xl">
                        {walletStats.pendingTransactions}
                    </div>
                    <div className="text-xs opacity-90 md:text-sm">
                        Transactions
                    </div>
                </div>
            </div>
        </div>
    );
}
