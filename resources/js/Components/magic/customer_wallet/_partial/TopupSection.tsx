import { Plus, Wallet } from 'lucide-react';
import { useState } from 'react';

interface TopupSectionProps {
    onTopupClick: (amount: number) => void;
}

export default function TopupSection({ onTopupClick }: TopupSectionProps) {
    const [customAmount, setCustomAmount] = useState('');

    const predefinedAmounts = [50, 100, 200, 500, 1000];

    const handleCustomTopup = () => {
        const amount = parseFloat(customAmount);
        if (amount > 0) {
            onTopupClick(amount);
            setCustomAmount('');
        }
    };

    return (
        <div className="mb-6 rounded-lg border border-sf-stroke bg-white p-4 shadow-sm md:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Wallet className="h-5 w-5" />
                Top-up Wallet
            </h2>

            {/* Predefined amounts */}
            <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Quick amounts
                </label>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    {predefinedAmounts.map((amount) => (
                        <button
                            key={amount}
                            onClick={() => onTopupClick(amount)}
                            className="rounded-md border border-sf-stroke px-3 py-2 text-sm font-medium transition-colors hover:bg-sf-gradient-purple hover:text-white"
                        >
                            R{amount}
                        </button>
                    ))}
                </div>
            </div>

            {/* Custom amount */}
            <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Custom amount
                </label>
                <div className="flex gap-2">
                    <input
                        type="number"
                        placeholder="Enter amount"
                        className="flex-1 rounded-md border border-sf-stroke px-4 py-2"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        min="1"
                        step="0.01"
                    />
                    <button
                        onClick={handleCustomTopup}
                        disabled={
                            !customAmount || parseFloat(customAmount) <= 0
                        }
                        className="rounded-md bg-sf-gradient-purple px-4 py-2 text-white hover:bg-sf-gradient-pink disabled:opacity-50"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="text-xs text-gray-500">
                Add funds to your wallet for seamless booking payments
            </div>
        </div>
    );
}
