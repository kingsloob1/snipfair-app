<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerProfile extends Model
{
    protected $fillable = [
        'user_id',
        'billing_name', 'billing_email', 'billing_city',
        'billing_zip', 'billing_location'
    ];

    public function user(){
        return $this->belongsTo(User::class);
    }
}
