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
            [
                'question' => 'How can I delete my account?',
                'answer' => 'You can delete your account directly from within the app. Go to Account → Delete Account and follow the on-screen instructions. Once you confirm, your account will be scheduled for permanent deletion.',
                'category' => 'account',
            ],
            [
                'question' => 'What happens when I delete my account?',
                'answer' => 'Deleting your account permanently removes: Your profile information, Saved data and preferences, Any content associated with your account, Authentication credentials. This action cannot be undone.',
                'category' => 'account',
            ],
            [
                'question' => 'How long does it take to delete my data?',
                'answer' => 'Your account is immediately deactivated, and full data deletion is completed within 7 - 30 days',
                'category' => 'account',
            ],
            [
                'question' => 'Can I recover my account after deleting it?',
                'answer' => 'No. Once the deletion process begins, your data cannot be restored.',
                'category' => 'account',
            ],
            [
                'question' => 'Do I need to uninstall the app after deleting my account?',
                'answer' => 'Uninstalling the app does not delete your account. You must request account deletion through the in-app Delete Account option or via our support team.',
                'category' => 'account',
            ],
            [
                'question' => 'Can I request deletion by email?',
                'answer' => 'Yes. If you cannot access your account, you can request deletion by contacting our support team at support@snipfair.com using the subject “Account Deletion Request”. We may request verification to confirm ownership.',
                'category' => 'account',
            ],
            [
                'question' => 'What data is retained after deletion?',
                'answer' => 'We only retain information required by law (e.g., transaction records for tax/audit purposes). All other personal data is removed permanently.',
                'category' => 'account',
            ],
        ];

        foreach ($faqs as $faq) {
            FAQ::create($faq);
        }
    }
}
