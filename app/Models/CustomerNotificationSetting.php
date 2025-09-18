<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerNotificationSetting extends Model
{
    protected $fillable = [
        'user_id', 'booking_confirmation', 'appointment_reminders',
        'favorite_stylist_update', 'promotions_offers', 'review_reminders',
        'payment_confirmations', 'email_notifications', 'push_notifications',
        'sms_notifications'
    ];

    protected $casts = [
        'booking_confirmation' => 'boolean',
        'appointment_reminders' => 'boolean',
        'favorite_stylist_update' => 'boolean',
        'promotions_offers' => 'boolean',
        'review_reminders' => 'boolean',
        'payment_confirmations' => 'boolean',
        'email_notifications' => 'boolean',
        'push_notifications' => 'boolean',
        'sms_notifications' => 'boolean',
    ];

    public function user(){
        return $this->belongsTo(User::class);
    }
}
