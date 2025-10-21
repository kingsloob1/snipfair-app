<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WithdrawalRejectedEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $withdrawal;
    public $stylist;
    public $newBalance;
    public $recipientEmail;

    /**
     * Create a new message instance.
     */
    public function __construct($withdrawal, $stylist, $newBalance = null)
    {
        $this->withdrawal = $withdrawal;
        $this->stylist = $stylist;
        $this->newBalance = $newBalance;
        $this->recipientEmail = $stylist->email;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Withdrawal Failed - ' . $this->withdrawal->reference_id,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.withdrawal-rejected',
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
