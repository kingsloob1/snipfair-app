<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StylistAccountApprovedEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $stylistName;
    public $loginUrl;
    public $recipientEmail;

    /**
     * Create a new message instance.
     */
    public function __construct($stylistName, $stylistEmail, $loginUrl = null)
    {
        $this->stylistName = $stylistName;
        $this->loginUrl = $loginUrl ?: url('/stylist/login');
        $this->recipientEmail = $stylistEmail;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Congratulations! Your Stylist Account is Approved 🎉',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.stylist-approved',
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
