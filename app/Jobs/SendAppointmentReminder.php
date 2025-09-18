<?php

namespace App\Jobs;

use App\Mail\AppointmentReminderEmail;
use App\Models\Appointment;
use App\Models\AppointmentReminder;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendAppointmentReminder implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $appointment;
    protected $reminderType;

    /**
     * Create a new job instance.
     */
    public function __construct(Appointment $appointment, string $reminderType)
    {
        $this->appointment = $appointment;
        $this->reminderType = $reminderType; // 'day' or 'hour'
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Check if appointment still exists and is valid
        if (!$this->appointment || !in_array($this->appointment->status, ['approved', 'confirmed'])) {
            return;
        }

        // Load necessary relationships
        $this->appointment->load(['customer', 'stylist']);

        // Send reminder to customer
        $this->sendReminderToRecipient($this->appointment->customer, 'customer', $this->appointment->stylist);

        // Send reminder to stylist
        $this->sendReminderToRecipient($this->appointment->stylist, 'stylist', $this->appointment->customer);
    }

    /**
     * Send reminder email to a specific recipient
     */
    private function sendReminderToRecipient($recipient, $recipientType, $otherParty): void
    {
        // Check if this exact reminder has already been sent
        $reminderExists = AppointmentReminder::where([
            'appointment_id' => $this->appointment->id,
            'recipient_id' => $recipient->id,
            'recipient_type' => $recipientType,
            'reminder_type' => $this->reminderType,
        ])->exists();

        if ($reminderExists) {
            // Reminder already sent, skip
            return;
        }

        // Send the email
        Mail::to($recipient->email)->send(new AppointmentReminderEmail(
            $this->appointment,
            $recipient,
            $recipientType,
            $otherParty,
            $this->reminderType
        ));

        // Record that reminder was sent
        AppointmentReminder::create([
            'appointment_id' => $this->appointment->id,
            'recipient_id' => $recipient->id,
            'recipient_type' => $recipientType,
            'reminder_type' => $this->reminderType,
            'sent_at' => now(),
        ]);
    }
}
