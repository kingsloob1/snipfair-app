<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $fillable = ['plan_id', 'payment_id', 'user_id', 'expiry'];

    protected $casts = [
        'expiry' => 'datetime',
    ];

    public function plan() {
        return $this->belongsTo(Plan::class);
    }

    public function payment() {
        return $this->belongsTo(Payment::class);
    }

    public function user() {
        return $this->belongsTo(User::class);
    }
}
