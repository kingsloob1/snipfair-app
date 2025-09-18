<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StylistSchedule extends Model
{
    protected $fillable = ['user_id', 'day', 'available'];

    protected $casts = [
        'available' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function slots()
    {
        return $this->hasMany(StylistScheduleSlot::class);
    }
}
