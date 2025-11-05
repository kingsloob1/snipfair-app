<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Notifications\EmailVerificationOtp as EmailVerificationOtpNotification;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Laravel\Firebase\Facades\Firebase;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\URL;
use Kreait\Firebase\Messaging\{CloudMessage as FirebaseMessagingCloudMessage};

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, SoftDeletes, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'gender',
        'first_name',
        'last_name',
        'phone',
        'password',
        'country',
        'bio',
        'type',
        'role',
        //new items
        'avatar',
        'last_login_at',
        'status',
        'balance',
        'is_featured',
        'use_location',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
            'balance' => 'float',
            'is_featured' => 'boolean',
            'use_location' => 'boolean',
            'categories' => 'array'
        ];
    }

    protected $dates = ['deleted_at'];

    protected $appends = [
        'subscription_status',
        'availability',
        'plan',
        'name'
    ];

    protected static function booted()
    {
        // Handle creating
        static::creating(function ($model) {
            if (!$model->name) {
                $model->name = null; //Trigger set mutator
            }
        });

        // Handle updating
        static::updating(function ($model) {
            if ($model->name) {
                $model->name = null; //Trigger set mutator
            }
        });
    }

    protected function name(): Attribute
    {
        return Attribute::make(
            get: function ($value, array $attributes) {
                $firstName = Arr::get($attributes, 'first_name', '');
                $lastName = Arr::get($attributes, 'last_name', '');
                $builtFullName = $firstName . ' ' . $lastName;
                return $value ?: $builtFullName;
            },
            set: function ($value, array $attributes) {
                $firstName = Arr::get($attributes, 'first_name', '');
                $lastName = Arr::get($attributes, 'last_name', '');
                return $value ?: $firstName . ' ' . $lastName;
            },
        );
    }

    public function sendEmailVerificationOtp()
    {
        $otpRecord = EmailVerificationOtp::generateOtp($this->email);

        $this->notify(new EmailVerificationOtpNotification($otpRecord->otp));
    }

    public function verifyEmailWithOtp($otp)
    {
        if (EmailVerificationOtp::verify($this->email, $otp)) {
            $this->email_verified_at = now();
            $this->save();

            // Clean up used OTP
            EmailVerificationOtp::where('email', $this->email)->delete();

            return true;
        }

        return false;
    }

    public function hasVerifiedEmail()
    {
        return !is_null($this->email_verified_at);
    }

    public function stylist_profile()
    {
        return $this->hasOne(Stylist::class);
    }

    public function customer_profile()
    {
        return $this->hasOne(CustomerProfile::class);
    }

    // public function works()
    // {
    //     return $this->hasMany(Portfolio::class);
    // }

    public function customerAppointments()
    {
        return $this->hasMany(Appointment::class, 'customer_id');
    }

    public function stylistAppointments()
    {
        return $this->hasMany(Appointment::class, 'stylist_id');
    }

    public function stylistSettings()
    {
        return $this->hasOne(StylistSetting::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function initiatorConversations()
    {
        return $this->hasMany(Conversation::class, 'initiator_id');
    }

    public function recipientConversations()
    {
        return $this->hasMany(Conversation::class, 'recipient_id');
    }

    public function customerNotificationSetting()
    {
        return $this->hasOne(CustomerNotificationSetting::class);
    }

    public function customerPaymentMethods()
    {
        return $this->hasMany(CustomerPaymentMethod::class);
    }

    public function customerSetting()
    {
        return $this->hasOne(CustomerSetting::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function portfolios()
    {
        return $this->hasMany(Portfolio::class);
    }

    public function referredUsers()
    {
        return $this->hasMany(Referral::class, 'referred_id');
    }

    public function refereeUser()
    {
        return $this->hasOne(Referral::class, 'referee_id');
    }

    public function stylist_certifications()
    {
        return $this->hasMany(StylistCertification::class);
    }

    public function stylistPaymentMethods()
    {
        return $this->hasMany(StylistPaymentMethod::class);
    }

    public function stylistSchedules()
    {
        return $this->hasMany(StylistSchedule::class);
    }

    public function stylistScheduleSlots()
    {
        return $this->hasManyThrough(StylistScheduleSlot::class, StylistSchedule::class);
    }

    public function stylistSetting()
    {
        return $this->hasOne(StylistSetting::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function used_rewards()
    {
        return $this->hasMany(UsedReward::class);
    }

    public function user_reward()
    {
        return $this->hasOne(UserReward::class);
    }

    public function withdrawals()
    {
        return $this->hasMany(Withdrawal::class);
    }

    public function receivedReviews()
    {
        return $this->hasManyThrough(Review::class, Appointment::class, 'stylist_id', 'appointment_id');
    }

    public function stylistEarnings()
    {
        return $this->hasMany(Transaction::class);
    }

    public function pouches()
    {
        return $this->hasMany(AppointmentPouch::class);
    }

    protected function subscriptionStatus(): Attribute
    {
        return Attribute::make(
            get: function () {
                $activeSubscription = $this->subscriptions()
                    ->where('expiry', '>', Carbon::now())
                    ->whereHas('payment', function ($query) {
                        $query->where('status', 'approved');
                    })
                    ->latest('created_at')
                    ->first();

                if ($activeSubscription) {
                    return 'active';
                }

                $anySubscriptionExists = $this->subscriptions()->exists();
                if ($anySubscriptionExists) {
                    return $this->subscriptions()->where('expiry', '>', Carbon::now())->whereHas('payment', function ($query) {
                        $query->where('status', 'pending');
                    })->exists() ? 'pending' : 'expired';
                }

                return 'inactive';
            },
        );
    }


    protected function availability(): Attribute
    {
        return Attribute::make(
            get: function () {
                $isStylistApproved = $this->stylist_profile && $this->stylist_profile->status === 'approved';
                $isSubscriptionActive = true; // $this->subscription_status === 'active';
                return $isStylistApproved && $isSubscriptionActive;
            },
        );
    }

    protected function plan(): Attribute
    {
        return Attribute::make(
            get: function () {
                $activeSubscription = $this->subscriptions()
                    ->where('expiry', '>', Carbon::now())
                    ->latest('created_at')
                    ->first();
                return $activeSubscription ? $activeSubscription?->plan?->name ?? 'Free Plan' : 'Free Plan'; //null
            },
        );
    }

    public function portfolioLikes()
    {
        return Like::where('type', 'portfolio')
            ->whereIn('type_id', $this->portfolios()->pluck('id'));
    }

    public function likes()
    {
        return $this->hasMany(Like::class);
    }

    /**
     * Get the average rating for the stylist based on appointment reviews
     *
     * @return float|null Average rating or null if no reviews exist
     */
    public function getAverageRating(): ?float
    {
        $averageRating = $this->stylistAppointments()
            ->whereHas('review')
            ->with('review')
            ->get()
            ->pluck('review.rating')
            ->filter()
            ->avg();

        return $averageRating ? round($averageRating, 1) : 0;
    }

    /**
     * Get the total number of reviews for the stylist
     *
     * @return int
     */
    public function getTotalReviews(): int
    {
        return $this->stylistAppointments()
            ->whereHas('review')
            ->count();
    }

    /**
     * Get a summary of the stylist's schedule in a readable format
     * e.g., "Mon - Sat, 10AM - 7PM"
     */
    public function getScheduleSummary(): ?string
    {
        $schedules = $this->stylistSchedules()
            ->where('available', true)
            ->with('slots')
            ->get();

        if ($schedules->isEmpty()) {
            return null;
        }

        // Group schedules by time slots
        $timeSlotGroups = [];
        $dayMap = [
            'monday' => 'Mon',
            'tuesday' => 'Tue',
            'wednesday' => 'Wed',
            'thursday' => 'Thu',
            'friday' => 'Fri',
            'saturday' => 'Sat',
            'sunday' => 'Sun'
        ];

        foreach ($schedules as $schedule) {
            if ($schedule->slots->isEmpty()) {
                continue;
            }

            // Get the earliest start time and latest end time for this day
            $earliestStart = $schedule->slots->min('from');
            $latestEnd = $schedule->slots->max('to');

            $timeSlot = $earliestStart . '-' . $latestEnd;
            $dayShort = $dayMap[strtolower($schedule->day)] ?? $schedule->day;

            if (!isset($timeSlotGroups[$timeSlot])) {
                $timeSlotGroups[$timeSlot] = [];
            }
            $timeSlotGroups[$timeSlot][] = $dayShort;
        }

        if (empty($timeSlotGroups)) {
            return null;
        }

        // Find the most common time slot (the one with the most days)
        $mostCommonTimeSlot = array_reduce(array_keys($timeSlotGroups), function ($carry, $timeSlot) use ($timeSlotGroups) {
            return !$carry || count($timeSlotGroups[$timeSlot]) > count($timeSlotGroups[$carry]) ? $timeSlot : $carry;
        });

        $days = $timeSlotGroups[$mostCommonTimeSlot];

        // Sort days in order
        $dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        usort($days, function ($a, $b) use ($dayOrder) {
            return array_search($a, $dayOrder) - array_search($b, $dayOrder);
        });

        // Format the time slot
        list($startTime, $endTime) = explode('-', $mostCommonTimeSlot);
        $formattedStartTime = Carbon::createFromFormat('H:i:s', $startTime)->format('gA');
        $formattedEndTime = Carbon::createFromFormat('H:i:s', $endTime)->format('gA');

        // Format days range
        if (count($days) == 1) {
            $dayRange = $days[0];
        } elseif (count($days) > 1) {
            // Check if it's a consecutive range
            $isConsecutive = true;
            for ($i = 1; $i < count($days); $i++) {
                $currentIndex = array_search($days[$i], $dayOrder);
                $previousIndex = array_search($days[$i - 1], $dayOrder);
                if ($currentIndex !== $previousIndex + 1) {
                    $isConsecutive = false;
                    break;
                }
            }

            if ($isConsecutive) {
                $dayRange = $days[0] . ' - ' . end($days);
            } else {
                $dayRange = implode(', ', $days);
            }
        }

        return "{$dayRange}, {$formattedStartTime} - {$formattedEndTime}";
    }

    /**
     * Check if user is online (based on last activity within 5 minutes)
     */
    public function isOnline(): bool
    {
        if (!$this->last_login_at) {
            return false;
        }

        return $this->last_login_at->gt(now()->subMinutes(5));
    }

    /**
     * Get the tickets created by this user
     */
    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }

    public function location_service()
    {
        return $this->hasOne(LocationService::class);
    }

    public function deposits()
    {
        return $this->hasMany(Deposit::class);
    }

    public function settings()
    {
        return $this->hasMany(UserSetting::class);
    }

    public function getFirebaseTokens()
    {
        $setting = $this->settings()->firstOrCreate([
            'key' => 'firebase-device-tokens'
        ], [
            'value' => json_encode([])
        ]);

        /**
         * @var (array{token: string, created_at: string, last_used_at: string})[] $decodedTokens
         */
        $decodedTokens = json_decode($setting->value, true);
        $last3Months = Carbon::now()->subMonths(3);

        return collect($decodedTokens)->map(function ($tokenObj) {
            $tokenObj['created_at'] = Carbon::parse(Arr::get($tokenObj, 'created_at', now()));
            $tokenObj['last_used_at'] = Carbon::parse(Arr::get($tokenObj, 'last_used_at', now()));

            return collect($tokenObj);
        })->filter(function ($tokenCollection) use ($last3Months) {
            return $tokenCollection->get('last_used_at')->gt($last3Months);
        });
    }

    public function saveFirebaseTokens(Collection $tokens)
    {
        $setting = $this->settings()->firstOrCreate([
            'key' => 'firebase-device-tokens'
        ], [
            'value' => json_encode([])
        ]);

        $setting->update([
            'value' => $tokens->values()->toJson()
        ]);

        return $this;
    }

    public function addFirebaseToken(string $token, string $from)
    {
        $tokens = $this->getFirebaseTokens();
        $tokenCollection = collect([
            'token' => $token,
            'from' => $from,
            'created_at' => Carbon::now(),
            'last_used_at' => Carbon::now()
        ]);

        $existingToken = $tokens->firstWhere('token', '===', $token);
        if (!$existingToken) {
            $tokens->add($tokenCollection);
        } else {
            Arr::set($existingToken, 'from', $from);
        }

        return $this->saveFirebaseTokens($tokens);
    }

    public function sendFireBaseMessage(string $title, string $body, array $other = [])
    {
        $tokens = $this->getFirebaseTokens();
        if ($tokens->count()) {
            $messageData = Arr::get($other, 'data', []);
            $link = Arr::get($other, 'link', URL::to('/'));


            $message = FirebaseMessagingCloudMessage::fromArray([
                'notification' => [
                    'title' => $title,
                    'body' => $body,
                    'image' => URL::to('/images/logo/logo.png')
                ],
                'data' => $messageData,
                'webpush' => [
                    'notification' => [
                        'icon' => URL::to('/images/logo/logo.png')
                    ],
                    'fcm_options' => [
                        'link' => $link,
                    ]
                ]
            ]);

            $firebaseMessaging = Firebase::project('app')->messaging();
            $report = $firebaseMessaging->sendMulticast($message, $tokens->pluck('token')->toArray());

            $validTokens = $report->validTokens();
            $now = Carbon::now();

            foreach ($validTokens as $token) {
                $tokenInCollection = $tokens->firstWhere('token', '===', $token);

                if ($tokenInCollection) {
                    Arr::set($tokenInCollection, 'last_used_at', $now);
                }
            }

            $tokens = $tokens->filter(function ($tokenObj) use ($validTokens) {
                return in_array(Arr::get($tokenObj, 'token'), $validTokens);
            });

            $this->saveFirebaseTokens($tokens);
        }

        return $this;
    }

    public static function sendFireBaseMessageToUser($user, string $title, string $body, array $other = [])
    {
        $user = $user instanceof User ? $user : User::findOrFail($user);
        return $user->sendFireBaseMessage($title, $body, $other);
    }
}
