<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Transaction;
use App\Models\AppointmentPouch;
use Illuminate\Database\Seeder;

class WalletTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first customer user (assuming we have one)
        $customer = User::where('role', 'customer')->first();

        if (!$customer) {
            $this->command->info('No customer user found. Please create a customer user first.');
            return;
        }

        // Set initial wallet balance
        $customer->update(['balance' => 150.00]);

        // Create sample wallet transactions
        $transactions = [
            [
                'user_id' => $customer->id,
                'ref' => 'WALLET-TOPUP-' . time() . '-1',
                'amount' => 100.00,
                'type' => 'topup',
                'status' => 'completed',
                'description' => 'Wallet top-up via Zenith Bank',
                'created_at' => now()->subDays(5),
                'updated_at' => now()->subDays(5),
            ],
            [
                'user_id' => $customer->id,
                'ref' => 'WALLET-TOPUP-' . (time() + 1) . '-2',
                'amount' => 50.00,
                'type' => 'topup',
                'status' => 'completed',
                'description' => 'Wallet top-up via GTBank',
                'created_at' => now()->subDays(3),
                'updated_at' => now()->subDays(3),
            ],
            [
                'user_id' => $customer->id,
                'ref' => 'REFUND-' . (time() + 2) . '-3',
                'amount' => 25.00,
                'type' => 'refund',
                'status' => 'completed',
                'description' => 'Refund for canceled appointment',
                'created_at' => now()->subDays(2),
                'updated_at' => now()->subDays(2),
            ],
            [
                'user_id' => $customer->id,
                'ref' => 'PAYMENT-' . (time() + 3) . '-4',
                'amount' => 75.00,
                'type' => 'payment',
                'status' => 'completed',
                'description' => 'Payment for styling appointment',
                'created_at' => now()->subDays(1),
                'updated_at' => now()->subDays(1),
            ],
            [
                'user_id' => $customer->id,
                'ref' => 'WALLET-TOPUP-' . (time() + 4) . '-5',
                'amount' => 30.00,
                'type' => 'topup',
                'status' => 'processing',
                'description' => 'Wallet top-up via Access Bank',
                'created_at' => now()->subHours(2),
                'updated_at' => now()->subHours(2),
            ],
        ];

        foreach ($transactions as $transaction) {
            Transaction::create($transaction);
        }

        // Create a sample pending appointment pouch
        AppointmentPouch::create([
            'user_id' => $customer->id,
            'appointment_id' => null, // You might need to create a sample appointment
            'amount' => 40.00,
            'status' => 'holding',
            'admin_note' => 'Funds held for upcoming appointment',
        ]);

        $this->command->info('Sample wallet data created successfully!');
        $this->command->info("Customer: {$customer->name} ({$customer->email})");
        $this->command->info("Wallet Balance: \${$customer->fresh()->balance}");
        $this->command->info('Sample transactions: 5 created');
        $this->command->info('Pending amount: $40.00');
    }
}
