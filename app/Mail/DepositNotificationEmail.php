<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DepositNotificationEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $deposit;
    public $user;
    public $recipientType; // 'admin' or 'customer'
    public $recipientEmail;
    public $gateway;

    /**
     * Create a new message instance.
     */
    public function __construct($deposit, $user, $recipientType)
    {
        $this->deposit = $deposit;
        $this->user = $user;
        $this->recipientType = $recipientType;
        $this->recipientEmail = $recipientType === 'customer' ? $user->email : null;
        $this->gateway = 'Payfast';
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = $this->recipientType === 'admin'
            ? 'New Deposit Received - ' . $this->deposit->reference_id
            : 'Deposit Initiated - ' . $this->deposit->reference_id;

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
            view: 'emails.deposit-gateway-notification',
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
