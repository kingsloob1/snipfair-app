<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentApprovalSubscriptionEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $stylist;
    public $subscription;
    public $isApproval; // true for payment approval, false for subscription activation
    public $recipientEmail;

    /**
     * Create a new message instance.
     */
    public function __construct($stylist, $subscription = null, $isApproval = true)
    {
        $this->stylist = $stylist;
        $this->subscription = $subscription;
        $this->isApproval = $isApproval;
        $this->recipientEmail = $stylist->email;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = $this->isApproval
            ? 'Payment Method Approved - Start Earning!'
            : 'Subscription Activated - Welcome to Premium!';

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
            view: 'emails.payment-approval-subscription',
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
