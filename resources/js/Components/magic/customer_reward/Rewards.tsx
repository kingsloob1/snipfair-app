import { useForm } from '@inertiajs/react';
import { Tag } from 'lucide-react';
import React from 'react';
import AvailableCard from './_partial/AvailableCard';
import HowTo from './_partial/HowTo';
import PromotionCard from './_partial/PromotionCard';
import RewardCard from './_partial/RewardCard';

interface UserReward {
    id: number;
    user_id: number;
    points: number;
    reward_category_id: number;
    reward_category: RewardCategory;
    created_at: string;
    updated_at: string;
}

interface RewardCategory {
    id: number;
    name: string;
    min: number;
    max: number;
    criterion: string;
    criterion_unit: string;
    created_at: string;
    updated_at: string;
}

interface Reward {
    id: number;
    name: string;
    description: string;
    code: string;
    points: number;
    expiry: string | null;
    created_at: string;
    updated_at: string;
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

interface LoyaltyPageProps {
    userReward: UserReward | null;
    totalPoints: number;
    currentTier: RewardCategory | null;
    nextTier: RewardCategory | null;
    pointsToNext: number;
    progressPercentage: number;
    availableRewards: Reward[];
    usedRewards: UsedReward[];
    rewardCategories: RewardCategory[];
    appointmentCount: number;
    lifetimeSpent: number;
}

export const Rewards: React.FC<LoyaltyPageProps> = (props) => {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const handleRedeemCode = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('customer.rewards.redeem'), {
            onSuccess: () => {
                setData('code', '');
            },
        });
    };

    return (
        <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="col-span-1 lg:col-span-2">
                <div className="sticky top-10">
                    <RewardCard
                        totalPoints={props.totalPoints}
                        currentTier={props.currentTier}
                        nextTier={props.nextTier}
                        pointsToNext={props.pointsToNext}
                        progressPercentage={props.progressPercentage}
                        appointmentCount={props.appointmentCount}
                        lifetimeSpent={props.lifetimeSpent}
                    />
                    <div className="mb-6 rounded-lg border border-sf-stroke bg-white p-4 shadow-sm md:p-6">
                        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                            <Tag className="h-5 w-5" />
                            Redeem Promo Code
                        </h2>
                        <form
                            onSubmit={handleRedeemCode}
                            className="flex gap-2"
                        >
                            <input
                                type="text"
                                placeholder="Enter promo code"
                                className="flex-1 rounded-md border px-4 py-2"
                                value={data.code}
                                onChange={(e) =>
                                    setData('code', e.target.value)
                                }
                            />
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-md bg-sf-gradient-purple px-4 py-2 text-white hover:bg-sf-gradient-pink disabled:opacity-50"
                            >
                                {processing ? 'Redeeming...' : 'Redeem'}
                            </button>
                        </form>
                        {errors.code && (
                            <p className="mt-2 text-sm text-red-600">
                                {errors.code}
                            </p>
                        )}
                    </div>
                    <AvailableCard
                        handleCopy={handleCopy}
                        availableRewards={props.availableRewards}
                        usedRewards={props.usedRewards}
                    />
                </div>
            </div>
            <div>
                <div className="sticky top-10">
                    <PromotionCard
                        handleCopy={handleCopy}
                        availableRewards={props.availableRewards}
                    />
                    <HowTo />
                </div>
            </div>
        </div>
    );
};
