import CustomButton from '@/Components/common/CustomButton';
import { ArrowDownRight, ArrowUpRight, Clock, Download } from 'lucide-react';

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

interface TransactionHistoryProps {
    transactions: WalletTransaction[];
}

export default function TransactionHistory({
    transactions,
}: TransactionHistoryProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getTransactionIcon = (type: string) => {
        if (type === 'topup' || type === 'refund') {
            return <ArrowDownRight className="h-4 w-4 text-green-600" />;
        }
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
    };

    const getTransactionColor = (type: string) => {
        if (type === 'topup' || type === 'refund') {
            return 'text-green-600';
        }
        return 'text-red-600';
    };

    const getStatusBadge = (status: string) => {
        const baseClass =
            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium';
        switch (status) {
            case 'completed':
                return `${baseClass} bg-green-100 text-green-800`;
            case 'pending':
                return `${baseClass} bg-yellow-100 text-yellow-800`;
            case 'processing':
                return `${baseClass} bg-blue-100 text-blue-800`;
            case 'failed':
                return `${baseClass} bg-red-100 text-red-800`;
            default:
                return `${baseClass} bg-gray-100 text-gray-800`;
        }
    };

    return (
        <div className="rounded-lg border border-sf-stroke bg-white p-4 shadow-sm md:p-6">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Transaction History</h2>
                <CustomButton
                    onClick={() => {}}
                    fullWidth={false}
                    variant="secondary"
                    className="hidden"
                >
                    <div className="flex gap-2">
                        <Download className="h-4 w-4" />
                        Export
                    </div>
                </CustomButton>
            </div>

            <div className="space-y-3">
                {transactions && transactions.length > 0 ? (
                    transactions.map((transaction) => (
                        <div
                            key={transaction.id}
                            className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50"
                        >
                            <div className="flex items-center gap-3">
                                {getTransactionIcon(transaction.type)}
                                <div>
                                    <div className="font-medium text-sf-black">
                                        {transaction.description ||
                                            `${transaction.type.charAt(0).toUpperCase()}${transaction.type.slice(1)}`}
                                    </div>
                                    <div className="text-xs text-sf-secondary-paragraph">
                                        {formatDate(transaction.created_at)} •{' '}
                                        {transaction.reference}
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div
                                    className={`font-semibold ${getTransactionColor(transaction.type)}`}
                                >
                                    {transaction.type === 'topup' ||
                                    transaction.type === 'refund'
                                        ? '+'
                                        : '-'}
                                    {formatCurrency(transaction.amount)}
                                </div>
                                <div className="mt-1">
                                    <span
                                        className={getStatusBadge(
                                            transaction.status,
                                        )}
                                    >
                                        {transaction.status ===
                                            'processing' && (
                                            <Clock className="mr-1 h-3 w-3" />
                                        )}
                                        {transaction.status
                                            .charAt(0)
                                            .toUpperCase() +
                                            transaction.status.slice(1)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-12 text-center">
                        <Clock className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                        <h3 className="mb-2 text-lg font-medium text-gray-900">
                            No transactions yet
                        </h3>
                        <p className="text-gray-500">
                            Your wallet transaction history will appear here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
