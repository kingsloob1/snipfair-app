<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Plan extends Model
{
    use SoftDeletes;

    protected $fillable = ['name', 'description', 'amount', 'duration', 'status'];

    protected $casts = [
        'amount' => 'float',
    ];

    protected $dates = ['deleted_at'];

    public function subscriptions() {
        return $this->hasMany(Subscription::class);
    }

    public function payments() {
        return $this->hasMany(Payment::class);
    }
}
