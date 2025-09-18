<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserReward;
use App\Models\UsedReward;
use App\Models\Reward;
use App\Models\RewardCategory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserRewardsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first user to add rewards to
        $user = User::first();

        if (!$user) {
            $this->command->warn('No users found. Please create a user first.');
            return;
        }

        // Get reward categories
        $bronzeCategory = RewardCategory::where('name', 'Bronze')->first();
        $silverCategory = RewardCategory::where('name', 'Silver')->first();
        $goldCategory = RewardCategory::where('name', 'Gold')->first();

        // Add user rewards for different categories
        UserReward::create([
            'user_id' => $user->id,
            'points' => 150,
            'reward_category_id' => $bronzeCategory->id,
        ]);

        UserReward::create([
            'user_id' => $user->id,
            'points' => 750,
            'reward_category_id' => $silverCategory->id,
        ]);

        UserReward::create([
            'user_id' => $user->id,
            'points' => 1200,
            'reward_category_id' => $goldCategory->id,
        ]);

        // Get some rewards to mark as used
        $welcomeReward = Reward::where('code', 'WELCOME100')->first();
        $referralReward = Reward::where('code', 'REFER50')->first();
        $couponReward = Reward::where('code', 'SAVE10')->first();

        // Add used rewards
        if ($welcomeReward) {
            UsedReward::create([
                'user_id' => $user->id,
                'reward_id' => $welcomeReward->id,
                'code' => $welcomeReward->code,
                'points' => $welcomeReward->points,
            ]);
        }

        if ($referralReward) {
            UsedReward::create([
                'user_id' => $user->id,
                'reward_id' => $referralReward->id,
                'code' => $referralReward->code,
                'points' => $referralReward->points,
            ]);
        }

        if ($couponReward) {
            UsedReward::create([
                'user_id' => $user->id,
                'reward_id' => $couponReward->id,
                'code' => $couponReward->code,
                'points' => $couponReward->points,
            ]);
        }

        $this->command->info('User rewards and used rewards seeded successfully!');
    }
}
