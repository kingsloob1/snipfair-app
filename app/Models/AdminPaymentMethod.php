<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AdminPaymentMethod extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'updated_by',
        'account_number',
        'account_name',
        'bank_name',
        'routing_number',
        'is_default',
        'is_active',
    ];

    protected $dates = ['deleted_at'];

    protected $casts = [
        'is_default' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function deposits()
    {
        return $this->hasMany(Deposit::class, 'admin_payment_method_id');
    }

    protected static function booted()
    {
        // Handle creating
        static::creating(function ($model) {
            if ($model->is_default) {
                static::unsetOthersAsDefault();
            }
        });

        // Handle updating
        static::updating(function ($model) {
            if ($model->is_default) {
                static::unsetOthersAsDefault($model->id);
            }
        });

        // Handle soft deleting
        static::deleted(function ($model) {
            if ($model->is_default) {
                static::assignNewDefault();
            }
        });
    }

    protected static function unsetOthersAsDefault($exceptId = null)
    {
        $query = static::where('is_default', true);
        if ($exceptId) {
            $query->where('id', '!=', $exceptId);
        }
        $query->update(['is_default' => false]);
    }

    protected static function assignNewDefault()
    {
        $next = static::where('is_active', true)->whereNull('deleted_at')->first();

        if ($next) {
            $next->update(['is_default' => true]);
        }
    }
}
