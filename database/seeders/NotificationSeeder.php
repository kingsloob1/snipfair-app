<?php

namespace Database\Seeders;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all users with active status
        $customers = User::where('status', 'active')->get();

        if ($customers->isEmpty()) {
            $this->command->warn('No customers found. Please create customer users first.');
            return;
        }

        $notificationTypes = [
            [
                'title' => "Don't forget your appointment tomorrow at 10:30 AM",
                'description' => 'Your upcoming appointment is scheduled for tomorrow. Please arrive 10 minutes early.',
                'priority' => 'critical',
            ],
            [
                'title' => 'Your appointment has been confirmed',
                'description' => 'Appointment confirmed. Looking forward to seeing you!',
                'priority' => 'normal',
            ],
            [
                'title' => 'Please review your recent appointment',
                'description' => 'Help us improve by sharing your experience.',
                'priority' => 'low',
            ],
            [
                'title' => 'Complete your profile update',
                'description' => 'Updating your profile ensures accurate notifications.',
                'priority' => 'moderate',
            ],
            [
                'title' => 'Payment confirmation',
                'description' => 'Your payment has been processed successfully.',
                'priority' => 'normal',
            ],
            [
                'title' => 'Appointment cancelled',
                'description' => 'Your appointment has been cancelled. Please reschedule at your convenience.',
                'priority' => 'critical',
            ],
        ];

        foreach ($customers as $customer) {
            // Create 2-4 random notifications for each customer
            $numberOfNotifications = rand(2, 4);
            $selectedNotifications = collect($notificationTypes)->random($numberOfNotifications);

            foreach ($selectedNotifications as $index => $notificationData) {
                Notification::create([
                    'user_id' => $customer->id,
                    'type' => $notificationData['type'],
                    'title' => $notificationData['title'],
                    'description' => $notificationData['description'],
                    'priority' => $notificationData['priority'],
                    'is_seen' => $index > 0 ? rand(0, 1) : false, // First notification is always unread, others random
                    'created_at' => now()->subMinutes(rand(30, 1440)), // Random time within last 24 hours
                    'updated_at' => now()->subMinutes(rand(30, 1440)),
                ]);
            }
        }

        $this->command->info('Sample notifications created successfully!');
    }
}
