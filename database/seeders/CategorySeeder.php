<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Wig Installation',
                'banner' => 'category/1.png',
                'description' => 'Installation, Styling, Customization'
            ],
            [
                'name' => 'Nail Care',
                'banner' => 'category/2.png',
                'description' => 'Manicure, Pedicure, Designs'
            ],
            [
                'name' => 'Braids',
                'banner' => 'category/6.png',
                'description' => 'Box Braids, Cornrows'
            ],
            [
                'name' => 'Eyebrows & Lashes',
                'banner' => 'category/5.png',
                'description' => 'Shaping, Tinting, Extensions'
            ],
            [
                'name' => 'Make Up',
                'banner' => 'category/9.png',
                'description' => 'Full Glam, Natural Looks'
            ],
            [
                'name' => 'Hair Styling',
                'banner' => 'category/6.png',
                'description' => 'Treatments, Braids, Twists'
            ],
            [
                'name' => 'Locks & Twists',
                'banner' => 'category/8.png',
                'description' => 'Hair Locking, Twists, Maintenance'
            ],
        ];

        foreach ($categories as $category) {
            Category::create([
                'name' => $category['name'],
                'banner' => $category['banner'],
                'description' => $category['description'],
                'status' => true
            ]);
        }
    }
}
