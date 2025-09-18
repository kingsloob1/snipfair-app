<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebsiteConfiguration extends Model
{
    protected $fillable = [
        'terms',
        'privacy_policy',
        'cookies',
        'email_verification',
        'two_factor_auth',
        'min_booking_amount',
        'max_booking_amount',
        'allow_registration_stylists',
        'allow_registration_customers',
        'maintenance_mode',
        'maintenance_message',
        'email_notifications',
        'push_notifications',
        'system_alerts',
        'payment_alerts',
        'content_moderation',
        'appointment_reschedule_threshold',
        'appointment_reschedule_percentage',
        'appointment_canceling_threshold',
        'appointment_canceling_percentage',
        'updated_by',
        'commission_rate',
        'currency_symbol',
        'currency_code',
        'featured_media',
        'professional_stylists',
        'happy_customers',
        'services_completed',
        'customer_satisfaction',
    ];

    protected $casts = [
        'featured_media' => 'array',
        'email_verification' => 'boolean',
        'two_factor_auth' => 'boolean',
        'allow_registration_stylists' => 'boolean',
        'allow_registration_customers' => 'boolean',
        'maintenance_mode' => 'boolean',
        'email_notifications' => 'boolean',
        'push_notifications' => 'boolean',
        'system_alerts' => 'boolean',
        'payment_alerts' => 'boolean',
        'content_moderation' => 'boolean',
        'min_booking_amount' => 'float',
        'max_booking_amount' => 'float',
        'appointment_reschedule_percentage' => 'float',
        'appointment_canceling_percentage' => 'float',
        'commission_rate' => 'float',
        'customer_satisfaction' => 'float',
    ];

    public function updatedBy()
    {
        return $this->belongsTo(Admin::class, 'updated_by');
    }
}
