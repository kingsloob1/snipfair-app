<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class StylistCertification extends Model
{
    use SoftDeletes;

    protected $dates = ['deleted_at'];

    protected $fillable = [
        'user_id', 'banner', 'title', 'skill', 'issuer',
        'certificate_file', 'about', 'status'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }
}
