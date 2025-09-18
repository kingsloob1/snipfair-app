<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BookingSuccessfulCustomerEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $appointment;
    public $customer;
    public $stylist;
    public $recipientEmail;

    /**
     * Create a new message instance.
     */
    public function __construct($appointment, $customer, $stylist)
    {
        $this->appointment = $appointment;
        $this->customer = $customer;
        $this->stylist = $stylist;
        $this->recipientEmail = $customer->email;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Booking Confirmed - ' . $this->appointment->appointment_code,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.booking-successful-customer',
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
