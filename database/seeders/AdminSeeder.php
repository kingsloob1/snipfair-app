<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Admin::create([
            'name' => 'Super Administrator',
            'email' => 'admin@snipfair.com',
            'password' => '1Password.123',
            'role' => 'super-admin',
            'is_active' => true,
        ]);
    }
}
