<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DepositConfirmationEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $deposit;
    public $customer;
    public $newBalance;
    public $recipientEmail;

    /**
     * Create a new message instance.
     */
    public function __construct($deposit, $customer, $newBalance = null)
    {
        $this->deposit = $deposit;
        $this->customer = $customer;
        $this->newBalance = $newBalance;
        $this->recipientEmail = $customer->email;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Deposit Confirmed - ' . $this->deposit->reference_id,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.deposit-confirmation',
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
