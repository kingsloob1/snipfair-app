<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Admin;

class AdminInvitation extends Mailable
{
    use Queueable, SerializesModels;

    public $admin;
    public $temporaryPassword;
    public $loginUrl;
    public $recipientEmail;

    /**
     * Create a new message instance.
     */
    public function __construct(Admin $admin, string $temporaryPassword)
    {
        $this->admin = $admin;
        $this->temporaryPassword = $temporaryPassword;
        $this->loginUrl = url('/admin/login');
        $this->recipientEmail = $admin->email;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Admin Invitation - Snipfair Administration',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.admin-invitation',
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
