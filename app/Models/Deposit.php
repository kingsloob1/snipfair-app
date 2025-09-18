<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Deposit extends Model
{
    protected $fillable = ['user_id', 'appointment_id', 'portfolio_id', 'transaction_id', 'amount', 'admin_payment_method_id', 'status'];

    protected $casts = [
        'amount' => 'float',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function portfolio() {
        return $this->belongsTo(Portfolio::class);
    }

    public function appointment() {
        return $this->belongsTo(Appointment::class);
    }

    public function transaction() {
        return $this->belongsTo(Transaction::class);
    }

    public function payment_method() {
        return $this->belongsTo(AdminPaymentMethod::class, 'admin_payment_method_id');
    }
}
