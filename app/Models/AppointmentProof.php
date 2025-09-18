<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AppointmentProof extends Model
{
    use SoftDeletes;

    protected $fillable = ['media_urls', 'comment', 'appointment_id', 'user_id'];

    protected $dates = ['deleted_at'];

    protected $casts = [
        'media_urls' => 'array',
    ];

    public function appointment() {
        return $this->belongsTo(Appointment::class);
    }

    public function user() {
        return $this->belongsTo(User::class);
    }
}
