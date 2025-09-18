<?php

namespace Database\Seeders;

use App\Models\FAQ;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class FAQSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        $faqs = [
            [
                'question' => 'How do I book an appointment?',
                'answer' => 'You can book an appointment by browsing our stylists, selecting your preferred stylist, choosing an available time slot, and completing the booking process.',
                'category' => 'booking',
            ],
            [
                'question' => 'What payment methods do you accept?',
                'answer' => 'We accept all major credit cards, debit cards, and digital payment methods including PayPal and Apple Pay.',
                'category' => 'payment',
            ],
            [
                'question' => 'How do I become a stylist on the platform?',
                'answer' => 'To become a stylist, you need to create an account, complete your profile with your qualifications and portfolio, and wait for admin approval.',
                'category' => 'stylist',
            ],
            [
                'question' => 'Can I cancel my appointment?',
                'answer' => 'Yes, you can cancel your appointment up to 24 hours before the scheduled time. Cancellations made less than 24 hours in advance may incur a cancellation fee.',
                'category' => 'booking',
            ],
            [
                'question' => 'How do I contact customer support?',
                'answer' => 'You can contact our customer support through the help section in your account, via email at support@snipfair.com, or through our live chat feature.',
                'category' => 'general',
            ],
        ];

        foreach ($faqs as $faq) {
            FAQ::create($faq);
        }
    }
}
