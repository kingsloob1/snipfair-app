<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UsedReward extends Model
{
    protected $fillable = ['user_id', 'reward_id', 'code', 'points'];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function reward() {
        return $this->belongsTo(Reward::class);
    }
}
