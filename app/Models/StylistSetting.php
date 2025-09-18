<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StylistSetting extends Model
{
    protected $fillable = [
        'user_id', 'automatic_payout', 'instant_payout',
        'payout_frequency', 'payout_day', 'enable_mobile_appointments', 'enable_shop_appointments'
    ];

    protected $casts = [
        'automatic_payout' => 'boolean',
        'instant_payout' => 'boolean',
        'enable_mobile_appointments' => 'boolean',
        'enable_shop_appointments' => 'boolean',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }
}
