<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AppointmentReminderEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $appointment;
    public $recipient;
    public $recipientType; // 'customer' or 'stylist'
    public $otherParty;
    public $type; // 'hour' or 'day'
    public $recipientEmail;

    /**
     * Create a new message instance.
     */
    public function __construct($appointment, $recipient, $recipientType, $otherParty, $type = 'hour')
    {
        $this->appointment = $appointment;
        $this->recipient = $recipient;
        $this->recipientType = $recipientType;
        $this->otherParty = $otherParty;
        $this->type = $type;
        $this->recipientEmail = is_string($recipient) ? $recipient : $recipient->email;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Appointment Reminder - at ' . \Carbon\Carbon::parse($this->appointment->appointment_time)->format('g:i A'),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.appointment-reminder',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
