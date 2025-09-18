<?php

namespace App\Console\Commands;

use App\Jobs\SendAppointmentReminder;
use App\Models\Appointment;
use App\Models\AppointmentReminder;
use Illuminate\Console\Command;

class TestReminderSystem extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'appointments:test-reminders {appointment_id? : The appointment ID to test}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test the appointment reminder system with a specific appointment';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $appointmentId = $this->argument('appointment_id');

        if (!$appointmentId) {
            // Show available appointments
            $appointments = Appointment::with(['customer', 'stylist'])
                ->whereIn('status', ['approved', 'confirmed'])
                ->where('appointment_date', '>=', now()->toDateString())
                ->take(10)
                ->get();

            if ($appointments->isEmpty()) {
                $this->warn('No eligible appointments found for testing.');
                $this->info('Appointments must have status "approved" or "confirmed" and be in the future.');
                return 1;
            }

            $this->info('Available appointments for testing:');
            $this->table(
                ['ID', 'Booking ID', 'Customer', 'Stylist', 'Date', 'Time', 'Status'],
                $appointments->map(function ($apt) {
                    return [
                        $apt->id,
                        $apt->booking_id,
                        $apt->customer->name ?? 'N/A',
                        $apt->stylist->name ?? 'N/A',
                        $apt->appointment_date,
                        $apt->appointment_time,
                        $apt->status,
                    ];
                })
            );

            $appointmentId = $this->ask('Enter the appointment ID to test');
        }

        $appointment = Appointment::with(['customer', 'stylist'])
            ->find($appointmentId);

        if (!$appointment) {
            $this->error("Appointment with ID {$appointmentId} not found.");
            return 1;
        }

        if (!in_array($appointment->status, ['approved', 'confirmed'])) {
            $this->error("Appointment status must be 'approved' or 'confirmed'. Current status: {$appointment->status}");
            return 1;
        }

        $this->info("Testing reminder system for appointment #{$appointment->booking_id}");
        $this->info("Customer: {$appointment->customer->name}");
        $this->info("Stylist: {$appointment->stylist->name}");
        $this->info("Date/Time: {$appointment->appointment_date} at {$appointment->appointment_time}");

        // Test day reminder
        $this->info("\n--- Testing Day Reminder (24hr) ---");
        $this->testReminderType($appointment, 'day');

        // Test hour reminder
        $this->info("\n--- Testing Hour Reminder (1hr) ---");
        $this->testReminderType($appointment, 'hour');

        $this->info("\nTest completed! Check your email and the appointment_reminders table.");

        return 0;
    }

    private function testReminderType($appointment, $type)
    {
        // Check existing reminders
        $customerReminder = AppointmentReminder::where([
            'appointment_id' => $appointment->id,
            'recipient_id' => $appointment->customer_id,
            'recipient_type' => 'customer',
            'reminder_type' => $type,
        ])->first();

        $stylistReminder = AppointmentReminder::where([
            'appointment_id' => $appointment->id,
            'recipient_id' => $appointment->stylist_id,
            'recipient_type' => 'stylist',
            'reminder_type' => $type,
        ])->first();

        if ($customerReminder) {
            $this->line("Customer {$type} reminder already sent at: {$customerReminder->sent_at}");
        } else {
            $this->line("Customer {$type} reminder: NOT SENT");
        }

        if ($stylistReminder) {
            $this->line("Stylist {$type} reminder already sent at: {$stylistReminder->sent_at}");
        } else {
            $this->line("Stylist {$type} reminder: NOT SENT");
        }

        if (!$customerReminder || !$stylistReminder) {
            if ($this->confirm("Send {$type} reminder now?", true)) {
                SendAppointmentReminder::dispatch($appointment, $type);
                $this->info("✓ {$type} reminder job dispatched!");
            }
        }
    }
}
