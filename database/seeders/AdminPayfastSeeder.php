<?php

namespace Database\Seeders;

use App\Models\AdminPaymentMethod;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdminPayfastSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        AdminPaymentMethod::create([
            'updated_by'     => 1,
            'account_number' => 'Payfast API',
            'account_name'   => 'Payfast Snipfair',
            'bank_name'      => 'Payfast',
            'routing_number' => 'payfast-onsite',
            'is_default'     => true,
            'is_active'      => true,
        ]);
    }
}
