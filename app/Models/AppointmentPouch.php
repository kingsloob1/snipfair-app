<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AppointmentPouch extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'appointment_id',
        'amount',
        'status',
        'admin_note',
        'user_id',
    ];

    protected $casts = [
        'amount' => 'float',
        'status' => 'string',
    ];

    protected $dates = ['deleted_at'];

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
