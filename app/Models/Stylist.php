<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Stylist extends Model
{
    protected $fillable = [
        'user_id',
        'business_name',
        'years_of_experience',
        'identification_id',
        'identification_file',

        // new items
        'visits_count',
        'status',
        'is_available',
        'banner',
        'socials',
        'works',
    ];

    protected $casts = [
        'visits_count' => 'float',
        'is_available' => 'boolean',
        'socials' => 'array',
        'works' => 'array',
    ];

    public function getSocialsAttribute($value)
    {
        if (is_string($value)) {
            return json_decode($value, true) ?? [];
        }
        return $value ?? [];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function likes()
    {
        return $this->hasMany(Like::class, 'type_id')->where('type', 'profile')->where('status', true);
    }
}
