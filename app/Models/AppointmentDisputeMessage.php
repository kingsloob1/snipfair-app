<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class AppointmentDisputeMessage extends Model
{
    protected $fillable = [
        'appointment_dispute_id',
        'sender_type',
        'sender_id',
        'conversation_type',
        'message',
        'attachments',
        'read_at',
    ];

    protected $casts = [
        'attachments' => 'array',
        'read_at' => 'datetime',
    ];

    /**
     * Get the dispute that this message belongs to.
     */
    public function appointmentDispute(): BelongsTo
    {
        return $this->belongsTo(AppointmentDispute::class);
    }

    /**
     * Get the sender of the message (User or Admin).
     */
    public function sender(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Mark the message as read.
     */
    public function markAsRead(): void
    {
        if (!$this->read_at) {
            $this->update(['read_at' => now()]);
        }
    }

    /**
     * Check if the message has been read.
     */
    public function isRead(): bool
    {
        return !is_null($this->read_at);
    }

    /**
     * Check if the message has attachments.
     */
    public function hasAttachments(): bool
    {
        return !empty($this->attachments);
    }

    /**
     * Get the sender's name.
     */
    public function getSenderNameAttribute(): string
    {
        if ($this->sender_type === 'App\Models\Admin') {
            return $this->sender->name ?? 'Admin';
        }

        return $this->sender->first_name . ' ' . $this->sender->last_name;
    }

    /**
     * Get the sender's role for display.
     */
    public function getSenderRoleAttribute(): string
    {
        if ($this->sender_type === 'App\Models\Admin') {
            return 'Admin';
        }

        return ucfirst($this->sender->type ?? 'User');
    }

    /**
     * Scope to get unread messages.
     */
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    /**
     * Scope to get read messages.
     */
    public function scopeRead($query)
    {
        return $query->whereNotNull('read_at');
    }

    /**
     * Scope to get messages by sender type.
     */
    public function scopeBySenderType($query, string $senderType)
    {
        return $query->where('sender_type', $senderType);
    }

    /**
     * Scope to get messages from admins.
     */
    public function scopeFromAdmins($query)
    {
        return $query->where('sender_type', Admin::class);
    }

    /**
     * Scope to get messages from users.
     */
    public function scopeFromUsers($query)
    {
        return $query->where('sender_type', User::class);
    }

    public function scopeAdminCustomerConversation($query)
    {
        return $query->where('conversation_type', 'admin_customer');
    }

    public function scopeAdminStylistConversation($query)  
    {
        return $query->where('conversation_type', 'admin_stylist');
    }
}
