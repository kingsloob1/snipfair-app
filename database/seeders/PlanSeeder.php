<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Plan::insert([
            [
                'name' => 'Free Plan',
                'description' => 'Access to basic features.',
                'amount' => 0.00,
                'duration' => 0, // 0 means unlimited
                'created_at' => now(), 'updated_at' => now(),
                'status' => true,
            ],
            [
                'name' => 'Basic Plan',
                'description' => 'Includes standard appointments and features.',
                'amount' => 9.99,
                'duration' => 30,
                'created_at' => now(), 'updated_at' => now(),
                'status' => true,
            ],
            [
                'name' => 'Premium Plan',
                'description' => 'All features unlocked with priority support.',
                'amount' => 29.99,
                'duration' => 30,
                'created_at' => now(), 'updated_at' => now(),
                'status' => true,
            ]
        ]);
    }
}
