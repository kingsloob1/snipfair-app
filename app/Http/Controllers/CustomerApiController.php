<?php

namespace App\Http\Controllers;

use App\Events\AppointmentStatusUpdated;
use App\Events\PaymentVerificationRequested;
use App\Helpers\AdminNotificationHelper;
use App\Mail\AppointmentBookedStylistEmail;
use App\Mail\AppointmentDisputeEmail;
use App\Models\Admin;
use App\Models\Appointment;
use App\Models\AppointmentDispute;
use App\Models\AppointmentPouch;
use App\Models\Category;
use App\Models\CustomerNotificationSetting;
use App\Models\CustomerSetting;
use App\Models\Deposit;
use App\Models\Like;
use App\Models\LocationService;
use App\Models\Portfolio;
use App\Models\Review;
use App\Models\Stylist;
use App\Models\Transaction;
use App\Models\User;
use App\Models\WebsiteConfiguration;
use App\Rules\PhoneNumber;
use App\Rules\UrlOrFile;
use Carbon\Carbon;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class CustomerApiController extends Controller
{
    public function getStats(Request $request)
    {
        $customer = $request->user();
        $totalSpendings = (float) $customer->transactions()
            ->where('type', 'payment')
            ->where('status', 'completed')
            ->sum('amount') ?? 0;
        $appointmentsCount = (int) $customer->customerAppointments()
            ->count();
        $appointmentsCompleted = (int) $customer->customerAppointments()
            ->where('status', 'completed')
            ->count();
        $appointmentsActive = (int) $customer->customerAppointments()
            ->whereIn('status', ['approved', 'pending'])
            ->count();
        $appointmentsCanceled = (int) $customer->customerAppointments()
            ->where('status', 'canceled')
            ->count();

        return [
            'total_spendings' => $totalSpendings,
            'total_appointments' => $appointmentsCount,
            'completed_appointments' => $appointmentsCompleted,
            'failed_appointments' => $appointmentsCanceled,
            'active_appointments' => $appointmentsActive,
        ];
    }

    public function profileUpdate(Request $request)
    {
        $validated = $request->validate([
            'first_name' => ['sometimes', 'required', 'string', 'max:255'],
            'last_name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', 'unique:users,email,' . $request->user()->id],
            'country' => ['sometimes', 'nullable', 'string', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'numeric', new PhoneNumber()],
            'bio' => ['sometimes', 'nullable', 'string'],
            'avatar' => [
                new UrlOrFile(
                    urlAndFileRules: [
                        'url' => [
                            'sometimes',
                            'required',
                            'url',
                            'starts_with:' . URL::to('/storage')
                        ],
                        'file' => [
                            'sometimes',
                            'required',
                            'image',
                            'max:5120'
                        ]
                    ],
                    urlAndFileMessages: [
                        'url' => [
                            'required' => 'Media URL is required',
                            'url' => 'Media URL is invalid',
                            'starts_with' => 'Media URL is invalid'
                        ],
                        'file' => [
                            'required' => 'Media file is required',
                            'image' => 'Media file must be a valid image',
                            'max' => 'Media file size must be less than 5MB',
                        ]
                    ]
                )
            ]
        ]);

        $user = $request->user();
        $userObjUpdate = Arr::only($validated, ['first_name', 'last_name', 'email', 'country', 'phone', 'bio']);

        $email = Arr::get($userObjUpdate, 'email');
        if ($email && (strtolower($email) !== strtolower($user->email))) {
            $userObjUpdate['email_verified_at'] = null;
        }

        $user->update($userObjUpdate);

        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->avatar) {
                Storage::disk('public')->delete(formatStoredFilePath($user->avatar));
            }

            $user->avatar = $request->file('avatar')->store('avatars', 'public');
            $user->save();
        }

        return $user->refresh();
    }

    public function getProfile(Request $request)
    {
        $customer = $request->user();
        $customer_profile = $customer->customer_profile;
        if (!$customer_profile) {
            $customer_profile = $customer->customer_profile()->firstOrCreate(
                [],
                [
                    'billing_name' => $customer->name,
                    'billing_email' => $customer->email,
                ]
            );
        }

        $methods = [];
        // $payment_methods = $customer->customerPaymentMethods()->orderBy('created_at', 'desc')->get();

        // if (!$payment_methods) {
        //     $methods = [];
        // } else {
        //     $methods = $payment_methods->map(function ($method) {
        //         return [
        //             'id' => $method->id,
        //             'last4' => substr($method->card_number, -4),
        //             'expiry' => Carbon::parse($method->expiry)->format('m/Y'),
        //             'brand' => $method->cardholder, // Still assuming this is card brand
        //             'is_default' => $method->is_default,
        //         ];
        //     })->toArray();
        // }

        $customer_settings = $customer->customerSetting;
        if (!$customer_settings) {
            $customer_settings = $customer->customerSetting()->firstOrCreate(
                [],
                [
                    'preferred_time' => 'morning',
                ]
            );
        }

        $customer_settings->use_location = $customer->use_location ?? false;
        $customer_notifications = $customer->customerNotificationSetting()->firstOrCreate(
            [],
            [
                'email_notifications' => true,
                'sms_notifications' => false,
                'push_notifications' => true,
            ]
        );

        $payment_history = $request->user()->transactions()
            ->with(['appointment', 'appointment.stylist'])
            ->where('type', 'payment')
            ->orderBy('created_at', 'desc')->get();


        return [
            'user' => $customer->except(['customer_profile', 'customer_Settings', 'stylist_profile']),
            'payment_methods' => $methods,
            'customer_profile' => $customer_profile,
            'preferences' => $customer_settings,
            'notifications' => $customer_notifications,
            'payment_history' => $payment_history->map(function ($transaction) {
                $stylist = $transaction->appointment?->stylist;
                return [
                    'id' => $transaction->id,
                    'amount' => $transaction->amount,
                    'paymentMethod' => 'Transfer',
                    'service' => $transaction->appointment?->service?->name ?? 'N/A',
                    'date' => Carbon::parse($transaction->created_at)->toIsoString(),
                    'status' => $transaction->status,
                    'stylist' => [
                        'name' => $stylist->name,
                        'first_name' => $stylist->first_name,
                        'last_name' => $stylist->last_name,
                        'email' => $stylist->email,
                        'avatar' => $stylist->avatar
                    ],
                ];
            }),
        ];
    }

    private function getStylistQueryBuilder(User $user)
    {
        $customerLatitude = $user->location_service->latitude;
        $customerLongitude = $user->location_service->longitude;

        $queryBuilder = User::query()
            ->select('*')
            ->selectSub(
                Category::query()
                    ->selectRaw("JSON_ARRAYAGG(JSON_OBJECT('id', `categories`.`id`, 'name', `categories`.`name`))")
                    ->whereIn('id', function ($qb) {
                        $qb->select('category_id')->from('portfolios')->whereRaw('`portfolios`.`user_id` = `users`.`id`');
                    })
                    ->limit(1),
                'categories'
            )
            ->selectSub(
                Portfolio::query()
                    ->selectRaw('sum(visits_count)')
                    ->whereRaw('user_id = `users`.`id`')
                    ->limit(1),
                'portfolio_visits_count'
            )
            ->selectSub(
                Stylist::query()
                    ->selectRaw('visits_count')
                    ->whereRaw('user_id = `users`.`id`')
                    ->limit(1),
                'profile_visits_count'
            )
            ->selectSub(
                Stylist::query()
                    ->selectRaw('years_of_experience')
                    ->whereRaw('user_id = `users`.`id`')
                    ->limit(1),
                'years_of_experience'
            )
            ->selectSub(
                Review::query()
                    ->selectRaw('AVG(rating)')
                    ->whereHas('appointment', function ($qb) {
                        $qb->whereRaw('stylist_id = `users`.`id`');
                    }),
                'average_rating'
            )
            ->selectSub(
                Review::query()
                    ->selectRaw('count(id)')
                    ->whereHas('appointment', function ($qb) {
                        $qb->whereRaw('stylist_id = `users`.`id`');
                    }),
                'reviews_count'
            )
            ->selectSub(
                Like::query()
                    ->join('portfolios', function (JoinClause $join) {
                        $join->on('likes.type_id', '=', 'portfolios.id')
                            ->whereRaw('`portfolios`.`user_id` = `users`.`id`');
                    })
                    ->selectRaw('count(`portfolios`.`id`)')
                    ->where('likes.status', '=', true)
                    ->where('likes.type', '=', 'portfolio'),
                'portfolio_likes_count'
            )
            ->selectSub(
                Like::query()
                    ->join('stylists', function (JoinClause $join) {
                        $join->on('likes.type_id', '=', 'stylists.id')
                            ->whereRaw('`stylists`.`user_id` = `users`.`id`');
                    })
                    ->selectRaw('count(`likes`.`id`)')
                    ->where('likes.status', '=', true)
                    ->where('likes.type', '=', 'profile'),
                'profile_likes_count'
            )
            ->selectSub(
                Appointment::query()
                    ->selectRaw('count(id)')
                    ->where('created_at', '>', Carbon::now()->subMonths(3))
                    ->whereRaw('stylist_id = `users`.`id`'),
                'trending'
            )
            ->selectSub(
                Appointment::query()
                    ->selectRaw('count(id)')
                    ->whereRaw('stylist_id = `users`.`id`'),
                'appointments_count'
            )
            ->selectSub(
                Appointment::query()
                    ->selectRaw('count(id)')
                    ->where('status', '=', 'completed')
                    ->whereRaw('stylist_id = `users`.`id`'),
                'completed_appointments_count'
            )
            ->selectSub(
                Portfolio::query()
                    ->selectRaw('min(price)')
                    ->whereRaw('user_id = `users`.`id`'),
                'min_price'
            )
            ->selectSub(
                Portfolio::query()
                    ->selectRaw('max(price)')
                    ->whereRaw('user_id = `users`.`id`'),
                'max_price'
            )
            ->selectSub(
                DB::query()
                    ->selectRaw(
                        "exists(
                            select
                                1
                            from
                                `likes`
                            inner join
                                `stylists`
                                on (
                                    `likes`.`type_id` = `stylists`.`id`
                                )
                            where
                                `likes`.`type` = \"profile\"
                                and
                                `stylists`.`user_id` = `users`.`id`
                                and
                                `likes`.`user_id` = {$user->id}
                                and
                                `likes`.`status` = true
                        )"
                    ),
                'favourite'
            );

        // Compute distance only when customer has distance set
        if ($customerLatitude && $customerLongitude) {
            // use 6371 for km and 3959 for miles (Earths radius)
            $queryBuilder = $queryBuilder
                ->selectSub(
                    LocationService::query()
                        ->selectRaw(
                            "
                                (6371 * acos(
                                    least(
                                        1,
                                        greatest(
                                            -1,
                                            (
                                                cos(radians({$customerLatitude}))
                                                * cos(radians(`location_services`.`latitude`))
                                                * cos(radians(`location_services`.`longitude`)
                                                - radians({$customerLongitude}))
                                                + sin(radians({$customerLatitude}))
                                                * sin(radians(location_services.latitude))
                                            )
                                        )
                                    )
                                ))
                            ",
                        )
                        ->whereRaw('user_id = `users`.`id`')
                        ->whereNotNull('latitude')
                        ->whereNotNull('longitude')
                        ->limit(1),
                    'distance'
                );
        } else {
            $queryBuilder = $queryBuilder
                ->selectSub(0, 'distance');
        }

        return $queryBuilder;
    }

    public function getStylists(Request $request)
    {
        $user = $request->user();
        $user->load(['location_service']);

        $perPage = formatPerPage($request);
        $query = $request->query('query');
        $categoryId = $request->query('category_id');
        $favourite = $request->query('favourite');
        $topRated = $request->query('top_rated');
        $online = $request->query('online');
        $highestRated = $request->query(key: 'highest_rated');
        $lowestPrice = $request->query(key: 'lowest_price');
        $minPrice = $request->query(key: 'min_price');
        $maxPrice = $request->query(key: 'max_price');

        $sortGroups = formatRequestSort($request, ['years_of_experience', 'average_rating', 'distance', 'trending', 'favourite', 'profile_likes_count', 'portfolio_likes_count', 'reviews_count', 'min_price', 'max_price', 'appointments_count', 'name', 'first_name', 'last_name', 'portfolio_visits_count', 'profile_visits_count', 'completed_appointments_count', 'last_login_at'], '-trending');


        $queryBuilder = $this->getStylistQueryBuilder($user)->where('role', 'stylist')->whereHas('stylist_profile', function ($qb) {
            $qb->where('is_available', true)->where('status', 'approved');
        });

        if ($categoryId) {
            $queryBuilder = $queryBuilder->whereHas('stylistAppointments.portfolio', function ($qb) use ($categoryId) {
                $qb->where('category_id', '=', $categoryId);
            });
        }

        if ($favourite) {
            $favouriteBool = filter_var($favourite, FILTER_VALIDATE_BOOLEAN);

            $handler = function ($qb) use ($user) {
                $qb->where('status', '=', true)->where('user_id', '=', $user->id);
            };

            if ($favouriteBool) {
                $queryBuilder = $queryBuilder->whereHas('stylist_profile.likes', $handler);
            } else {
                $queryBuilder = $queryBuilder->whereDoesntHave('stylist_profile.likes', $handler);
            }
        }

        if ($topRated) {
            $topRatedBool = filter_var($topRated, FILTER_VALIDATE_BOOLEAN);
            $queryBuilder->where('is_featured', $topRatedBool ? '=' : '<>', true);
            array_unshift($sortGroups, [
                'property' => 'average_rating',
                'direction' => $topRatedBool ? 'DESC' : 'ASC'
            ]);
        }

        if ($online) {
            $onlineBool = filter_var($online, FILTER_VALIDATE_BOOLEAN);

            $logicalComparison = $onlineBool ? '=' : '<>';
            $queryBuilder = $queryBuilder->whereRaw("(if(`users`.`last_login_at` is not null, `users`.`last_login_at` > date_sub(now(), interval 5 minute),false) {$logicalComparison} true)");

            array_unshift($sortGroups, [
                'property' => 'last_login_at',
                'direction' => $onlineBool ? 'DESC' : 'ASC'
            ]);
        }

        if ($highestRated) {
            $highestRatedBool = filter_var($highestRated, FILTER_VALIDATE_BOOLEAN);

            $logicalComparison = $highestRatedBool ? '>=' : '<';
            $queryBuilder->whereRaw("(ifnull((select avg(re.rating) from reviews re inner join appointments ap on (re.appointment_id = ap.id) where ap.stylist_id = `users`.`id` limit 1), 0) {$logicalComparison} 4.5)");

            array_unshift($sortGroups, [
                'property' => 'average_rating',
                'direction' => $highestRatedBool ? 'DESC' : 'ASC'
            ]);
        }

        if ($lowestPrice) {
            $lowestPriceBool = filter_var($lowestPrice, FILTER_VALIDATE_BOOLEAN);

            $logicalComparison = $lowestPriceBool ? '<' : '>=';
            $queryBuilder->whereRaw("(ifnull((select min(po.price) from portfolios po where po.user_id = `users`.`id` limit 1), 0) {$logicalComparison} 100)");

            array_unshift($sortGroups, [
                'property' => $lowestPriceBool ? 'min_price' : 'max_price',
                'direction' => $lowestPriceBool ? 'ASC' : 'DESC'
            ]);
        }

        if ($minPrice) {
            $minPrice = filter_var($minPrice, FILTER_VALIDATE_FLOAT, [
                'options' => [
                    'default' => 0.0,
                    'min_range' => 0.0
                ],
                'flags' => FILTER_FLAG_ALLOW_THOUSAND
            ]);

            $queryBuilder->whereRaw("(ifnull((select min(po.price) from portfolios po where po.user_id = `users`.`id` limit 1), 0) >= {$minPrice})");
        }

        if ($maxPrice) {
            $maxPrice = filter_var($maxPrice, FILTER_VALIDATE_FLOAT, [
                'options' => [
                    'default' => 0.0,
                    'min_range' => 0.0
                ],
                'flags' => FILTER_FLAG_ALLOW_THOUSAND
            ]);

            $queryBuilder->whereRaw("(ifnull((select min(po.price) from portfolios po where po.user_id = `users`.`id` limit 1), 0) <= {$maxPrice})");
        }

        if ($query) {
            $queryBuilder = $queryBuilder->where(function ($qb) use ($query) {
                $qb
                    ->whereLike('name', '%' . $query . '%', false)
                    ->orWhereHas('stylist_profile', function ($qb) use ($query) {
                        $qb->whereLike('business_name', '%' . $query . '%', false);
                    });
            });
        }

        foreach ($sortGroups as $sortGroup) {
            switch ($sortGroup['property']) {
                default: {
                    $queryBuilder->orderBy($sortGroup['property'], $sortGroup['direction']);
                    break;
                }
            }
        }

        $paginatedResp = $queryBuilder
            ->with([
                'stylist_profile',
                'stylist_certifications',
                'portfolios' => function ($qb) {
                    $qb->limit(5);
                }
            ])
            ->cursorPaginate($perPage, ['*'], 'page');

        $paginatedResp = $paginatedResp->through(function (User $stylist) {
            // Get dynamic availability data
            $availabilityData = calculateStylistAvailability($stylist);

            return array_merge(
                Arr::except($stylist->toArray(), [
                    'portfolios'
                ]),
                [
                    'availability' => $availabilityData,
                    'response_time' => $availabilityData['response_time'],
                    'next_available' => $availabilityData['next_available'],
                    'reviews_count' => (int) $stylist->reviews_count,
                    'portfolio_likes_count' => (int) $stylist->portfolio_likes_count,
                    'profile_likes_count' => (int) $stylist->profile_likes_count,
                    'trending' => (int) $stylist->trending,
                    'appointments_count' => (int) $stylist->appointments_count,
                    'completed_appointments_count' => (int) $stylist->completed_appointments_count,
                    'portfolio_visits_count' => (int) $stylist->portfolio_visits_count,
                    'profile_visits_count' => (int) $stylist->profile_visits_count,
                    'years_of_experience' => (int) $stylist->years_of_experience,
                    'min_price' => (float) $stylist->min_price,
                    'max_price' => (float) $stylist->max_price,
                    'distance' => (float) $stylist->distance,
                    'favourite' => (bool) $stylist->favourite,
                    'average_rating' => (float) $stylist->average_rating,
                    'media_urls' => $stylist->portfolios->pluck('media_urls')->flatten(1)->take(20)->all(),
                ]
            );
        });

        return $paginatedResp;
    }

    public function getStylist(Request $request, $stylistUserId)
    {
        $user = $request->user();
        $user->load(['location_service']);

        $stylist = $this->getStylistQueryBuilder($user)
            ->where('role', 'stylist')
            ->where('id', '=', $stylistUserId)
            ->with([
                'stylist_profile',
                'stylist_certifications',
                'portfolios' => function ($qb) {
                    $qb->limit(5);
                }
            ])
            ->firstOrFail();

        $stylist->stylist_profile->increment('visits_count');

        // Get dynamic availability data
        $availabilityData = calculateStylistAvailability($stylist);


        // Get actual reviews with customer information
        $actual_reviews = Review::whereHas('appointment', function ($query) use ($stylist) {
            $query->where('stylist_id', $stylist->id);
        })
            ->with(['appointment.customer'])
            ->latest()
            ->take(5)
            ->get();

        // Get stylist schedule
        $workingHours = $stylist->stylistSchedules()->with('slots')->get()
            ->toArray();

        // If no schedule found, provide default hours
        if (empty($workingHours)) {
            $workingHours = [
                ['day' => 'monday', 'available' => true],
                ['day' => 'tuesday', 'available' => true],
                ['day' => 'wednesday', 'available' => true],
                ['day' => 'thursday', 'available' => true],
                ['day' => 'friday', 'available' => true],
                ['day' => 'saturday', 'available' => true],
                ['day' => 'sunday', 'available' => true],
            ];
        }


        return array_merge(
            Arr::except($stylist->toArray(), [
                'portfolios'
            ]),
            [
                'availability' => $availabilityData,
                'response_time' => $availabilityData['response_time'],
                'next_available' => $availabilityData['next_available'],
                'reviews_count' => (int) $stylist->reviews_count,
                'portfolio_likes_count' => (int) $stylist->portfolio_likes_count,
                'profile_likes_count' => (int) $stylist->profile_likes_count,
                'trending' => (int) $stylist->trending,
                'appointments_count' => (int) $stylist->appointments_count,
                'completed_appointments_count' => (int) $stylist->completed_appointments_count,
                'portfolio_visits_count' => (int) $stylist->portfolio_visits_count,
                'profile_visits_count' => (int) $stylist->profile_visits_count,
                'years_of_experience' => (int) $stylist->years_of_experience,
                'min_price' => (float) $stylist->min_price,
                'max_price' => (float) $stylist->max_price,
                'distance' => (float) $stylist->distance,
                'favourite' => (bool) $stylist->favourite,
                'average_rating' => (float) $stylist->average_rating,
                'media_urls' => $stylist->portfolios->pluck('media_urls')->flatten(1)->take(20)->all(),
                'reviews' => $actual_reviews,
                'working_hours' => $workingHours
            ]
        );
    }

    private function getPortfolioQueryBuilder(User $user)
    {
        $queryBuilder = Portfolio::query()
            ->select('*')
            ->selectSub(
                Review::query()
                    ->selectRaw('AVG(rating)')
                    ->whereHas('appointment', function ($qb) {
                        $qb->whereRaw('portfolio_id = `portfolios`.`id`');
                    }),
                'average_rating'
            )
            ->selectSub(
                Review::query()
                    ->selectRaw('count(id)')
                    ->whereHas('appointment', function ($qb) {
                        $qb->whereRaw('portfolio_id = `portfolios`.`id`');
                    }),
                'reviews_count'
            )
            ->selectSub(
                Like::query()
                    ->selectRaw('count(id)')
                    ->where('status', '=', true)
                    ->whereRaw('type_id = `portfolios`.`id`')
                    ->where('type', '=', 'portfolio'),
                'portfolio_likes_count'
            )
            ->selectSub(
                Appointment::query()
                    ->selectRaw('count(id)')
                    ->where('created_at', '>', Carbon::now()->subMonths(3))
                    ->whereRaw('portfolio_id = `portfolios`.`id`'),
                'trending'
            )
            ->selectSub(
                Appointment::query()
                    ->selectRaw('count(id)')
                    ->whereRaw('portfolio_id = `portfolios`.`id`'),
                'appointments_count'
            )
            ->selectSub(
                Category::query()
                    ->selectRaw('name')
                    ->whereRaw('id = `portfolios`.`category_id`'),
                'category_name'
            )
            ->selectSub(
                DB::query()
                    ->selectRaw(
                        "exists(
                            select
                                1
                            from
                                `likes`
                            where
                                `likes`.`type` = \"portfolio\"
                                and
                                `likes`.`type_id` = `portfolios`.`id`
                                and
                                `likes`.`user_id` = {$user->id}
                                and
                                `likes`.`status` = true
                        )"
                    ),
                'favourite'
            );

        return $queryBuilder;
    }

    public function getPortfolios(Request $request)
    {
        $user = $request->user();
        $user->load(['location_service']);

        $perPage = formatPerPage($request);
        $query = $request->query('query');
        $categoryId = $request->query('category_id');
        $stylistId = $request->query('stylist_id');
        $favourite = $request->query('favourite');
        $sortGroups = formatRequestSort($request, ['title', 'average_rating', 'price', 'duration', 'favourite', 'portfolio_likes_count', 'trending', 'reviews_count', 'visits_count', 'category_name', 'appointments_count'], '-trending');


        $queryBuilder = $this->getPortfolioQueryBuilder($user)
            ->where('status', '=', true)
            ->where('is_available', '=', true)
            ->whereHas('user', function ($qb) use ($query) {
                $qb->where('role', 'stylist')->whereHas('stylist_profile', function ($qb) {
                    $qb->where('is_available', true)->where('status', 'approved');
                });
            });

        if ($categoryId) {
            $queryBuilder = $queryBuilder->where('category_id', '=', $categoryId);
        }

        if ($stylistId) {
            $queryBuilder = $queryBuilder->where('user_id', '=', $stylistId);
        }

        if ($favourite) {
            $favouriteBool = filter_var($favourite, FILTER_VALIDATE_BOOLEAN);

            $handler = function ($qb) use ($user) {
                $qb->where('status', '=', true)->where('user_id', '=', $user->id);
            };

            if ($favouriteBool) {
                $queryBuilder = $queryBuilder->whereHas('likes', $handler);
            } else {
                $queryBuilder = $queryBuilder->whereDoesntHave('likes', $handler);
            }
        }

        if ($query) {
            $queryBuilder = $queryBuilder->where(function ($qb) use ($query) {
                $qb
                    ->whereLike('title', '%' . $query . '%', false)
                    ->orWhereLike('tags', '%' . $query . '%', false)
                    ->orWhereHas('category', function ($qb) use ($query) {
                        $qb->whereLike('name', '%' . $query . '%', false);
                    });
            });
        }

        foreach ($sortGroups as $sortGroup) {
            switch ($sortGroup['property']) {
                default: {
                    $queryBuilder->orderBy($sortGroup['property'], $sortGroup['direction']);
                    break;
                }
            }
        }

        $paginatedResp = $queryBuilder
            ->with([
                'category',
                'user' => function ($qb) {
                    $qb->withTrashed();
                },
                'user.stylist_profile',
            ])
            ->cursorPaginate($perPage, ['*'], 'page');

        $paginatedResp = $paginatedResp->through(function (Portfolio $portfolio) {
            // // Get dynamic availability data
            // $availabilityData = calculateStylistAvailability($stylist);

            return array_merge(
                Arr::except($portfolio->toArray(), [
                    'category_name'
                ]),
                [
                    'reviews_count' => (int) $portfolio->reviews_count,
                    'portfolio_likes_count' => (int) $portfolio->portfolio_likes_count,
                    'trending' => (int) $portfolio->trending,
                    'appointments_count' => (int) $portfolio->appointments_count,
                    'price' => (float) $portfolio->price,
                    'favourite' => (bool) $portfolio->favourite,
                    'average_rating' => (float) $portfolio->average_rating,
                    'media_urls' => is_array($portfolio->media_urls) ? $portfolio->media_urls : [],
                ]
            );
        });

        return $paginatedResp;
    }

    public function getPortfolio(Request $request, $portfolioId)
    {
        $user = $request->user();
        $user->load(['location_service']);

        $portfolio = $this->getPortfolioQueryBuilder($user)
            ->where('id', '=', $portfolioId)
            ->with([
                'category',
                'user' => function ($qb) {
                    $qb->withTrashed();
                },
                'user.stylist_profile',
            ])
            ->firstOrFail();

        $portfolio->increment('visits_count');

        // Get actual reviews with customer information
        $actual_reviews = Review::whereHas('appointment', function ($query) use ($portfolio) {
            $query->where('portfolio_id', $portfolio->id);
        })
            ->with(['appointment.customer'])
            ->latest()
            ->take(5)
            ->get();


        return array_merge(
            Arr::except($portfolio->toArray(), [
                'category_name'
            ]),
            [
                'reviews_count' => (int) $portfolio->reviews_count,
                'portfolio_likes_count' => (int) $portfolio->portfolio_likes_count,
                'trending' => (int) $portfolio->trending,
                'appointments_count' => (int) $portfolio->appointments_count,
                'price' => (float) $portfolio->price,
                'favourite' => (bool) $portfolio->favourite,
                'average_rating' => (float) $portfolio->average_rating,
                'media_urls' => is_array($portfolio->media_urls) ? $portfolio->media_urls : [],
                'reviews' => $actual_reviews,
            ]
        );
    }

    public function bookAppointment(Request $request)
    {
        $request->validate([
            'portfolio_id' => 'required|exists:portfolios,id',
            // 'amount' => 'required|numeric|min:0|gt:0',
            'selected_date' => ['required', 'date'],
            'selected_time' => 'required|string',
            'address' => 'sometimes|string',
            'extra' => 'nullable|string',
        ]);

        $customer = $request->user();
        $portfolio = Portfolio::with([
            'user' => function ($qb) {
                return $qb->withTrashed();
            },
            'user.stylist_profile'
        ])->findOrFail($request->portfolio_id);

        if (!($portfolio->user && $portfolio->user->role === 'stylist' && $portfolio->user->stylist_profile && !$portfolio->user->deleted_at)) {
            return response()->json([
                'message' => 'Portfolio stylist is currently not available'
            ], 400);
        }

        if (!($portfolio->user->stylist_profile->is_available)) {
            return response()->json([
                'message' => 'Portfolio stylist is currently not available to take any booking'
            ], 400);
        }

        $deposit = Deposit::where('user_id', $customer->id)->where('portfolio_id', $request->portfolio_id)->where('status', 'pending')->whereNull('appointment_id')->latest()->first();

        $price = abs((float) $portfolio->price);
        $amountTodebitFromWallet = $price;
        $depositAmount = $deposit ? (float) $deposit->amount : 0;

        if ($deposit) {
            $amountTodebitFromWallet = $price - $depositAmount;
            if ($amountTodebitFromWallet < 0) {
                $amountTodebitFromWallet = 0;
            }
        }

        $customerWalletBalance = (float) $customer->balance;

        // Check if customer has insufficient balance
        if ($price > ($customerWalletBalance + $depositAmount)) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient balance. Please add funds to continue.',
                'required_amount' => $price - $customerWalletBalance,
            ], 400);
        }


        $appointment = null;
        DB::transaction(function () use ($deposit, $amountTodebitFromWallet, $portfolio, $customer, $request, &$appointment) {
            // Create appointment codes
            do {
                $appointmentCode = 'SF-' . strtoupper(substr(md5(uniqid()), 0, 6));
            } while (Appointment::where('appointment_code', $appointmentCode)->exists());

            do {
                $completionCode = 'CP-' . strtoupper(substr(md5(uniqid() . 'complete'), 0, 6));
            } while (Appointment::where('completion_code', $completionCode)->exists());

            // Create appointment with processing status
            $appointment_time = Carbon::createFromFormat('g:i A', $request->selected_time)->format('H:i:s');
            $appointment = Appointment::create([
                'stylist_id' => $portfolio->user_id,
                'customer_id' => $customer->id,
                'portfolio_id' => $portfolio->id,
                'amount' => $portfolio->price,
                'duration' => $portfolio->duration,
                'appointment_code' => $appointmentCode,
                'completion_code' => $completionCode,
                'status' => $deposit ? 'processing' : 'pending', //Since amount was deducted from the wallet or processing if there is a deposit
                'booking_id' => 'BK-' . time() . '-' . $customer->id,
                'appointment_date' => $request->selected_date,
                'appointment_time' => $appointment_time,
                'extra' => $request->extra ?? null,
                'service_notes' => $request->address ?? null,
            ]);

            if ($request->address) {
                $customer->update(['country' => $request->address]);
            }

            if ($amountTodebitFromWallet > 0) {
                // Deduct amount from customer balance
                User::query()
                    ->where('id', '=', $customer->id)
                    ->where('balance', '>=', $amountTodebitFromWallet)
                    ->update(['balance' => DB::raw("balance - {$amountTodebitFromWallet}")]);
            }

            if ($deposit) {
                $deposit->update(['appointment_id' => $appointment->id]);

                //Txn for debiting wallet
                if ($amountTodebitFromWallet > 0) {
                    Transaction::create([
                        'user_id' => $customer->id,
                        'appointment_id' => $appointment->id,
                        'amount' => $amountTodebitFromWallet,
                        'type' => 'payment',
                        'status' => 'approved',
                        'description' => 'Partial appointment booking payment from wallet',
                        'ref' => 'PAY-PARTIAL-WALLET-DEBIT-' . time(),
                    ]);
                }

                $pendingAppointmentTxn = Transaction::create([
                    'user_id' => $customer->id,
                    'appointment_id' => $appointment->id,
                    'amount' => $deposit->amount,
                    'type' => 'payment',
                    'status' => 'pending',
                    'description' => 'Appointment booking payment from deposit',
                    'ref' => 'PAY-DEPOSIT-DEBIT-' . time(),
                ]);

                defer(function () use ($appointment, $deposit, $pendingAppointmentTxn) {
                    broadcast(new PaymentVerificationRequested($appointment, $deposit->amount, $pendingAppointmentTxn->ref));
                });
            } else {
                /*$transaction = */
                Transaction::create([
                    'user_id' => $customer->id,
                    'appointment_id' => $appointment->id,
                    'amount' => $portfolio->price,
                    'type' => 'payment',
                    'status' => 'approved',
                    'description' => 'Appointment booking payment from wallet',
                    'ref' => 'PAY-FULL-WALLET-DEBIT' . time(),
                ]);
            }

            // Load relationships for events
            $appointment->load([
                'customer' => function ($qb) {
                    $qb->withTrashed();
                },
                'stylist' => function ($qb) {
                    $qb->withTrashed();
                },
                'portfolio' => function ($qb) {
                    $qb->withTrashed();
                },
                'portfolio.category'
            ]);
        });

        if (!$appointment) {
            return response()->json([
                'message' => 'An error occurred while booking appointment'
            ], 400);
        }

        // Broadcast appointment created event
        // broadcast(new AppointmentCreated($appointment));
        sendNotification(
            $appointment->stylist_id,
            route('stylist.appointment', $appointment->id),
            'New Appointment',
            'You have a new appointment from ' . $appointment->customer->name,
            'normal',
        );

        defer(function () use ($appointment) {
            Mail::to($appointment->stylist->email)->send(new AppointmentBookedStylistEmail(
                appointment: $appointment,
                stylist: $appointment->stylist,
                customer: $appointment->customer,
                portfolio: $appointment->portfolio
            ));
        });

        return $appointment;
    }

    public function getAppointments(Request $request)
    {
        $customer = $request->user();
        $customer->load(['location_service']);
        $perPage = formatPerPage($request);

        $appointments = $customer->customerAppointments()
            ->whereHas('stylist')
            ->with([
                'stylist' => function ($qb) {
                    $qb->withTrashed();
                },
                'stylist.location_service',
                'portfolio' => function ($qb) {
                    $qb->withTrashed();
                },
                'portfolio.category'
            ])
            ->orderBy('created_at', 'desc')
            ->cursorPaginate($perPage, ['*'], 'page')
            ->through(function ($appointment) use ($customer) {
                $stylist = $appointment->stylist;
                $locationService = $customer->location_service;
                $targetLocationService = $stylist->location_service;

                if (!$locationService || !$locationService->hasLocation() || !$targetLocationService || !$targetLocationService->hasLocation()) {
                    $distance = null;
                } else {
                    $distance = $locationService->distanceTo($targetLocationService);
                    $distance = $distance !== null ? round($distance, 2) . 'km away' : null;
                }

                $appointment = $appointment->toArray();
                return Arr::set($appointment, 'distance_from_stylist', $distance);
            });

        return $appointments;
    }

    public function getAppointment(Request $request, $appointmentId)
    {
        $customer = $request->user();
        $customer->load(['location_service']);
        $appointment = $customer->customerAppointments()->with([
            'stylist' => function ($qb) {
                $qb->withTrashed();
            },
            'stylist.location_service',
            'portfolio' => function ($qb) {
                $qb->withTrashed();
            },
            'portfolio.category',
            'review',
            'disputes',
            'proof',
            'pouches',
            'reminders'
        ])->where('id', $appointmentId)->firstOrFail();

        $stylist = $appointment->stylist;
        $locationService = $customer->location_service;
        $targetLocationService = $stylist->location_service;

        if (!$locationService || !$locationService->hasLocation() || !$targetLocationService || !$targetLocationService->hasLocation()) {
            $distance = null;
        } else {
            $distance = $locationService->distanceTo($targetLocationService);
            $distance = $distance !== null ? round($distance, 2) . 'km away' : null;
        }

        $appointment = $appointment->toArray();
        return Arr::set($appointment, 'distance_from_stylist', $distance);
    }

    public function submitAppointmentReview(Request $request, $appointmentId)
    {
        $customer = $request->user();
        $appointment = $customer->customerAppointments()->findOrFail($appointmentId);
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string|max:1000'
        ]);

        Review::updateOrCreate([
            'user_id' => $customer->id,
            'appointment_id' => $appointment->id,
        ], [
            'user_id' => $customer->id,
            'appointment_id' => $appointment->id,
            'rating' => $request->rating,
            'comment' => $request->review,
        ]);

        return response()->noContent();
    }

    public function disputeAppointment(Request $request, $appointmentId)
    {
        $customer = $request->user();
        $validated = $request->validate([
            'comment' => 'required|string',
            'images' => 'required|array|max:10|min:1',
            'images.*' => 'image|max:5120',
        ]);

        $appointment = $customer->customerAppointments()->findOrFail($appointmentId);

        $imagePaths = [];

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $imagePaths[] = $file->store('works/dispute', 'public');
            }
        }

        $dispute = AppointmentDispute::create([
            'appointment_id' => $appointment->id,
            'customer_id' => $appointment->customer_id,
            'stylist_id' => $appointment->stylist_id,
            'from' => 'customer',
            'comment' => $validated['comment'],
            'image_urls' => $imagePaths,
            'status' => 'open',
            'priority' => 'medium',
            'ref_id' => $appointment->id,
            'resolution_amount' => $appointment->amount,
        ]);

        $appointment->update(['status' => 'escalated']);

        defer(function () use ($appointment, $dispute) {
            Mail::to('admin@snipfair.com')->send(new AppointmentDisputeEmail(
                dispute: $dispute,
                appointment: $appointment,
                recipient: null, // admin doesn't need recipient object
                recipientType: 'admin'
            ));

            $superAdmins = Admin::where('role', 'super-admin')
                ->where('is_active', true)
                ->get();

            foreach ($superAdmins as $admin) {
                AdminNotificationHelper::create(
                    $admin->id,
                    route('admin.disputes.show', $dispute->id),
                    'New Dispute from ' . $appointment->customer->name,
                    "Email: {$appointment->customer->email}\nMessage: " . substr($dispute->comment, 0, 100) . '...',
                    'normal'
                );
            }
        });

        return response()->noContent();
    }

    public function updateAppointment(Request $request, $appointmentId)
    {
        $customer = $request->user();
        $request->validate([
            'verdict' => 'required|string|in:cancel,reschedule',
        ]);

        $appointment = $customer
            ->customerAppointments()
            ->with([
                'customer' => function ($qb) {
                    return $qb->withTrashed();
                },
                'stylist' => function ($qb) {
                    return $qb->withTrashed();
                },
                'pouch'
            ])
            ->findOrFail($appointmentId);

        $appointmentDateTime = Carbon::parse(
            $appointment->appointment_date . ' ' . $appointment->appointment_time
        );
        $hoursUntilAppointment = now()->diffInHours($appointmentDateTime, false);

        $config = WebsiteConfiguration::first();
        $comissionRate = $config->commission_rate ? ((float) $config->commission_rate) : 0;

        if (!in_array($appointment->status, ['pending', 'approved', 'confirmed'])) {
            return response()->json([
                'message' => "You can only {$request->verdict} a pending, approved or confirmed booking"
            ], 400);
        }

        $totalAmountToStylist = 0;

        switch ($request->verdict) {
            case 'cancel': {
                $cancelPenaltyPercentage = 0;

                //if the customer cancels beyond the set threshold by the super admin
                if ($config->appointment_canceling_threshold > $hoursUntilAppointment) {
                    $cancelPenaltyPercentage = $config->appointment_canceling_percentage;
                }

                $totalAmountToStylist = $appointment->amount * ($cancelPenaltyPercentage / 100);
                break;
            }

            case 'reschedule': {
                $reschedulePenaltyPercentage = 0;

                //if the customer rescheduled beyond the set threshold by the super admin
                if ($config->appointment_reschedule_threshold > $hoursUntilAppointment) {
                    $reschedulePenaltyPercentage = $config->appointment_canceling_percentage;
                }

                $totalAmountToStylist = $appointment->amount * ($reschedulePenaltyPercentage / 100);
                break;
            }
        }


        DB::transaction(function () use ($request, $customer, $appointment, $totalAmountToStylist, $comissionRate) {
            //Platform comission from the amount stylist made
            $platformComissionFromTotalAmountToStylist = $totalAmountToStylist * ($comissionRate / 100);

            //Actual amount to fund stylist
            $amountToFundStylist = $totalAmountToStylist - $platformComissionFromTotalAmountToStylist;

            $amountToFundCustomer = ((float) $appointment->amount) - $totalAmountToStylist;

            $statusToUpdateTo = match ($request->verdict) {
                'cancel' => 'canceled',
                'reschedule' => 'rescheduled',
                default => $appointment->status
            };

            $previousStatus = $appointment->status;
            $appointment->status = $statusToUpdateTo;
            $appointment->save();

            defer(function () use ($appointment, $previousStatus) {
                broadcast(new AppointmentStatusUpdated($appointment, $previousStatus));
            });

            $statusActionStr = match ($request->verdict) {
                'cancel' => 'cancellation',
                'reschedule' => 'rescheduling',
                default => ''
            };

            //Escrow balance for stylist
            $pouch = in_array($appointment->status, ['approved', 'confirmed']) && $appointment->pouch ? $appointment->pouch : null;

            if ($pouch && $pouch->amount > 0) {
                $pouch->status = 'refunded';
                $pouch->save();
            }

            // refund appoitment amount to customer less charges
            User::query()
                ->where('id', '=', $customer->id)
                ->update(['balance' => DB::raw("balance + {$amountToFundCustomer}")]);

            $txnDescriptionSuffix = $amountToFundStylist > 0 ? 'after default deductions' : 'with no deduction';
            Transaction::create([
                'user_id' => $customer->id,
                'appointment_id' => $appointment->id,
                'amount' => $amountToFundCustomer,
                'type' => 'refund',
                'status' => 'completed',
                'ref' => 'RSC-' . time(),
                'description' => "Refund for {$statusActionStr} {$txnDescriptionSuffix}",
            ]);

            if ($amountToFundStylist > 0) {
                AppointmentPouch::create([
                    'appointment_id' => $appointment->id,
                    'amount' => $amountToFundStylist,
                    'status' => 'holding',
                    'user_id' => $appointment->stylist_id,
                ]);

                Transaction::create([
                    'user_id' => $appointment->stylist_id,
                    'appointment_id' => $appointment->id,
                    'amount' => $platformComissionFromTotalAmountToStylist,
                    'type' => 'other',
                    'status' => 'completed',
                    'ref' => "{$statusActionStr}AdminCommission-" . time(),
                    'description' => "Commission for {$statusActionStr}",
                ]);
            }
        });

        return response()->noContent();
    }

    public function updatePreferenceSettings(Request $request)
    {
        $request->validate([
            'preferred_time' => ['string', 'in:,morning,afternoon,evening,special'],
            'preferred_stylist' => ['string', 'in:,male,female,none'],
            'auto_rebooking' => ['boolean'],
            'use_location' => ['boolean'],
            'enable_mobile_appointment' => ['boolean'],
            'email_reminders' => ['boolean'],
            'sms_reminders' => ['boolean'],
            'phone_reminders' => ['boolean'],
            'language' => ['required', 'string', 'in:english,spanish,french'],
            'currency' => ['required', 'string', 'in:$,€,£'],
        ]);

        $customer = $request->user();
        $customer->update([
            'use_location' => $request->use_location,
        ]);

        // Get or create customer settings record
        $customerSetting = $customer->customerSetting ?? new CustomerSetting(['user_id' => $customer->id]);

        // Update preferences
        $customerSetting->fill([
            'preferred_time' => $request->preferred_time,
            'preferred_stylist' => $request->preferred_stylist,
            'auto_rebooking' => $request->auto_rebooking,
            'enable_mobile_appointment' => $request->enable_mobile_appointment,
            'email_reminders' => $request->email_reminders,
            'sms_reminders' => $request->sms_reminders,
            'phone_reminders' => $request->phone_reminders,
            'language' => $request->language,
            'currency' => $request->currency,
        ]);

        $customerSetting->save();

        return response()->noContent();
    }

    public function updateNotificationSettings(Request $request)
    {
        $request->validate([
            'booking_confirmation' => ['boolean'],
            'appointment_reminders' => ['boolean'],
            'favorite_stylist_update' => ['boolean'],
            'promotions_offers' => ['boolean'],
            'review_reminders' => ['boolean'],
            'payment_confirmations' => ['boolean'],
            'email_notifications' => ['boolean'],
            'push_notifications' => ['boolean'],
            'sms_notifications' => ['boolean'],
        ]);

        $customer = $request->user();

        // Get or create customer notification settings record
        $notificationSetting = $customer->customerNotificationSetting ?? new CustomerNotificationSetting(['user_id' => $customer->id]);

        // Update notification settings
        $notificationSetting->fill($request->only([
            'booking_confirmation',
            'appointment_reminders',
            'favorite_stylist_update',
            'promotions_offers',
            'review_reminders',
            'payment_confirmations',
            'email_notifications',
            'push_notifications',
            'sms_notifications',
        ]));

        $notificationSetting->save();

        return response()->noContent();
    }

    public function updateBillingInfo(Request $request)
    {
        $request->validate([
            'billing_name' => 'required|string|max:255',
            'billing_email' => 'required|email|max:255',
            'billing_city' => 'nullable|string|max:255',
            'billing_zip' => 'nullable|string|max:20',
            'billing_location' => 'nullable|string|max:500',
        ]);

        $customer = $request->user();
        $customer_profile = $customer->customer_profile;

        if (!$customer_profile) {
            $customer_profile = $customer->customer_profile()->create([
                'billing_name' => $request->billing_name,
                'billing_email' => $request->billing_email,
                'billing_city' => $request->billing_city,
                'billing_zip' => $request->billing_zip,
                'billing_location' => $request->billing_location,
            ]);
        } else {
            $customer_profile->update([
                'billing_name' => $request->billing_name,
                'billing_email' => $request->billing_email,
                'billing_city' => $request->billing_city,
                'billing_zip' => $request->billing_zip,
                'billing_location' => $request->billing_location,
            ]);
        }

        return response()->noContent();
    }

    // public function explore(Request $request)
    // {
    //     $customer = $request->user();
    //     $stylists = User::where('role', 'stylist')->whereHas('stylist_profile', function ($query) {
    //         $query->where('is_available', true)->where('status', 'approved');
    //     })->get();
    //     $stylistFormatted = $stylists->map(function ($stylist) use ($customer) {
    //         $stylist_likes = $stylist->stylist_profile->likes()->where('status', true)->count();
    //         $portfolio_likes = $stylist->portfolioLikes()->where('status', true)->count();
    //         $total_likes = $stylist_likes + $portfolio_likes;
    //         $stylist_rating = Review::whereHas('appointment', function ($query) use ($stylist) {
    //             $query->where('stylist_id', $stylist->id);
    //         })->avg('rating') ?? 0;
    //         $reviews = $stylist->stylistAppointments()->whereHas('review')->count();
    //         $likedByMe = $stylist->stylist_profile->likes()->where('user_id', $customer->id)->where('status', true)->exists();
    //         // $likedByMe = $stylist->portfolioLikes()->where('user_id', $customer->id)->where('status', true)->exists();
    //         $minPortfolio = round($stylist->portfolios->min('price'));
    //         $maxPortfolio = round($stylist->portfolios->max('price'));
    //         // $categories = $stylist->portfolios()->with('category')->get()->groupBy('category.name')->take(3)->keys()->toArray();
    //         $categories = $stylist->portfolios()->whereHas('category')->with('category')->get()
    //             ->map(function ($portfolio) {
    //                 return [
    //                     'category' => $portfolio->category->name ?? 'Uncategorized',
    //                     'price' => $portfolio->price,
    //                 ];
    //             })
    //             ->take(3)
    //             ->toArray();

    //         $locationService = $customer->location_service;
    //         $targetLocationService = $stylist->location_service;
    //         if (!$locationService || !$locationService->hasLocation() || !$targetLocationService || !$targetLocationService->hasLocation()) {
    //             $distance = 'N/A';
    //         } else {
    //             $distance = $locationService->distanceTo($targetLocationService);
    //             $distance = $distance !== null ? round($distance, 2) . ' km' : 'N/A';
    //         }

    //         // Get dynamic availability data
    //         $availabilityData = calculateStylistAvailability($stylist);
    //         $stylist->stylist_profile->increment('visits_count');

    //         return [
    //             'id' => $stylist->id,
    //             'stylist_profile_id' => $stylist->stylist_profile->id ?? null,
    //             'availability_status' => $stylist->stylist_profile->is_available ?? false,
    //             'availability' => $availabilityData['availability'],
    //             'description' => $stylist->bio,
    //             'category' => $categories[0]['category'] ?? null,
    //             'distance' => $distance,
    //             'response_time' => $availabilityData['response_time'],
    //             'next_available' => $availabilityData['next_available'],
    //             'average_rating' => number_format($stylist_rating, 1),
    //             'total_reviews' => $reviews,
    //             'is_liked' => $likedByMe,
    //             'name' => $stylist->name,
    //             'appointment_counts' => $stylist->stylistAppointments()->count(),
    //             'title' => $stylist->stylist_profile->business_name ?? 'N/A',
    //             'certificates' => $stylist->stylist_certifications->pluck('title')->all(),
    //             'profile_image' => $this->getAvatar($stylist),
    //             'banner_image' => $stylist->stylist_profile->banner ? asset('storage/' . $stylist->stylist_profile->banner) : null,
    //             'sample_images' => $stylist->portfolios()->whereNotNull('media_urls')->pluck('media_urls')->take(3),
    //             'price_range' => ($minPortfolio !== null && $maxPortfolio !== null) ? 'R' . "{$minPortfolio}-R{$maxPortfolio}" : null,
    //             'price' => $minPortfolio,
    //             'location' => $stylist->country,
    //             'categories' => $categories,
    //             'years_of_experience' => $stylist->stylist_profile->years_of_experience ?? 0,
    //             'likes_count' => $total_likes,
    //             'section' => $stylist->is_featured ? 'top_rated' : 'online',
    //         ];
    //     });

    //     $likedPortfolioIds = $customer->likes()->where('type', 'portfolio')->pluck('type_id')->toArray();
    //     $portfolios = Portfolio::whereHas('user')->with('user')
    //         ->whereHas('user.stylist_profile', function ($query) {
    //             $query->where('is_available', true);
    //         })->get()
    //         ->map(function ($portfolio) use ($likedPortfolioIds) {
    //             $portfolio_likes = $portfolio->likes()->where('status', true)->count();
    //             $portfolio_average_rating = Review::whereHas('appointment', function ($query) use ($portfolio) {
    //                 $query->where('portfolio_id', $portfolio->id);
    //             })->avg('rating') ?? 0;
    //             $portfolio_total_reviews = $portfolio->appointments()->whereHas('review')->count();
    //             $portfolio->is_liked = in_array($portfolio->id, $likedPortfolioIds);
    //             $portfolio->increment('visits_count');
    //             return [
    //                 'id' => $portfolio->id,
    //                 'banner_image' => $portfolio->media_urls[0] ? asset('storage/' . $portfolio->media_urls[0]) : null,
    //                 'category' => $portfolio->category->name,
    //                 'name' => $portfolio->title,
    //                 'description' => $portfolio->description,
    //                 'appointment_counts' => $portfolio->appointments()->count(),
    //                 'is_liked' => $portfolio->is_liked,
    //                 'likes_count' => $portfolio_likes,
    //                 'average_rating' => number_format($portfolio_average_rating, 1),
    //                 'total_reviews' => $portfolio_total_reviews,
    //                 'price' => $portfolio->price,
    //                 'stylist_name' => $portfolio->user->name,
    //                 'section' => 'featured',
    //             ];
    //         });

    //     $merged = $stylistFormatted
    //         ->merge($portfolios)
    //         ->map(function ($item) {
    //             return [
    //                 'id' => $item['id'] ?? null,
    //                 'profile_id' => $item['stylist_profile_id'] ?? null,
    //                 'availability' => $item['availability'] ?? null,
    //                 'availability_status' => $item['availability_status'] ?? null,
    //                 'distance' => $item['distance'] ?? null,
    //                 'response_time' => $item['response_time'] ?? null,
    //                 'next_available' => $item['next_available'] ?? null,
    //                 'average_rating' => $item['average_rating'] ?? null,
    //                 'total_reviews' => $item['total_reviews'] ?? null,
    //                 'is_liked' => $item['is_liked'] ?? null,
    //                 'name' => $item['name'] ?? null,
    //                 'title' => $item['title'] ?? null,
    //                 'certificates' => $item['certificates'] ?? null,
    //                 'profile_image' => $item['profile_image'] ?? null,
    //                 'banner_image' => $item['banner_image'] ?? null,
    //                 'sample_images' => $item['sample_images'] ?? null,
    //                 'price_range' => $item['price_range'] ?? null,
    //                 'location' => $item['location'] ?? null,
    //                 'categories' => $item['categories'] ?? null,
    //                 'years_of_experience' => $item['years_of_experience'] ?? null,
    //                 'likes_count' => $item['likes_count'] ?? null,
    //                 'section' => $item['section'] ?? null,
    //                 'category' => $item['category'] ?? null,
    //                 'description' => $item['description'] ?? null,
    //                 'appointment_counts' => $item['appointment_counts'] ?? null,
    //                 'price' => $item['price'] ?? null,
    //                 'stylist_name' => $item['stylist_name'] ?? null,
    //             ];
    //         });
    //     return Inertia::render('Customer/Dashboard', [
    //         'all_collections' => $merged,
    //     ]);
    // }

    // public function getStylists(Request $request)
    // {
    //     $customer = $request->user();
    //     if ($customer->role !== 'customer')
    //         return redirect()->route('link.show', $customer->id);

    //     $stylists = User::where('role', 'stylist')->whereHas('stylist_profile', function ($query) {
    //         $query->where('is_available', true)->where('status', 'approved');
    //     })->get();
    //     $stylistFormatted = $stylists->map(function ($stylist) use ($customer) {
    //         $stylist_likes = $stylist->stylist_profile->likes()->where('status', true)->count();
    //         $portfolio_likes = $stylist->portfolioLikes()->where('status', true)->count();
    //         $total_likes = $stylist_likes + $portfolio_likes;
    //         $stylist_rating = Review::whereHas('appointment', function ($query) use ($stylist) {
    //             $query->where('stylist_id', $stylist->id);
    //         })->avg('rating') ?? 0;
    //         $reviews = $stylist->stylistAppointments()->whereHas('review')->count();
    //         $likedByMe = $stylist->stylist_profile->likes()->where('user_id', $customer->id)->where('status', true)->exists();
    //         $minPortfolio = $stylist->portfolios->min('price');
    //         $maxPortfolio = $stylist->portfolios->max('price');
    //         // $categories = $stylist->portfolios()->with('category')->get()->groupBy('category.name')->take(3)->keys()->toArray();
    //         $all_categories = $stylist->portfolios()->whereHas('category')->with('category')->get();
    //         $categories = $all_categories
    //             ->map(function ($portfolio) {
    //                 return [
    //                     'category' => $portfolio->category->name ?? 'Uncategorized',
    //                     'price' => $portfolio->price,
    //                 ];
    //             })
    //             ->take(3)
    //             ->toArray();
    //         $categories_names = $all_categories->pluck('category.name')->unique()->filter()->implode(', ');

    //         $locationService = $customer->location_service;
    //         $targetLocationService = $stylist->location_service;
    //         if (!$locationService || !$locationService->hasLocation() || !$targetLocationService || !$targetLocationService->hasLocation()) {
    //             $distance = 'N/A';
    //         } else {
    //             $distance = $locationService->distanceTo($targetLocationService);
    //             $distance = $distance !== null ? round($distance, 2) . ' km' : 'N/A';
    //         }

    //         // Get dynamic availability data
    //         $availabilityData = calculateStylistAvailability($stylist);
    //         $stylist->stylist_profile->increment('visits_count');

    //         return [
    //             'id' => $stylist->id,
    //             'stylist_profile_id' => $stylist->stylist_profile->id ?? null,
    //             'availability_status' => $stylist->stylist_profile->is_available ?? false,
    //             'availability' => $availabilityData['availability'],
    //             'description' => $stylist->bio . ' | ' . $categories_names,
    //             'category' => $categories[0]['category'] ?? null,
    //             'distance' => $distance,
    //             'appointment_counts' => $stylist->stylistAppointments()->count(),
    //             'response_time' => $availabilityData['response_time'],
    //             'next_available' => $availabilityData['next_available'],
    //             'average_rating' => number_format($stylist_rating, 1),
    //             'total_reviews' => $reviews,
    //             'is_liked' => $likedByMe,
    //             'name' => $stylist->name,
    //             'title' => $stylist->stylist_profile->business_name ?? 'N/A',
    //             'certificates' => $stylist->stylist_certifications->pluck('title')->all(),
    //             'profile_image' => $this->getAvatar($stylist),
    //             'banner_image' => $stylist->stylist_profile->banner ? asset('storage/' . $stylist->stylist_profile->banner) : null,
    //             'sample_images' => $stylist->portfolios()->whereNotNull('media_urls')->pluck('media_urls')->take(3),
    //             'price_range' => ($minPortfolio !== null && $maxPortfolio !== null) ? "R{$minPortfolio}-R{$maxPortfolio}" : null,
    //             'price' => $minPortfolio,
    //             'location' => $stylist->country,
    //             'categories' => $categories,
    //             'years_of_experience' => $stylist->stylist_profile->years_of_experience ?? 0,
    //             'likes_count' => $total_likes,
    //             'section' => $stylist->is_featured ? 'top_rated' : 'online',
    //         ];
    //     });

    //     $stylists_complete = $stylistFormatted
    //         ->map(function ($item) {
    //             return [
    //                 'id' => $item['id'] ?? null,
    //                 'profile_id' => $item['stylist_profile_id'] ?? null,
    //                 'availability' => $item['availability'] ?? null,
    //                 'availability_status' => $item['availability_status'] ?? null,
    //                 'distance' => $item['distance'] ?? null,
    //                 'response_time' => $item['response_time'] ?? null,
    //                 'next_available' => $item['next_available'] ?? null,
    //                 'average_rating' => $item['average_rating'] ?? null,
    //                 'total_reviews' => $item['total_reviews'] ?? null,
    //                 'is_liked' => $item['is_liked'] ?? null,
    //                 'name' => $item['name'] ?? null,
    //                 'title' => $item['title'] ?? null,
    //                 'certificates' => $item['certificates'] ?? null,
    //                 'profile_image' => $item['profile_image'] ?? null,
    //                 'banner_image' => $item['banner_image'] ?? null,
    //                 'sample_images' => $item['sample_images'] ?? null,
    //                 'price_range' => $item['price_range'] ?? null,
    //                 'location' => $item['location'] ?? null,
    //                 'categories' => $item['categories'] ?? null,
    //                 'years_of_experience' => $item['years_of_experience'] ?? null,
    //                 'likes_count' => $item['likes_count'] ?? null,
    //                 'section' => $item['section'] ?? null,
    //                 'category' => $item['category'] ?? null,
    //                 'description' => $item['description'] ?? null,
    //                 'appointment_counts' => $item['appointment_counts'] ?? null,
    //                 'price' => $item['price'] ?? null,
    //                 'stylist_name' => $item['stylist_name'] ?? null,
    //             ];
    //         });

    //     return Inertia::render('Customer/Stylists', [
    //         'stylists' => $stylists_complete,
    //     ]);
    // }

    // public function getCustomer(Request $request, $id)
    // {
    //     $customer = User::where('role', 'customer')->where('id', $id)->firstOrFail();
    //     $stylist = $request->user();

    //     $appointment_counts = $customer->customerAppointments()->count();
    //     $completed_appointments = $customer->customerAppointments()->where('status', 'completed')->count();
    //     $total_spending = $customer->customerAppointments()->where('status', '!=', 'processing')->sum('amount');
    //     $canceled_appointments = $customer->customerAppointments()->where('status', 'canceled')->count();
    //     $rescheduled_appointments = $customer->customerAppointments()->where('status', 'rescheduled')->count();

    //     //use the customer's appointment.portfolio.category.name to get the 5 most recent servicers
    //     $preferred_services = $customer->customerAppointments()
    //         ->whereHas('portfolio.category')
    //         ->with('portfolio.category')
    //         ->latest()
    //         ->take(5)
    //         ->get()
    //         ->pluck('portfolio.category.name')
    //         ->unique()
    //         ->values();

    //     // Get dynamic availability data
    //     $locationService = $customer->location_service;
    //     $targetLocationService = $stylist->location_service;
    //     if (!$locationService || !$locationService->hasLocation() || !$targetLocationService || !$targetLocationService->hasLocation()) {
    //         $distance = 'N/A';
    //     } else {
    //         $distance = $locationService->distanceTo($targetLocationService);
    //         $distance = $distance !== null ? round($distance, 2) . ' km' : 'N/A';
    //     }
    //     $appointments = Appointment::where('stylist_id', $stylist->id)->where('customer_id', $customer->id)->with(['stylist', 'portfolio.category'])->latest()->get();

    //     return Inertia::render('Stylist/Customer', [
    //         'customer' => [
    //             'id' => $customer->id,
    //             'name' => $customer->name,
    //             'email' => $customer->email,
    //             'profile_image' => $this->getAvatar($customer),
    //             'bio' => $customer->bio,
    //             'location' => $customer->country ?? 'Location not set',
    //             'distance' => $distance,
    //             'joined_date' => $customer->created_at->format('Y-m-d'),
    //             'total_spending' => $total_spending,
    //             'appointment_count' => $appointment_counts,
    //             'canceled_appointments' => $canceled_appointments,
    //             'rescheduled_appointments' => $rescheduled_appointments,
    //             'completed_appointments' => $completed_appointments,
    //             'preferred_services' => $preferred_services,
    //         ],
    //         'location_service' => $targetLocationService,
    //         'appointments' => $appointments,
    //     ]);


    // }

    // public function getFavorites(Request $request)
    // {
    //     $customer = $request->user();
    //     $stylists = User::where('role', 'stylist')
    //         ->whereHas('stylist_profile', function ($query) use ($customer) {
    //             $query->whereHas('likes', function ($likeQuery) use ($customer) {
    //                 $likeQuery->where('user_id', $customer->id);
    //             });
    //         })->with('stylist_profile')->get();
    //     $stylistFormatted = $stylists->map(function ($stylist) use ($customer) {
    //         $stylist_likes = $stylist->stylist_profile->likes()->where('status', true)->count();
    //         $portfolio_likes = $stylist->portfolioLikes()->where('status', true)->count();
    //         $total_likes = $stylist_likes + $portfolio_likes;
    //         $stylist_rating = Review::whereHas('appointment', function ($query) use ($stylist) {
    //             $query->where('stylist_id', $stylist->id);
    //         })->avg('rating') ?? 0;
    //         $reviews = $stylist->stylistAppointments()->whereHas('review')->count();
    //         $likedByMe = $stylist->stylist_profile->likes()->where('user_id', $customer->id)->where('status', true)->exists();
    //         $minPortfolio = $stylist->portfolios->min('price');
    //         $maxPortfolio = $stylist->portfolios->max('price');
    //         // $categories = $stylist->portfolios()->with('category')->get()->groupBy('category.name')->take(3)->keys()->toArray();
    //         $categories = $stylist->portfolios()->whereHas('category')->with('category')->get()
    //             ->map(function ($portfolio) {
    //                 return [
    //                     'category' => $portfolio->category->name ?? 'Uncategorized',
    //                     'price' => $portfolio->price,
    //                 ];
    //             })
    //             ->take(3)
    //             ->toArray();

    //         // Get dynamic availability data
    //         $availabilityData = calculateStylistAvailability($stylist);

    //         return [
    //             'id' => $stylist->id,
    //             'stylist_profile_id' => $stylist->stylist_profile->id ?? null,
    //             'availability_status' => $stylist->stylist_profile->is_available ?? false,
    //             'availability' => $availabilityData['availability'],
    //             'description' => $stylist->bio,
    //             'category' => $categories[0]['category'] ?? null,
    //             'distance' => 'N/A',
    //             'response_time' => $availabilityData['response_time'],
    //             'next_available' => $availabilityData['next_available'],
    //             'average_rating' => round($stylist_rating, 1),
    //             'total_reviews' => $reviews,
    //             'is_liked' => $likedByMe,
    //             'name' => $stylist->name,
    //             'title' => $stylist->stylist_profile->business_name ?? 'N/A',
    //             'certificates' => $stylist->stylist_certifications->pluck('title')->all(),
    //             'profile_image' => $this->getAvatar($stylist),
    //             'banner_image' => $stylist->stylist_profile->banner ? asset('storage/' . $stylist->stylist_profile->banner) : null,
    //             'sample_images' => $stylist->portfolios()->whereNotNull('media_urls')->pluck('media_urls')->take(3),
    //             'price_range' => ($minPortfolio !== null && $maxPortfolio !== null) ? "R{$minPortfolio}-R{$maxPortfolio}" : null,
    //             'price' => $minPortfolio,
    //             'location' => $stylist->country,
    //             'categories' => $categories,
    //             'years_of_experience' => $stylist->stylist_profile->years_of_experience ?? 0,
    //             'likes_count' => $total_likes,
    //             'section' => $stylist->is_featured ? 'top_rated' : 'online',
    //         ];
    //     });

    //     $stylists_complete = $stylistFormatted
    //         ->map(function ($item) {
    //             return [
    //                 'id' => $item['id'] ?? null,
    //                 'profile_id' => $item['stylist_profile_id'] ?? null,
    //                 'availability' => $item['availability'] ?? null,
    //                 'availability_status' => $item['availability_status'] ?? null,
    //                 'distance' => $item['distance'] ?? null,
    //                 'response_time' => $item['response_time'] ?? null,
    //                 'next_available' => $item['next_available'] ?? null,
    //                 'average_rating' => $item['average_rating'] ?? null,
    //                 'total_reviews' => $item['total_reviews'] ?? null,
    //                 'is_liked' => $item['is_liked'] ?? null,
    //                 'name' => $item['name'] ?? null,
    //                 'title' => $item['title'] ?? null,
    //                 'certificates' => $item['certificates'] ?? null,
    //                 'profile_image' => $item['profile_image'] ?? null,
    //                 'banner_image' => $item['banner_image'] ?? null,
    //                 'sample_images' => $item['sample_images'] ?? null,
    //                 'price_range' => $item['price_range'] ?? null,
    //                 'location' => $item['location'] ?? null,
    //                 'categories' => $item['categories'] ?? null,
    //                 'years_of_experience' => $item['years_of_experience'] ?? null,
    //                 'likes_count' => $item['likes_count'] ?? null,
    //                 'section' => $item['section'] ?? null,
    //                 'category' => $item['category'] ?? null,
    //                 'description' => $item['description'] ?? null,
    //                 'appointment_counts' => $item['appointment_counts'] ?? null,
    //                 'price' => $item['price'] ?? null,
    //                 'stylist_name' => $item['stylist_name'] ?? null,
    //             ];
    //         });
    //     return Inertia::render('Customer/Favorites', [
    //         'favorite_stylists' => $stylists_complete,
    //     ]);
    // }

    // public function bookAppointment(Request $request, $portfolioId)
    // {
    //     $customer = $request->user();
    //     if ($portfolioId == 0)
    //         return to_route('customer.stylists');
    //     $portfolio = Portfolio::whereHas('category')->with('category')->find($portfolioId);

    //     // Check if the portfolio is available
    //     if (!$portfolio->is_available) {
    //         return redirect()->back()->with('error', 'This portfolio is not available for booking.');
    //     }

    //     // Check if the customer has a profile
    //     $customer_profile = $customer->customer_profile;
    //     if (!$customer->country) {
    //         return redirect()->route('customer.profile')->with('error', 'Please complete your profile before booking.');
    //     }
    //     if (!$customer_profile) {
    //         return redirect()->route('customer.settings')->with('error', 'Please complete your billing information.');
    //     }

    //     // Get stylist's schedule data
    //     $stylist = $portfolio->user;
    //     $stylist_schedules = $stylist->stylistSchedules()
    //         ->whereHas('slots')->with('slots')
    //         ->get()
    //         ->map(function ($schedule) {
    //             return [
    //                 'day' => ucfirst($schedule->day),
    //                 'available' => $schedule->available,
    //                 'timeSlots' => $schedule->slots->map(function ($slot) {
    //                     return [
    //                         'id' => $slot->id,
    //                         'from' => Carbon::parse($slot->from)->format('H:i'),
    //                         'to' => Carbon::parse($slot->to)->format('H:i'),
    //                     ];
    //                 }),
    //             ];
    //         });

    //     // Get existing appointments for the stylist
    //     $existing_appointments = $stylist->stylistAppointments()
    //         ->whereIn('status', ['approved', 'confirmed'])
    //         ->get()
    //         ->map(function ($appointment) {
    //             return [
    //                 'appointment_date' => $appointment->appointment_date,
    //                 'appointment_time' => $appointment->appointment_time,
    //                 'duration' => $appointment->duration,
    //                 'status' => $appointment->status,
    //             ];
    //         });

    //     // Redirect to the booking page with necessary data
    //     $locationService = $customer->location_service;
    //     $targetLocationService = $stylist->location_service;
    //     if (!$locationService || !$locationService->hasLocation() || !$targetLocationService || !$targetLocationService->hasLocation()) {
    //         $distance = null;
    //     } else {
    //         $distance = $locationService->distanceTo($targetLocationService);
    //         $distance = $distance !== null ? round($distance, 2) . 'km away' : null;
    //     }
    //     $portfolio->increment('visits_count');
    //     return Inertia::render('Customer/Book', [
    //         'portfolio' => [
    //             'id' => $portfolio->id,
    //             'title' => $portfolio->title,
    //             'category' => $portfolio->category,
    //             'duration' => $portfolio->duration,
    //             'price' => $portfolio->price,
    //             'distance' => $distance,
    //         ],
    //         'customer_profile' => $customer_profile,
    //         'stylist' => $portfolio->user,
    //         'stylist_schedules' => $stylist_schedules,
    //         'existing_appointments' => $existing_appointments,
    //     ]);
    // }

    // public function getAppointment(Request $request, $appointmentId)
    // {
    //     $customer = $request->user();
    //     $appointment = $customer->customerAppointments()->where('id', $appointmentId)->firstOrFail();
    //     $portfolio = Portfolio::whereHas('category')->with('category')->find($appointment->portfolio->id);
    //     $customer_profile = $customer->customer_profile;

    //     $stylist = $appointment->stylist;
    //     $stylist_schedules = $stylist->stylistSchedules()
    //         ->whereHas('slots')->with('slots')
    //         ->get()
    //         ->map(function ($schedule) {
    //             return [
    //                 'day' => ucfirst($schedule->day),
    //                 'available' => $schedule->available,
    //                 'timeSlots' => $schedule->slots->map(function ($slot) {
    //                     return [
    //                         'id' => $slot->id,
    //                         'from' => Carbon::parse($slot->from)->format('H:i'),
    //                         'to' => Carbon::parse($slot->to)->format('H:i'),
    //                     ];
    //                 }),
    //             ];
    //         });


    //     $existing_appointments = $stylist->stylistAppointments()
    //         ->whereIn('status', ['approved', 'confirmed'])
    //         ->get()
    //         ->map(function ($appointment) {
    //             return [
    //                 'appointment_date' => $appointment->appointment_date,
    //                 'appointment_time' => $appointment->appointment_time,
    //                 'duration' => $appointment->duration,
    //                 'status' => $appointment->status,
    //             ];
    //         });


    //     $locationService = $customer->location_service;
    //     $targetLocationService = $stylist->location_service;
    //     if (!$locationService || !$locationService->hasLocation() || !$targetLocationService || !$targetLocationService->hasLocation()) {
    //         $distance = null;
    //     } else {
    //         $distance = $locationService->distanceTo($targetLocationService);
    //         $distance = $distance !== null ? round($distance, 2) . 'km away' : null;
    //     }
    //     return Inertia::render('Customer/Appointment', [
    //         'portfolio' => [
    //             'id' => $portfolio->id,
    //             'title' => $portfolio->title,
    //             'category' => $portfolio->category,
    //             'duration' => $portfolio->duration,
    //             'price' => $portfolio->price,
    //             'distance' => $distance,
    //         ],
    //         'customer_profile' => $customer_profile,
    //         'stylist' => $portfolio->user,
    //         'stylist_schedules' => $stylist_schedules,
    //         'existing_appointments' => $existing_appointments,
    //         'appointment' => $appointment,
    //     ]);
    // }

    // public function updatePreferences(Request $request)
    // {
    //     $request->validate([
    //         'preferred_time' => ['string', 'in:,morning,afternoon,evening,special'],
    //         'preferred_stylist' => ['string', 'in:,male,female,none'],
    //         'auto_rebooking' => ['boolean'],
    //         'use_location' => ['boolean'],
    //         'enable_mobile_appointment' => ['boolean'],
    //         'email_reminders' => ['boolean'],
    //         'sms_reminders' => ['boolean'],
    //         'phone_reminders' => ['boolean'],
    //         'language' => ['required', 'string', 'in:english,spanish,french'],
    //         'currency' => ['required', 'string', 'in:$,€,£'],
    //     ]);

    //     $customer = $request->user();
    //     $customer->update([
    //         'use_location' => $request->use_location,
    //     ]);

    //     // Get or create customer settings record
    //     $customerSetting = $customer->customerSetting ?? new \App\Models\CustomerSetting(['user_id' => $customer->id]);

    //     // Update preferences
    //     $customerSetting->fill([
    //         'preferred_time' => $request->preferred_time,
    //         'preferred_stylist' => $request->preferred_stylist,
    //         'auto_rebooking' => $request->auto_rebooking,
    //         'enable_mobile_appointment' => $request->enable_mobile_appointment,
    //         'email_reminders' => $request->email_reminders,
    //         'sms_reminders' => $request->sms_reminders,
    //         'phone_reminders' => $request->phone_reminders,
    //         'language' => $request->language,
    //         'currency' => $request->currency,
    //     ]);

    //     $customerSetting->save();

    //     return redirect()->back()->with('success', 'Preferences updated successfully.');
    // }

    // public function updateNotifications(Request $request)
    // {
    //     $request->validate([
    //         'booking_confirmation' => ['boolean'],
    //         'appointment_reminders' => ['boolean'],
    //         'favorite_stylist_update' => ['boolean'],
    //         'promotions_offers' => ['boolean'],
    //         'review_reminders' => ['boolean'],
    //         'payment_confirmations' => ['boolean'],
    //         'email_notifications' => ['boolean'],
    //         'push_notifications' => ['boolean'],
    //         'sms_notifications' => ['boolean'],
    //     ]);

    //     $customer = $request->user();

    //     // Get or create customer notification settings record
    //     $notificationSetting = $customer->customerNotificationSetting ?? new CustomerNotificationSetting(['user_id' => $customer->id]);

    //     // Update notification settings
    //     $notificationSetting->fill($request->only([
    //         'booking_confirmation',
    //         'appointment_reminders',
    //         'favorite_stylist_update',
    //         'promotions_offers',
    //         'review_reminders',
    //         'payment_confirmations',
    //         'email_notifications',
    //         'push_notifications',
    //         'sms_notifications',
    //     ]));

    //     $notificationSetting->save();

    //     return back()->with('success', 'Notification settings updated successfully.');
    // }
}
