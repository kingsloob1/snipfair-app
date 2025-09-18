<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CustomerPaymentMethod extends Model
{
    use SoftDeletes;

    protected $fillable = ['user_id', 'card_number', 'expiry', 'cardholder', 'is_default', 'is_active'];

    protected $dates = ['deleted_at'];

    protected $casts = [
        'is_default' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function user(){
        return $this->belongsTo(User::class);
    }
}
