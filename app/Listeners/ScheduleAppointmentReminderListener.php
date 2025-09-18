<?php

namespace App\Listeners;

use App\Events\AppointmentCreated;
use App\Events\AppointmentStatusUpdated;
use App\Jobs\SendAppointmentReminder;
use Carbon\Carbon;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class ScheduleAppointmentReminderListener implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle($event): void
    {
        $appointment = null;

        if ($event instanceof AppointmentCreated) {
            $appointment = $event->appointment;
        } elseif ($event instanceof AppointmentStatusUpdated) {
            $appointment = $event->appointment;
        }

        if (!$appointment || !in_array($appointment->status, ['approved', 'confirmed'])) {
            return;
        }

        $this->scheduleRemindersForAppointment($appointment);
    }

    /**
     * Schedule reminders for a specific appointment
     */
    private function scheduleRemindersForAppointment($appointment): void
    {
        $appointmentDateTime = Carbon::parse($appointment->appointment_date . ' ' . $appointment->appointment_time);
        $now = now();

        // Calculate when to send reminders
        $dayReminderTime = $appointmentDateTime->copy()->subHours(24);
        $hourReminderTime = $appointmentDateTime->copy()->subHour();

        // Schedule day reminder if it's in the future
        if ($dayReminderTime->isFuture() && $dayReminderTime->diffInMinutes($now) > 30) {
            SendAppointmentReminder::dispatch($appointment, 'day')->delay($dayReminderTime);
        }

        // Schedule hour reminder if it's in the future
        if ($hourReminderTime->isFuture() && $hourReminderTime->diffInMinutes($now) > 15) {
            SendAppointmentReminder::dispatch($appointment, 'hour')->delay($hourReminderTime);
        }
    }
}
