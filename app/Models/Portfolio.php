<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Portfolio extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'title',
        'category_id',
        'price',
        'duration',
        'description',
        'tags',
        'media_urls',
        'visits_count',
        'status',
        'is_available',
    ];

    protected $casts = [
        'media_urls' => 'array',  // auto-casts JSON column to array
        'price' => 'float',
        'status' => 'boolean',
        'is_available' => 'boolean',
    ];

    protected $dates = ['deleted_at'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category(){
        return $this->belongsTo(Category::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function deposit()
    {
        return $this->hasOne(Deposit::class);
    }

    public function average_rating(){
        return Review::whereIn(
            'appointment_id',
            $this->appointments()->pluck('id')
        )->avg('rating');
    }

    public function getAverageRatingAttribute()
    {
        return Review::whereIn(
            'appointment_id',
            $this->appointments()->pluck('id')
        )->avg('rating');
    }

    public function likes()
    {
        // return $this->hasMany(Like::class, 'type_id')->where('type', 'portfolio');
        return $this->hasMany(Like::class, 'type_id')->where('type', 'portfolio')->where('status', true);
    }
}
