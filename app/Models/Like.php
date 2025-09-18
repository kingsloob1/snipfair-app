<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Like extends Model
{
    protected $fillable = ['user_id', 'type', 'type_id', 'status'];

    protected $casts = [
        'status' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function likeable()
    {
        return match ($this->type) {
            'portfolio' => Portfolio::find($this->type_id),
            'profile'   => Stylist::find($this->type_id),
            'tutorial'  => Tutorial::find($this->type_id),
            default     => null,
        };
    }
}
