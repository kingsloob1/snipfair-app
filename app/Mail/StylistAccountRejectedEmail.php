<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StylistAccountRejectedEmail extends Mailable
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
        $this->recipientEmail = $stylistEmail;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'We Couldn’t Approve Your Business (This Time)',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.stylist-rejected',
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
