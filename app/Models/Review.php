<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Review extends Model
{
    use SoftDeletes;

    protected $fillable = ['user_id', 'rating', 'comment', 'appointment_id'];

    protected $dates = ['deleted_at'];

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }
}
