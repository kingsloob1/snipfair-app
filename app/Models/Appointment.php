<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Appointment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'stylist_id',
        'customer_id',
        'booking_id',
        'portfolio_id',
        'amount',
        'duration',
        'extra',
        'appointment_code',
        'completion_code',
        'status',
        'appointment_date',
        'appointment_time',
        'stylist_note',
        'service_notes',
        'completed_at'
    ];

    protected $casts = [
        'amount' => 'float',
        // 'completed_at' => 'datetime',
        // 'appointment_date' => 'date',
        // 'appointment_time' => 'datetime',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['appointment_date_time'];

    protected $dates = ['deleted_at'];

    public function appointmentDateTime(): Attribute
    {
        return Attribute::make(
            get: fn(mixed $value, array $attributes) => Carbon::parse(
                $attributes['appointment_date'] . ' ' . $attributes['appointment_time']
            ),
            set: function ($value) {
                $dateTime = Carbon::parse($value);
                return [
                    'appointment_date' => $dateTime->format('Y-m-d'),
                    'appointment_time' => $dateTime->format('H-i-s'),
                ];
            }
        );
    }

    public function stylist()
    {
        return $this->belongsTo(User::class, 'stylist_id');
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function portfolio()
    {
        return $this->belongsTo(Portfolio::class, 'portfolio_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function transaction()
    {
        return $this->hasOne(Transaction::class);
    }

    public function review()
    {
        return $this->hasOne(Review::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function deposit()
    {
        return $this->hasOne(Deposit::class);
    }

    public function proof()
    {
        return $this->hasOne(AppointmentProof::class);
    }

    public function disputes()
    {
        return $this->hasMany(AppointmentDispute::class);
    }

    public function pouch()
    {
        return $this->hasOne(AppointmentPouch::class);
    }

    public function pouches()
    {
        return $this->hasMany(AppointmentPouch::class);
    }

    public function reminders()
    {
        return $this->hasMany(AppointmentReminder::class);
    }
}
