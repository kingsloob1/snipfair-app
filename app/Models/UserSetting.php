<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserSetting extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'key',
        'value'
    ];

    protected function casts(): array
    {
        return [];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
