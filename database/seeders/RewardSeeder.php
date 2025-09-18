<?php

namespace Database\Seeders;

use App\Models\Reward;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RewardSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rewards = [
            [
                'name' => 'Welcome Bonus',
                'description' => 'Bonus for signing up',
                'code' => 'WELCOME100',
                'points' => 100,
                'expiry' => now()->addDays(30),
            ],
            [
                'name' => 'Referral Bonus',
                'description' => 'Earn points for referring a friend',
                'code' => 'REFER50',
                'points' => 50,
                'expiry' => now()->addDays(60),
            ],
            [
                'name' => '10% Off Coupon',
                'description' => 'Get 10% off your next appointment',
                'code' => 'SAVE10',
                'points' => 200,
                'expiry' => now()->addDays(90),
            ],
            [
                'name' => 'Free Consultation',
                'description' => 'Get a free consultation with our experts',
                'code' => 'FREECONSULT',
                'points' => 300,
                'expiry' => now()->addDays(45),
            ],
            [
                'name' => '20% Off Premium Service',
                'description' => 'Get 20% off any premium service',
                'code' => 'PREMIUM20',
                'points' => 500,
                'expiry' => now()->addDays(120),
            ],
            [
                'name' => 'Birthday Special',
                'description' => 'Special birthday reward',
                'code' => 'BIRTHDAY25',
                'points' => 250,
                'expiry' => now()->addDays(365),
            ]
        ];

        foreach ($rewards as $reward) {
            Reward::firstOrCreate(
                ['code' => $reward['code']],
                $reward
            );
        }
    }
}
