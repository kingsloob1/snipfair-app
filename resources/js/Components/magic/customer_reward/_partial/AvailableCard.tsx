import CustomButton from '@/Components/common/CustomButton';
import { useForm } from '@inertiajs/react';
import { Clock, Copy } from 'lucide-react';

interface Reward {
    id: number;
    name: string;
    description: string;
    code: string;
    points: number;
    expiry: string | null;
}

interface UsedReward {
    id: number;
    user_id: number;
    reward_id: number;
    code: string;
    points: number;
    reward: Reward;
    created_at: string;
    updated_at: string;
}

interface AvailableCardProps {
    handleCopy: (item: string) => void;
    availableRewards: Reward[];
    usedRewards: UsedReward[];
}

export default function AvailableCard({
    handleCopy,
    availableRewards,
    usedRewards,
}: AvailableCardProps) {
    const { setData, post, processing } = useForm({
        reward_id: 0,
    });

    const handleUseReward = (rewardId: number) => {
        setData('reward_id', rewardId);
        post(route('customer.rewards.use'));
    };

    const isRewardUsed = (rewardId: number) => {
        return usedRewards.some((used) => used.reward_id === rewardId);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'No expiry';
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(new Date(dateString));
    };

    return (
        <div className="mb-6 rounded-lg bg-white p-4 shadow-sm md:p-6">
            <h2 className="mb-4 text-xl font-bold">Available Rewards</h2>
            <div className="mb-6 grid gap-4 md:grid-cols-2">
                {availableRewards.map((reward) => {
                    const used = isRewardUsed(reward.id);
                    return (
                        <div
                            key={reward.id}
                            className="rounded-xl border border-sf-stroke bg-white p-4 transition-all hover:shadow-lg"
                        >
                            <div className="mb-2 flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold">
                                        {reward.name}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {reward.description}
                                    </p>
                                    <p className="text-sm font-medium text-sf-gradient-purple">
                                        {reward.points} points
                                    </p>
                                </div>
                                {used && (
                                    <span className="rounded-md bg-sf-white-card p-1.5 text-xs text-gray-500">
                                        Used
                                    </span>
                                )}
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
                                    {!used && (
                                        <CustomButton
                                            className="rounded-md px-3 py-1.5"
                                            fullWidth={false}
                                            disabled={processing}
                                            onClick={() =>
                                                handleUseReward(reward.id)
                                            }
                                        >
                                            {processing ? 'Using...' : 'Use'}
                                        </CustomButton>
                                    )}
                                </div>
                            </div>
                            <div className="mt-6">
                                <div className="flex items-center gap-1.5 text-xs text-sf-primary-paragraph">
                                    <Clock size={12} />
                                    Expires {formatDate(reward.expiry)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {availableRewards.length === 0 && (
                <div className="text-center text-gray-500">
                    <p>No rewards available at the moment.</p>
                    <p className="text-sm">Check back later for new rewards!</p>
                </div>
            )}
        </div>
    );
}
