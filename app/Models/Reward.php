<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Reward extends Model
{
    use SoftDeletes;

    protected $fillable = ['name', 'description', 'code', 'points', 'expiry'];

    protected $dates = ['deleted_at'];

    protected $casts = [
        'expiry' => 'datetime',
    ];
}
