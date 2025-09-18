<?php

namespace Database\Seeders;

use App\Models\AdminPaymentMethod;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdminPaymentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        AdminPaymentMethod::create([
            'updated_by'     => 1,
            'account_number' => '1234567890',
            'account_name'   => 'Admin Primary',
            'bank_name'      => 'Zenith Bank',
            'routing_number' => 'ZEN12345',
            'is_default'     => true,
            'is_active'      => true,
        ]);

        AdminPaymentMethod::create([
            'updated_by'     => 1,
            'account_number' => '0987654321',
            'account_name'   => 'Admin Secondary',
            'bank_name'      => 'GTBank',
            'routing_number' => 'GTB98765',
            'is_default'     => false,
            'is_active'      => true,
        ]);

        AdminPaymentMethod::create([
            'updated_by'     => 1,
            'account_number' => '1122334455',
            'account_name'   => 'Admin Tertiary',
            'bank_name'      => 'Access Bank',
            'routing_number' => 'ACC55667',
            'is_default'     => false,
            'is_active'      => false,
        ]);
    }
}
