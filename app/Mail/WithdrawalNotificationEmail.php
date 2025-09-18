<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WithdrawalNotificationEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $withdrawal;
    public $user;
    public $recipientType; // 'admin' or 'stylist'
    public $recipientEmail;

    /**
     * Create a new message instance.
     */
    public function __construct($withdrawal, $user, $recipientType)
    {
        $this->withdrawal = $withdrawal;
        $this->user = $user;
        $this->recipientType = $recipientType;
        $this->recipientEmail = $recipientType === 'admin' ? null : $user->email;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = $this->recipientType === 'admin'
            ? 'New Withdrawal Request - ' . $this->withdrawal->reference_id
            : 'Withdrawal Request Submitted - ' . $this->withdrawal->reference_id;

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
            view: 'emails.withdrawal-notification',
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
