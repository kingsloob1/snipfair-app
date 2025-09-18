<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentNotificationEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $payment;
    public $appointment;
    public $recipient;
    public $recipientType; // 'stylist' or 'admin'
    public $recipientEmail;

    /**
     * Create a new message instance.
     */
    public function __construct($payment, $appointment, $recipient, $recipientType)
    {
        $this->payment = $payment;
        $this->appointment = $appointment;
        $this->recipient = $recipient;
        $this->recipientType = $recipientType;
        $this->recipientEmail = $recipientType === 'admin' ? null : $recipient->email;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = $this->recipientType === 'admin'
            ? 'Payment Processed - ' . $this->payment->reference_id
            : 'Payment Received - ' . $this->payment->reference_id;

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
            view: 'emails.payment-notification',
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
