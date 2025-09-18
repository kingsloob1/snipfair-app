import { cn } from '@/lib/utils';

interface RewardCategory {
    id: number;
    name: string;
    min: number;
    max: number;
    criterion: string;
    criterion_unit: string;
}

interface RewardCardProps {
    totalPoints: number;
    currentTier: RewardCategory | null;
    nextTier: RewardCategory | null;
    pointsToNext: number;
    progressPercentage: number;
    appointmentCount: number;
    lifetimeSpent: number;
}

export default function RewardCard({
    totalPoints,
    currentTier,
    nextTier,
    pointsToNext,
    progressPercentage,
    appointmentCount,
    lifetimeSpent,
}: RewardCardProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
        }).format(amount);
    };

    return (
        <div className="mb-6 space-y-6 rounded-xl bg-gradient-to-r from-sf-gradient-purple to-sf-gradient-pink p-6 font-inter text-white md:space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold md:text-2xl">
                    Your Loyalty Status
                </h2>
                <span className="rounded-full bg-white px-3 py-1 text-sm text-black">
                    {currentTier?.name || 'Bronze'}
                </span>
            </div>
            <div className="grid grid-cols-4 gap-4 pb-4">
                <div className="text-center">
                    <div className="text-xl font-bold md:text-2xl">
                        {totalPoints}
                    </div>
                    <div className="text-xs opacity-90 md:text-sm">Points</div>
                </div>
                <div className="text-center">
                    <div className="text-xl font-bold md:text-2xl">
                        {nextTier ? pointsToNext : 'Max'}
                    </div>
                    <div className="text-xs opacity-90 md:text-sm">
                        {nextTier ? `To ${nextTier.name}` : 'Level'}
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-xl font-bold md:text-2xl">
                        {formatCurrency(lifetimeSpent)}
                    </div>
                    <div className="text-xs opacity-90 md:text-sm">
                        Lifetime Spent
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-xl font-bold md:text-2xl">
                        {appointmentCount}
                    </div>
                    <div className="text-xs opacity-90 md:text-sm">
                        Bookings
                    </div>
                </div>
            </div>
            <div className="relative h-1.5 rounded-full bg-sf-white/30 md:h-2">
                <div
                    className={cn(
                        'absolute left-0 top-0 h-full rounded-full bg-sf-white',
                    )}
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                ></div>
                <div className="absolute -top-6 left-0 text-xs md:text-sm">
                    {currentTier?.name || 'Bronze'}
                </div>
                <div className="absolute -top-6 right-0 text-xs md:text-sm">
                    {nextTier?.name || 'Max Level'}
                </div>
            </div>
        </div>
    );
}
