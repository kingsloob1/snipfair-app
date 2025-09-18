<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserReward extends Model
{
    protected $fillable = ['user_id', 'points', 'reward_category_id'];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function rewardCategory() {
        return $this->belongsTo(RewardCategory::class);
    }
}
