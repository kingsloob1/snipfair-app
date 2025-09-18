<?php

namespace Database\Seeders;

use App\Models\RewardCategory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RewardCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Bronze',
                'min' => 0,
                'max' => 499,
                'criterion' => 'appointments_completed',
                'criterion_unit' => 'count',
            ],
            [
                'name' => 'Silver',
                'min' => 500,
                'max' => 999,
                'criterion' => 'appointments_completed',
                'criterion_unit' => 'count',
            ],
            [
                'name' => 'Gold',
                'min' => 1000,
                'max' => 1999,
                'criterion' => 'appointments_completed',
                'criterion_unit' => 'count',
            ],
            [
                'name' => 'Platinum',
                'min' => 2000,
                'max' => 4999,
                'criterion' => 'appointments_completed',
                'criterion_unit' => 'count',
            ],
            [
                'name' => 'Diamond',
                'min' => 5000,
                'max' => 999999,
                'criterion' => 'appointments_completed',
                'criterion_unit' => 'count',
            ]
        ];

        foreach ($categories as $category) {
            RewardCategory::firstOrCreate(
                ['name' => $category['name']],
                $category
            );
        }
    }
}
