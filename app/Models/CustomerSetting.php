<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerSetting extends Model
{
    protected $fillable = [
        'user_id',
        'preferred_time', 'preferred_stylist', 'auto_rebooking',
        'enable_mobile_appointment', 'email_reminders', 'sms_reminders',
        'phone_reminders', 'language', 'currency'
    ];

    protected $casts = [
        'auto_rebooking' => 'boolean',
        'enable_mobile_appointment' => 'boolean',
        'email_reminders' => 'boolean',
        'sms_reminders' => 'boolean',
        'phone_reminders' => 'boolean',
    ];

    public function user(){
        return $this->belongsTo(User::class);
    }
}
