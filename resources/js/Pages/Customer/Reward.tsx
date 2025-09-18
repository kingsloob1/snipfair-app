import { Rewards } from '@/Components/magic/customer_reward/Rewards';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

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

interface RewardProps {
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

export default function Reward(props: RewardProps) {
    return (
        <AuthenticatedLayout
            showToExplore={false}
            exploreRoute={{ name: 'Back to Explore', path: route('dashboard') }}
        >
            <Head title="Rewards" />
            <section className="mx-auto max-w-7xl px-5 py-2 md:py-4 xl:py-6">
                <h1 className="my-5 font-inter text-2xl font-bold text-sf-black md:text-3xl">
                    Loyalty & Rewards
                </h1>
                <Rewards {...props} />
            </section>
        </AuthenticatedLayout>
    );
}
