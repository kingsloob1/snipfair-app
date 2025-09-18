<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StylistScheduleSlot extends Model
{
    protected $fillable = ['stylist_schedule_id', 'from', 'to'];

    // Relationships
    public function schedule()
    {
        return $this->belongsTo(StylistSchedule::class, 'stylist_schedule_id');
    }
}
