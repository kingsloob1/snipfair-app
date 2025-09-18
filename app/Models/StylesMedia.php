<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class StylesMedia extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'model_id',
        'type',
        'url',
    ];

    protected $dates = ['deleted_at'];
}
