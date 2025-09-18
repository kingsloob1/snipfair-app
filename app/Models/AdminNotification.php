<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AdminNotification extends Model
{
    use SoftDeletes;

    protected $dates = ['deleted_at'];

    protected $fillable = ['user_id', 'type', 'priority', 'title', 'description', 'is_seen'];

    protected $casts = [
        'is_seen' => 'boolean',
    ];

    public function user() {
        return $this->belongsTo(Admin::class);
    }
}
