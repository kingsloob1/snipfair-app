<?php

namespace App\Http\Controllers;

use App\Models\Reward;
use App\Models\RewardCategory;
use App\Models\UserReward;
use App\Models\UsedReward;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RewardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Get user's reward category and points
        $userReward = UserReward::with('rewardCategory')
            ->where('user_id', $user->id)
            ->orderBy('points', 'desc')
            ->first();

        // Get all available rewards
        $availableRewards = Reward::whereNull('deleted_at')
            ->orderBy('points', 'asc')
            ->get();

        // Get user's used rewards
        $usedRewards = UsedReward::with('reward')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        // Get all reward categories for tier display
        $rewardCategories = RewardCategory::orderBy('min', 'asc')->get();

        // Calculate total points from all user rewards
        $totalPoints = UserReward::where('user_id', $user->id)->sum('points');

        // Find current tier and next tier
        $currentTier = $rewardCategories->where('min', '<=', $totalPoints)
            ->where('max', '>=', $totalPoints)
            ->first();

        $nextTier = $rewardCategories->where('min', '>', $totalPoints)->first();

        // Calculate progress to next tier
        $progressPercentage = 0;
        $pointsToNext = 0;

        if ($currentTier && $nextTier) {
            $pointsToNext = $nextTier->min - $totalPoints;
            $tierRange = $nextTier->min - $currentTier->min;
            $currentProgress = $totalPoints - $currentTier->min;
            $progressPercentage = $tierRange > 0 ? ($currentProgress / $tierRange) * 100 : 0;
        }

        // Get user's appointment count and lifetime spending
        $appointmentCount = $user->customerAppointments()->count() ?? 0;
        $lifetimeSpent = $user->customerAppointments()->sum('amount') ?? 0;

        return Inertia::render('Customer/Reward', [
            'userReward' => $userReward,
            'totalPoints' => $totalPoints,
            'currentTier' => $currentTier,
            'nextTier' => $nextTier,
            'pointsToNext' => $pointsToNext,
            'progressPercentage' => round($progressPercentage, 1),
            'availableRewards' => $availableRewards,
            'usedRewards' => $usedRewards,
            'rewardCategories' => $rewardCategories,
            'appointmentCount' => $appointmentCount,
            'lifetimeSpent' => $lifetimeSpent,
        ]);
    }

    public function redeemPromoCode(Request $request)
    {
        $request->validate([
            'code' => 'required|string'
        ]);

        $user = Auth::user();
        $code = strtoupper($request->code);

        // Check if reward exists and is not expired
        $reward = Reward::where('code', $code)
            ->whereNull('deleted_at')
            ->where(function($query) {
                $query->whereNull('expiry')
                    ->orWhere('expiry', '>', now());
            })
            ->first();

        if (!$reward) {
            return back()->withErrors(['code' => 'Invalid or expired promo code']);
        }

        // Check if user has already used this reward
        $alreadyUsed = UsedReward::where('user_id', $user->id)
            ->where('reward_id', $reward->id)
            ->exists();

        if ($alreadyUsed) {
            return back()->withErrors(['code' => 'You have already used this promo code']);
        }

        // Add reward to used rewards
        UsedReward::create([
            'user_id' => $user->id,
            'reward_id' => $reward->id,
            'code' => $reward->code,
            'points' => $reward->points,
        ]);

        // Add points to user's reward
        $userReward = UserReward::where('user_id', $user->id)->first();

        if (!$userReward) {
            // Create first user reward in Bronze category
            $bronzeCategory = RewardCategory::where('name', 'Bronze')->first();
            UserReward::create([
                'user_id' => $user->id,
                'points' => $reward->points,
                'reward_category_id' => $bronzeCategory->id,
            ]);
        } else {
            $userReward->increment('points', $reward->points);

            // Check if user should be upgraded to a higher tier
            $totalPoints = UserReward::where('user_id', $user->id)->sum('points');
            $newCategory = RewardCategory::where('min', '<=', $totalPoints)
                ->where('max', '>=', $totalPoints)
                ->first();

            if ($newCategory && $newCategory->id != $userReward->reward_category_id) {
                $userReward->update(['reward_category_id' => $newCategory->id]);
            }
        }

        return back()->with('success', "Promo code redeemed! You earned {$reward->points} points.");
    }

    public function useReward(Request $request)
    {
        $request->validate([
            'reward_id' => 'required|exists:rewards,id'
        ]);

        $user = Auth::user();
        $reward = Reward::findOrFail($request->reward_id);

        // Check if user has enough points
        $totalPoints = UserReward::where('user_id', $user->id)->sum('points');

        if ($totalPoints < $reward->points) {
            return back()->withErrors(['message' => 'Insufficient points to redeem this reward']);
        }

        // Check if user has already used this reward
        $alreadyUsed = UsedReward::where('user_id', $user->id)
            ->where('reward_id', $reward->id)
            ->exists();

        if ($alreadyUsed) {
            return back()->withErrors(['message' => 'You have already used this reward']);
        }

        // Deduct points from user's reward
        $userReward = UserReward::where('user_id', $user->id)
            ->orderBy('points', 'desc')
            ->first();

        if ($userReward) {
            $userReward->decrement('points', $reward->points);
        }

        // Add to used rewards
        UsedReward::create([
            'user_id' => $user->id,
            'reward_id' => $reward->id,
            'code' => $reward->code,
            'points' => $reward->points,
        ]);

        return back()->with('success', "Reward redeemed successfully!");
    }
}
