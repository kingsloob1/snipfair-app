<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use App\Models\AppointmentReminder;
use Carbon\Carbon;
use Illuminate\Console\Command;

class ReminderSystemStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'appointments:reminder-status';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Show the current status of the appointment reminder system';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('=== APPOINTMENT REMINDER SYSTEM STATUS ===');
        $this->newLine();

        // Overall statistics
        $this->showOverallStats();
        $this->newLine();

        // Upcoming appointments
        $this->showUpcomingAppointments();
        $this->newLine();

        // Recent reminders
        $this->showRecentReminders();
        $this->newLine();

        // System health
        $this->showSystemHealth();

        return 0;
    }

    private function showOverallStats()
    {
        $this->info('📊 OVERALL STATISTICS');

        $totalReminders = AppointmentReminder::count();
        $dayReminders = AppointmentReminder::where('reminder_type', 'day')->count();
        $hourReminders = AppointmentReminder::where('reminder_type', 'hour')->count();
        $todayReminders = AppointmentReminder::whereDate('sent_at', today())->count();

        $this->table(
            ['Metric', 'Count'],
            [
                ['Total reminders sent', $totalReminders],
                ['Day reminders (24hr)', $dayReminders],
                ['Hour reminders (1hr)', $hourReminders],
                ['Reminders sent today', $todayReminders],
            ]
        );
    }

    private function showUpcomingAppointments()
    {
        $this->info('📅 UPCOMING APPOINTMENTS (Next 7 Days)');

        $upcoming = Appointment::with(['customer', 'stylist'])
            ->whereIn('status', ['approved', 'confirmed'])
            ->where('appointment_date', '>=', now()->toDateString())
            ->where('appointment_date', '<=', now()->addDays(7)->toDateString())
            ->orderBy('appointment_date')
            ->orderBy('appointment_time')
            ->get();

        if ($upcoming->isEmpty()) {
            $this->line('No upcoming appointments in the next 7 days.');
            return;
        }

        $this->table(
            ['ID', 'Date', 'Time', 'Customer', 'Stylist', 'Status', 'Day Reminder', 'Hour Reminder'],
            $upcoming->map(function ($apt) {
                $dayReminderSent = AppointmentReminder::where([
                    'appointment_id' => $apt->id,
                    'reminder_type' => 'day'
                ])->exists();

                $hourReminderSent = AppointmentReminder::where([
                    'appointment_id' => $apt->id,
                    'reminder_type' => 'hour'
                ])->exists();

                return [
                    $apt->id,
                    $apt->appointment_date,
                    Carbon::parse($apt->appointment_time)->format('g:i A'),
                    $apt->customer->name ?? 'N/A',
                    $apt->stylist->name ?? 'N/A',
                    $apt->status,
                    $dayReminderSent ? '✓' : '✗',
                    $hourReminderSent ? '✓' : '✗',
                ];
            })
        );
    }

    private function showRecentReminders()
    {
        $this->info('📧 RECENT REMINDERS (Last 24 Hours)');

        $recent = AppointmentReminder::with(['appointment', 'recipient'])
            ->where('sent_at', '>=', now()->subDay())
            ->orderBy('sent_at', 'desc')
            ->take(10)
            ->get();

        if ($recent->isEmpty()) {
            $this->line('No reminders sent in the last 24 hours.');
            return;
        }

        $this->table(
            ['Appointment ID', 'Recipient', 'Type', 'Reminder Type', 'Sent At'],
            $recent->map(function ($reminder) {
                return [
                    $reminder->appointment_id,
                    ($reminder->recipient->name ?? 'N/A') . ' (' . $reminder->recipient_type . ')',
                    ucfirst($reminder->recipient_type),
                    ucfirst($reminder->reminder_type),
                    $reminder->sent_at->format('M j, Y g:i A'),
                ];
            })
        );
    }

    private function showSystemHealth()
    {
        $this->info('🔧 SYSTEM HEALTH');

        // Check for appointments needing day reminders
        $needDayReminders = Appointment::whereIn('status', ['approved', 'confirmed'])
            ->whereRaw("CONCAT(appointment_date, ' ', appointment_time) BETWEEN ? AND ?", [
                now()->addHours(23)->addMinutes(30)->format('Y-m-d H:i:s'),
                now()->addHours(24)->addMinutes(30)->format('Y-m-d H:i:s')
            ])
            ->whereDoesntHave('reminders', function($query) {
                $query->where('reminder_type', 'day');
            })
            ->count();

        // Check for appointments needing hour reminders
        $needHourReminders = Appointment::whereIn('status', ['approved', 'confirmed'])
            ->whereRaw("CONCAT(appointment_date, ' ', appointment_time) BETWEEN ? AND ?", [
                now()->addMinutes(45)->format('Y-m-d H:i:s'),
                now()->addMinutes(75)->format('Y-m-d H:i:s')
            ])
            ->whereDoesntHave('reminders', function($query) {
                $query->where('reminder_type', 'hour');
            })
            ->count();

        $oldRecords = AppointmentReminder::where('created_at', '<', now()->subDays(30))->count();

        $this->table(
            ['Check', 'Result', 'Status'],
            [
                ['Appointments needing day reminders', $needDayReminders, $needDayReminders > 0 ? '⚠️ Action needed' : '✅ OK'],
                ['Appointments needing hour reminders', $needHourReminders, $needHourReminders > 0 ? '⚠️ Action needed' : '✅ OK'],
                ['Old reminder records (>30 days)', $oldRecords, $oldRecords > 100 ? '⚠️ Consider cleanup' : '✅ OK'],
            ]
        );

        if ($needDayReminders > 0 || $needHourReminders > 0) {
            $this->newLine();
            $this->warn('💡 Run "php artisan appointments:schedule-reminders" to process pending reminders.');
        }
    }
}
