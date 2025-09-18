<?php

namespace Database\Seeders;

use App\Models\WebsiteConfiguration;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class WebsiteConfigurationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        WebsiteConfiguration::updateOrCreate(
            ['id' => 1],
            [
                'terms' => '<h2>Terms of Service</h2><p>Welcome to our platform. These are the terms...</p>',
                'privacy_policy' => '<h2>Privacy Policy</h2><p>We respect your privacy...</p>',
                'cookies' => '<h2>Cookies Policy</h2><p>This site uses cookies to enhance experience...</p>',
                'email_verification' => true,
                'two_factor_auth' => false,
                'min_booking_amount' => 5.00,
                'max_booking_amount' => 100.00,
                'allow_registration_stylists' => true,
                'allow_registration_customers' => true,
                'maintenance_mode' => false,
                'maintenance_message' => null,
                'email_notifications' => true,
                'push_notifications' => true,
                'system_alerts' => true,
                'payment_alerts' => true,
                'content_moderation' => true,
                'appointment_reschedule_threshold' => 3,
                'appointment_reschedule_percentage' => 10.00,
                'appointment_canceling_threshold' => 24,
                'appointment_canceling_percentage' => 50.00,
            ]
        );
    }
}
