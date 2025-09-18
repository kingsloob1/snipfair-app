<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AppointmentDisputeResolutionEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $dispute;
    public $appointment;
    public $recipient;
    public $recipientType; // 'customer' or 'stylist'
    public $resolution;
    public $recipientEmail;

    /**
     * Create a new message instance.
     */
    public function __construct($dispute, $appointment, $recipient, $recipientType, $resolution)
    {
        $this->dispute = $dispute;
        $this->appointment = $appointment;
        $this->recipient = $recipient;
        $this->recipientType = $recipientType;
        $this->resolution = $resolution;
        $this->recipientEmail = is_string($recipient) ? $recipient : $recipient->email;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Dispute Resolved - ' . $this->dispute->ref_id,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.appointment-dispute-resolution',
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
