<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Withdrawal extends Model
{
    protected $fillable = ['user_id', 'amount', 'stylist_payment_method_id', 'status', 'processor', 'processor_id'];

    protected $casts = [
        'amount' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function payment_method()
    {
        return $this->belongsTo(StylistPaymentMethod::class, 'stylist_payment_method_id');
    }
}
