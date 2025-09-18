<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class StylistPaymentMethod extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id', 'account_number', 'account_name', 'bank_name',
        'routing_number', 'is_default', 'is_active'
    ];

    protected $dates = ['deleted_at'];

    protected $casts = [
        'is_default' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function withdrawal_methods() {
        return $this->hasMany(Withdrawal::class);
    }
}
