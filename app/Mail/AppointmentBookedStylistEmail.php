<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AppointmentBookedStylistEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $appointment;
    public $stylist;
    public $customer;
    public $portfolio;
    public $recipientEmail;

    /**
     * Create a new message instance.
     */
    public function __construct($appointment, $portfolio, $stylist, $customer)
    {
        $this->appointment = $appointment;
        $this->portfolio = $portfolio;
        $this->stylist = $stylist;
        $this->customer = $customer;
        $this->recipientEmail = $stylist->email;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Appointment Request - ' . $this->customer->name,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.appointment-booked-stylist',
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
