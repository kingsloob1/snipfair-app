<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RewardCategory extends Model
{
    protected $fillable = ['name', 'min', 'max', 'criterion', 'criterion_unit'];

    public function userRewards() {
        return $this->hasMany(UserReward::class);
    }
}
