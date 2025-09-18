<?php

namespace App\Console\Commands;

use App\Jobs\SendAppointmentReminder;
use App\Models\Appointment;
use App\Models\AppointmentReminder;
use Carbon\Carbon;
use Illuminate\Console\Command;

class ScheduleAppointmentReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'appointments:schedule-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Schedule appointment reminder emails for 24 hours and 1 hour before appointments';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Scheduling appointment reminders...');

        $dayRemindersScheduled = $this->scheduleDayReminders();
        $hourRemindersScheduled = $this->scheduleHourReminders();

        $this->info("Day reminders scheduled: {$dayRemindersScheduled}");
        $this->info("Hour reminders scheduled: {$hourRemindersScheduled}");
        $this->info('Appointment reminders scheduling completed.');

        return 0;
    }

    /**
     * Schedule reminders for appointments 24 hours away
     */
    private function scheduleDayReminders(): int
    {
        // Get appointments that are 24 hours away (with some tolerance)
        $targetTime = now()->addHours(24);
        $startTime = $targetTime->copy()->subMinutes(30);
        $endTime = $targetTime->copy()->addMinutes(30);

        $appointments = Appointment::with(['customer', 'stylist'])
            ->whereIn('status', ['approved', 'confirmed'])
            ->whereRaw("CONCAT(appointment_date, ' ', appointment_time) BETWEEN ? AND ?", [
                $startTime->format('Y-m-d H:i:s'),
                $endTime->format('Y-m-d H:i:s')
            ])
            ->get();

        $scheduled = 0;

        foreach ($appointments as $appointment) {
            // Check if day reminders have already been sent for this appointment
            $customerReminderSent = AppointmentReminder::where([
                'appointment_id' => $appointment->id,
                'recipient_id' => $appointment->customer_id,
                'recipient_type' => 'customer',
                'reminder_type' => 'day',
            ])->exists();

            $stylistReminderSent = AppointmentReminder::where([
                'appointment_id' => $appointment->id,
                'recipient_id' => $appointment->stylist_id,
                'recipient_type' => 'stylist',
                'reminder_type' => 'day',
            ])->exists();

            if (!$customerReminderSent || !$stylistReminderSent) {
                // Dispatch the job to send reminders
                SendAppointmentReminder::dispatch($appointment, 'day');
                $scheduled++;

                $this->line("Day reminder scheduled for appointment #{$appointment->booking_id}");
            }
        }

        return $scheduled;
    }

    /**
     * Schedule reminders for appointments 1 hour away
     */
    private function scheduleHourReminders(): int
    {
        // Get appointments that are 1 hour away (with some tolerance)
        $targetTime = now()->addHour();
        $startTime = $targetTime->copy()->subMinutes(15);
        $endTime = $targetTime->copy()->addMinutes(15);

        $appointments = Appointment::with(['customer', 'stylist'])
            ->whereIn('status', ['approved', 'confirmed'])
            ->whereRaw("CONCAT(appointment_date, ' ', appointment_time) BETWEEN ? AND ?", [
                $startTime->format('Y-m-d H:i:s'),
                $endTime->format('Y-m-d H:i:s')
            ])
            ->get();

        $scheduled = 0;

        foreach ($appointments as $appointment) {
            // Check if hour reminders have already been sent for this appointment
            $customerReminderSent = AppointmentReminder::where([
                'appointment_id' => $appointment->id,
                'recipient_id' => $appointment->customer_id,
                'recipient_type' => 'customer',
                'reminder_type' => 'hour',
            ])->exists();

            $stylistReminderSent = AppointmentReminder::where([
                'appointment_id' => $appointment->id,
                'recipient_id' => $appointment->stylist_id,
                'recipient_type' => 'stylist',
                'reminder_type' => 'hour',
            ])->exists();

            if (!$customerReminderSent || !$stylistReminderSent) {
                // Dispatch the job to send reminders
                SendAppointmentReminder::dispatch($appointment, 'hour');
                $scheduled++;

                $this->line("Hour reminder scheduled for appointment #{$appointment->booking_id}");
            }
        }

        return $scheduled;
    }
}
