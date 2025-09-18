<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AppointmentDisputeEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $dispute;
    public $appointment;
    public $recipient;
    public $recipientType; // 'customer', 'stylist', or 'admin'
    public $recipientEmail;

    /**
     * Create a new message instance.
     */
    public function __construct($dispute, $appointment, $recipient, $recipientType)
    {
        $this->dispute = $dispute;
        $this->appointment = $appointment;
        $this->recipient = $recipient;
        $this->recipientType = $recipientType;
        $this->recipientEmail = is_string($recipient) ? $recipient : $recipient->email;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = $this->recipientType === 'admin'
            ? 'New Dispute Filed - ' . $this->dispute->dispute_id
            : 'Appointment Dispute Escalated - ' . $this->dispute->dispute_id;

        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.appointment-dispute',
            with: [
                'isAdmin' => $this->recipientType === 'admin'
            ]
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
