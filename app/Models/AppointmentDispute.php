<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AppointmentDispute extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'comment',
        'status',
        'from',
        'appointment_id',
        'image_urls',
        'priority',
        'ref_id',
        'customer_id',
        'stylist_id',
        'resolution_type',
        'resolution_amount',
        'resolved_at',
        'resolved_by'
    ];

    protected $casts = [
        'image_urls' => 'array',
        'resolution_amount' => 'float',
        'resolved_at' => 'datetime',
    ];

    protected $dates = ['deleted_at'];

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function stylist()
    {
        return $this->belongsTo(User::class, 'stylist_id');
    }

    public function messages()
    {
        return $this->hasMany(AppointmentDisputeMessage::class);
    }

    public function resolvedBy()
    {
        return $this->belongsTo(Admin::class, 'resolved_by');
    }

    public function adminCustomerMessages()
    {
        return $this->hasMany(AppointmentDisputeMessage::class)
                    ->adminCustomerConversation()
                    ->with('sender')
                    ->orderBy('created_at', 'asc');
    }

    public function adminStylistMessages()
    {
        return $this->hasMany(AppointmentDisputeMessage::class)
                    ->adminStylistConversation()
                    ->with('sender')
                    ->orderBy('created_at', 'asc');
    }
}
