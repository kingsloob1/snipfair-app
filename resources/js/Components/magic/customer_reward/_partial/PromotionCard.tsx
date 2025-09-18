import CustomButton from '@/Components/common/CustomButton';
import { Clock, Copy } from 'lucide-react';

interface Reward {
    id: number;
    name: string;
    description: string;
    code: string;
    points: number;
    expiry: string | null;
}

interface PromotionCardProps {
    handleCopy: (item: string) => void;
    availableRewards: Reward[];
}

export default function PromotionCard({
    handleCopy,
    availableRewards,
}: PromotionCardProps) {
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'No expiry';
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(new Date(dateString));
    };

    // Show only first 4 rewards as promotions
    const promotions = availableRewards.slice(0, 4);

    return (
        <div className="mb-6 rounded-lg bg-white p-4 shadow-sm md:p-6">
            <h2 className="mb-4 text-xl font-bold">Active Promotions</h2>
            <div className="mb-6 grid gap-4">
                {promotions.map((reward) => (
                    <div
                        key={reward.id}
                        className="rounded-xl border border-sf-stroke bg-white p-4 transition-all hover:shadow-lg"
                    >
                        <div className="mb-2 flex items-start justify-between">
                            <div>
                                <h3 className="font-semibold">{reward.name}</h3>
                                <p className="text-sm text-gray-600">
                                    {reward.description}
                                </p>
                                <p className="text-sm font-medium text-sf-gradient-purple">
                                    {reward.points} points
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <code className="rounded bg-gray-100 px-2 py-1 text-sm">
                                {reward.code}
                            </code>
                            <div className="flex gap-2">
                                <CustomButton
                                    variant="secondary"
                                    className="rounded-md px-2 py-1.5"
                                    onClick={() => handleCopy(reward.code)}
                                >
                                    <div className="flex gap-2">
                                        <Copy className="h-4 w-4" />
                                        Copy
                                    </div>
                                </CustomButton>
                            </div>
                        </div>
                        <div className="mt-6">
                            <div className="flex items-center gap-1.5 text-xs text-sf-primary-paragraph">
                                <Clock size={12} />
                                Expires {formatDate(reward.expiry)}
                            </div>
                        </div>
                    </div>
                ))}
                {promotions.length === 0 && (
                    <div className="text-center text-gray-500">
                        <p>No active promotions at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
