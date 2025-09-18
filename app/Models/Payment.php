<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = ['plan_id', 'user_id', 'status'];

    public function plan() {
        return $this->belongsTo(Plan::class);
    }

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function subscription() {
        return $this->hasOne(Subscription::class);
    }
}
