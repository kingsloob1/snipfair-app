<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Referral extends Model
{
    protected $fillable = ['referee_id', 'referred_id']; //referee is referral

    public function referee() {
        return $this->belongsTo(User::class, 'referee_id');
    }

    public function referred() {
        return $this->belongsTo(User::class, 'referred_id');
    }
}
