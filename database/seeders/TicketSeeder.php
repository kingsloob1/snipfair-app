<?php

namespace Database\Seeders;

use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\User;
use App\Models\Admin;
use Illuminate\Database\Seeder;

class TicketSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some users to create tickets for
        $users = User::take(5)->get();
        $admin = Admin::first(); // Assuming there's at least one admin

        if ($users->isEmpty()) {
            $this->command->info('No users found. Please seed users first.');
            return;
        }

        $ticketData = [
            [
                'subject' => 'Payment not processed',
                'description' => 'I made a payment yesterday but it hasn\'t been processed yet. Can you please help?',
                'priority' => 'high',
                'status' => 'open',
            ],
            [
                'subject' => 'Unable to book appointment',
                'description' => 'The booking system seems to be broken. When I try to select a time slot, it doesn\'t respond.',
                'priority' => 'medium',
                'status' => 'in_progress',
            ],
            [
                'subject' => 'Account verification issue',
                'description' => 'I uploaded my documents but my account is still not verified. How long does this usually take?',
                'priority' => 'low',
                'status' => 'open',
            ],
            [
                'subject' => 'Urgent: Cannot access my account',
                'description' => 'I forgot my password and the reset email is not arriving. I have an important appointment tomorrow.',
                'priority' => 'risky',
                'status' => 'closed',
            ],
            [
                'subject' => 'Stylist cancellation policy',
                'description' => 'What is the policy when a stylist cancels an appointment at the last minute?',
                'priority' => 'low',
                'status' => 'pending',
            ],
        ];

        foreach ($ticketData as $index => $data) {
            $user = $users[$index % $users->count()];
            
            $ticket = Ticket::create([
                'user_id' => $user->id,
                'subject' => $data['subject'],
                'description' => $data['description'],
                'priority' => $data['priority'],
                'status' => $data['status'],
                'assigned_to' => $admin ? $admin->id : null,
                'resolved_at' => $data['status'] === 'closed' ? now()->subHours(rand(1, 24)) : null,
            ]);

            // Create initial message from user
            TicketMessage::create([
                'ticket_id' => $ticket->id,
                'sender_type' => User::class,
                'sender_id' => $user->id,
                'message' => $data['description'],
            ]);

            // Add some admin responses for some tickets
            if (in_array($data['status'], ['in_progress', 'closed']) && $admin) {
                TicketMessage::create([
                    'ticket_id' => $ticket->id,
                    'sender_type' => Admin::class,
                    'sender_id' => $admin->id,
                    'message' => $this->getAdminResponse($data['subject']),
                ]);
            }
        }

        $this->command->info('Sample tickets created successfully!');
    }

    private function getAdminResponse(string $subject): string
    {
        $responses = [
            'Payment not processed' => 'Hi there! I\'ve checked your payment and it\'s being processed. You should see it reflected in your account within 24 hours.',
            'Unable to book appointment' => 'Thank you for reporting this issue. Our technical team is working on fixing the booking system. I\'ll update you once it\'s resolved.',
            'Account verification issue' => 'I\'ve expedited your verification process. You should receive confirmation within the next few hours.',
            'Urgent: Cannot access my account' => 'I\'ve manually reset your password and sent you a new reset link. Please check your email and spam folder.',
            'Stylist cancellation policy' => 'According to our policy, if a stylist cancels within 24 hours, you\'re entitled to a full refund or priority rebooking.',
        ];

        return $responses[$subject] ?? 'Thank you for contacting us. We\'re looking into your request and will get back to you shortly.';
    }
}
