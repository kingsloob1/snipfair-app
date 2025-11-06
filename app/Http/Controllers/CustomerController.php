<?php

namespace App\Http\Controllers;

use App\Helpers\AdminNotificationHelper;
use App\Mail\AppointmentDisputeEmail;
use App\Models\Admin;
use App\Models\AdminPaymentMethod;
use App\Models\Appointment;
use App\Models\AppointmentDispute;
use App\Models\CustomerNotificationSetting;
use App\Models\Portfolio;
use App\Models\Review;
use App\Models\StylistSchedule;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class CustomerController extends Controller
{
    public function profile(Request $request)
    {
        $customer = $request->user();
        $totalSpendings = $request->user()->transactions()
            ->where('type', 'payment')
            ->where('status', 'completed')
            ->sum('amount') ?? 0;
        $appointmentsCount = $request->user()->customerAppointments()
            ->count();
        $appointmentsCompleted = $request->user()->customerAppointments()
            ->where('status', 'completed')
            ->count();
        $appointmentsActive = $request->user()->customerAppointments()
            ->where('status', 'approved')->orWhere('status', 'pending')
            ->count();
        $appointmentsCanceled = $request->user()->customerAppointments()
            ->where('status', 'canceled')
            ->count();
        return Inertia::render('Profile/Index', [
            'user' => $customer,
            'statistics' => [
                'total_spendings' => $totalSpendings,
                'total_appointments' => $appointmentsCount,
                'completed_appointments' => $appointmentsCompleted,
                'failed_appointments' => $appointmentsCanceled,
                'active_appointments' => $appointmentsActive,
            ]
        ]);
    }

    public function profileUpdate(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $request->user()->id],
            'country' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'bio' => ['nullable', 'string'],
        ]);

        $user = $request->user();
        $user->name = $request->name;
        // $user->email = $request->email;
        $user->country = $request->country;
        $user->phone = $request->phone;
        $user->bio = $request->bio;

        // if ($request->hasFile('profile_picture')) {
        //     $user->profile_picture = $request->file('profile_picture')->store('profile_pictures', 'public');
        // }

        $user->save();

        return redirect()->back()->with('success', 'Profile updated successfully.');
    }

    public function avatarUpdate(Request $request)
    {
        $request->validate([
            'avatar' => ['required', 'image', 'max:2048'],
        ]);

        $user = $request->user();
        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }

            $user->avatar = $request->file('avatar')->store('avatars', 'public');
            $user->save();
        }

        return redirect()->back()->with('success', 'Avatar updated successfully.');
    }

    public function settings(Request $request)
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

        $payment_methods = $customer->customerPaymentMethods()->orderBy('created_at', 'desc')->get();
        if (!$payment_methods) {
            $methods = [];
        } else {
            $methods = $payment_methods->map(function ($method) {
                return [
                    'id' => $method->id,
                    'last4' => substr($method->card_number, -4),
                    'expiry' => Carbon::parse($method->expiry)->format('m/Y'),
                    'brand' => $method->cardholder, // Still assuming this is card brand
                    'is_default' => $method->is_default,
                ];
            })->toArray();
        }
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
            ->where('type', 'payment')
            ->orderBy('created_at', 'desc')->get();

        return Inertia::render('Customer/Settings', [
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
                    'name' => $stylist->name ?? 'Stylist',
                    'date' => Carbon::parse($transaction->created_at)->format('M d, Y - h:i A'),
                    'status' => Str::title($transaction->status),
                    'created_at' => $transaction->created_at->format('Y-m-d H:i:s'),
                    'stylist_name' => $stylist->name ?? 'Stylist',
                    'imageUrl' => $this->getAvatar($stylist),
                ];
            }),
        ]);
    }

    private function getAvatar($user)
    {
        if (!$user) {
            return 'NA';
        }

        // If there's a profile picture, return URL, else initials
        if (!empty($user->avatar)) {
            return asset('storage/' . $user->avatar);
        }

        $words = explode(' ', $user->name);
        $initials = strtoupper(
            count($words) >= 2
            ? substr($words[0], 0, 1) . substr($words[1], 0, 1)
            : substr($user->name, 0, 2)
        );

        return $initials;
    }

    public function explore(Request $request)
    {
        $customer = $request->user();
        $stylists = User::where('role', 'stylist')->whereHas('stylist_profile', function ($query) {
            $query->where('is_available', true)->where('status', 'approved');
        })->get();
        $stylistFormatted = $stylists->map(function ($stylist) use ($customer) {
            $stylist_likes = $stylist->stylist_profile->likes()->where('status', true)->count();
            $portfolio_likes = $stylist->portfolioLikes()->where('status', true)->count();
            $total_likes = $stylist_likes + $portfolio_likes;
            $stylist_rating = Review::whereHas('appointment', function ($query) use ($stylist) {
                $query->where('stylist_id', $stylist->id);
            })->avg('rating') ?? 0;
            $reviews = $stylist->stylistAppointments()->whereHas('review')->count();
            $likedByMe = $stylist->stylist_profile->likes()->where('user_id', $customer->id)->where('status', true)->exists();
            // $likedByMe = $stylist->portfolioLikes()->where('user_id', $customer->id)->where('status', true)->exists();
            $minPortfolio = round($stylist->portfolios->min('price'));
            $maxPortfolio = round($stylist->portfolios->max('price'));
            // $categories = $stylist->portfolios()->with('category')->get()->groupBy('category.name')->take(3)->keys()->toArray();
            $categories = $stylist->portfolios()->whereHas('category')->with('category')->get()
                ->map(function ($portfolio) {
                    return [
                        'category' => $portfolio->category?->name ?? 'Uncategorized',
                        'price' => $portfolio->price,
                    ];
                })
                ->take(3)
                ->toArray();

            $locationService = $customer->location_service;
            $targetLocationService = $stylist->location_service;
            if (!$locationService || !$locationService->hasLocation() || !$targetLocationService || !$targetLocationService->hasLocation()) {
                $distance = 'N/A';
            } else {
                $distance = $locationService->distanceTo($targetLocationService);
                $distance = $distance !== null ? round($distance, 2) . ' km' : 'N/A';
            }

            // Get dynamic availability data
            $availabilityData = calculateStylistAvailability($stylist);
            $stylist->stylist_profile->increment('visits_count');

            return [
                'id' => $stylist->id,
                'stylist_profile_id' => $stylist->stylist_profile->id ?? null,
                'availability_status' => $stylist->stylist_profile->is_available ?? false,
                'availability' => $availabilityData['availability'],
                'description' => $stylist->bio,
                'category' => $categories[0]['category'] ?? null,
                'distance' => $distance,
                'response_time' => $availabilityData['response_time'],
                'next_available' => $availabilityData['next_available'],
                'average_rating' => number_format($stylist_rating, 1),
                'total_reviews' => $reviews,
                'is_liked' => $likedByMe,
                'name' => $stylist->name,
                'appointment_counts' => $stylist->stylistAppointments()->count(),
                'title' => $stylist->stylist_profile->business_name ?? 'N/A',
                'certificates' => $stylist->stylist_certifications->pluck('title')->all(),
                'profile_image' => $this->getAvatar($stylist),
                'banner_image' => $stylist->stylist_profile->banner ? asset('storage/' . $stylist->stylist_profile->banner) : null,
                'sample_images' => $stylist->portfolios()->whereNotNull('media_urls')->pluck('media_urls')->flatten(1)->take(3),
                'price_range' => ($minPortfolio !== null && $maxPortfolio !== null) ? 'R' . "{$minPortfolio}-R{$maxPortfolio}" : null,
                'price' => $minPortfolio,
                'location' => $stylist->country,
                'categories' => $categories,
                'years_of_experience' => $stylist->stylist_profile->years_of_experience ?? 0,
                'likes_count' => $total_likes,
                'section' => $stylist->is_featured ? 'top_rated' : 'online',
            ];
        });

        $likedPortfolioIds = $customer->likes()->where('type', 'portfolio')->pluck('type_id')->toArray();
        $portfolios = Portfolio::whereHas('user')->with('user')
            ->whereHas('user.stylist_profile', function ($query) {
                $query->where('is_available', true);
            })->get()
            ->map(function ($portfolio) use ($likedPortfolioIds) {
                $portfolio_likes = $portfolio->likes()->where('status', true)->count();
                $portfolio_average_rating = Review::whereHas('appointment', function ($query) use ($portfolio) {
                    $query->where('portfolio_id', $portfolio->id);
                })->avg('rating') ?? 0;
                $portfolio_total_reviews = $portfolio->appointments()->whereHas('review')->count();
                $portfolio->is_liked = in_array($portfolio->id, $likedPortfolioIds);
                $portfolio->increment('visits_count');
                $portfolioBannerImage = Arr::get($portfolio->media_urls ?? [], '0', '');

                $portfolioBannerImage = $portfolioBannerImage ? asset('storage/' . formatStoredFilePath($portfolioBannerImage)) : null;

                return [
                    'id' => $portfolio->id,
                    'banner_image' => $portfolioBannerImage,
                    'category' => $portfolio->category?->name ?? 'Uncategorized',
                    'name' => $portfolio->title,
                    'description' => $portfolio->description,
                    'appointment_counts' => $portfolio->appointments()->count(),
                    'is_liked' => $portfolio->is_liked,
                    'likes_count' => $portfolio_likes,
                    'average_rating' => number_format($portfolio_average_rating, 1),
                    'total_reviews' => $portfolio_total_reviews,
                    'price' => $portfolio->price,
                    'stylist_name' => $portfolio->user->name,
                    'section' => 'featured',
                ];
            });

        $merged = $stylistFormatted
            ->merge($portfolios)
            ->map(function ($item) {
                return [
                    'id' => $item['id'] ?? null,
                    'profile_id' => $item['stylist_profile_id'] ?? null,
                    'availability' => $item['availability'] ?? null,
                    'availability_status' => $item['availability_status'] ?? null,
                    'distance' => $item['distance'] ?? null,
                    'response_time' => $item['response_time'] ?? null,
                    'next_available' => $item['next_available'] ?? null,
                    'average_rating' => $item['average_rating'] ?? null,
                    'total_reviews' => $item['total_reviews'] ?? null,
                    'is_liked' => $item['is_liked'] ?? null,
                    'name' => $item['name'] ?? null,
                    'title' => $item['title'] ?? null,
                    'certificates' => $item['certificates'] ?? null,
                    'profile_image' => $item['profile_image'] ?? null,
                    'banner_image' => $item['banner_image'] ?? null,
                    'sample_images' => $item['sample_images'] ?? null,
                    'price_range' => $item['price_range'] ?? null,
                    'location' => $item['location'] ?? null,
                    'categories' => $item['categories'] ?? null,
                    'years_of_experience' => $item['years_of_experience'] ?? null,
                    'likes_count' => $item['likes_count'] ?? null,
                    'section' => $item['section'] ?? null,
                    'category' => $item['category'] ?? null,
                    'description' => $item['description'] ?? null,
                    'appointment_counts' => $item['appointment_counts'] ?? null,
                    'price' => $item['price'] ?? null,
                    'stylist_name' => $item['stylist_name'] ?? null,
                ];
            });
        return Inertia::render('Customer/Dashboard', [
            'all_collections' => $merged,
        ]);
    }

    public function getStylists(Request $request)
    {
        $customer = $request->user();
        if ($customer->role !== 'customer')
            return redirect()->route('link.show', $customer->id);

        $stylists = User::where('role', 'stylist')->whereHas('stylist_profile', function ($query) {
            $query->where('is_available', true)->where('status', 'approved');
        })->get();
        $stylistFormatted = $stylists->map(function ($stylist) use ($customer) {
            $stylist_likes = $stylist->stylist_profile->likes()->where('status', true)->count();
            $portfolio_likes = $stylist->portfolioLikes()->where('status', true)->count();
            $total_likes = $stylist_likes + $portfolio_likes;
            $stylist_rating = Review::whereHas('appointment', function ($query) use ($stylist) {
                $query->where('stylist_id', $stylist->id);
            })->avg('rating') ?? 0;
            $reviews = $stylist->stylistAppointments()->whereHas('review')->count();
            $likedByMe = $stylist->stylist_profile->likes()->where('user_id', $customer->id)->where('status', true)->exists();
            $minPortfolio = $stylist->portfolios->min('price');
            $maxPortfolio = $stylist->portfolios->max('price');
            // $categories = $stylist->portfolios()->with('category')->get()->groupBy('category.name')->take(3)->keys()->toArray();
            $all_categories = $stylist->portfolios()->whereHas('category')->with('category')->get();
            $categories = $all_categories
                ->map(function ($portfolio) {
                    return [
                        'category' => $portfolio->category?->name ?? 'Uncategorized',
                        'price' => $portfolio->price,
                    ];
                })
                ->take(3)
                ->toArray();
            $categories_names = $all_categories->pluck('category.name')->unique()->filter()->implode(', ');

            $locationService = $customer->location_service;
            $targetLocationService = $stylist->location_service;
            if (!$locationService || !$locationService->hasLocation() || !$targetLocationService || !$targetLocationService->hasLocation()) {
                $distance = 'N/A';
            } else {
                $distance = $locationService->distanceTo($targetLocationService);
                $distance = $distance !== null ? round($distance, 2) . ' km' : 'N/A';
            }

            // Get dynamic availability data
            $availabilityData = calculateStylistAvailability($stylist);
            $stylist->stylist_profile->increment('visits_count');

            return [
                'id' => $stylist->id,
                'stylist_profile_id' => $stylist->stylist_profile->id ?? null,
                'availability_status' => $stylist->stylist_profile->is_available ?? false,
                'availability' => $availabilityData['availability'],
                'description' => $stylist->bio . ' | ' . $categories_names,
                'category' => $categories[0]['category'] ?? null,
                'distance' => $distance,
                'appointment_counts' => $stylist->stylistAppointments()->count(),
                'response_time' => $availabilityData['response_time'],
                'next_available' => $availabilityData['next_available'],
                'average_rating' => number_format($stylist_rating, 1),
                'total_reviews' => $reviews,
                'is_liked' => $likedByMe,
                'name' => $stylist->name,
                'title' => $stylist->stylist_profile->business_name ?? 'N/A',
                'certificates' => $stylist->stylist_certifications->pluck('title')->all(),
                'profile_image' => $this->getAvatar($stylist),
                'banner_image' => $stylist->stylist_profile->banner ? asset('storage/' . $stylist->stylist_profile->banner) : null,
                'sample_images' => $stylist->portfolios()->whereNotNull('media_urls')->pluck('media_urls')->flatten(1)->take(3),
                'price_range' => ($minPortfolio !== null && $maxPortfolio !== null) ? "R{$minPortfolio}-R{$maxPortfolio}" : null,
                'price' => $minPortfolio,
                'location' => $stylist->country,
                'categories' => $categories,
                'years_of_experience' => $stylist->stylist_profile->years_of_experience ?? 0,
                'likes_count' => $total_likes,
                'section' => $stylist->is_featured ? 'top_rated' : 'online',
            ];
        });

        $stylists_complete = $stylistFormatted
            ->map(function ($item) {
                return [
                    'id' => $item['id'] ?? null,
                    'profile_id' => $item['stylist_profile_id'] ?? null,
                    'availability' => $item['availability'] ?? null,
                    'availability_status' => $item['availability_status'] ?? null,
                    'distance' => $item['distance'] ?? null,
                    'response_time' => $item['response_time'] ?? null,
                    'next_available' => $item['next_available'] ?? null,
                    'average_rating' => $item['average_rating'] ?? null,
                    'total_reviews' => $item['total_reviews'] ?? null,
                    'is_liked' => $item['is_liked'] ?? null,
                    'name' => $item['name'] ?? null,
                    'title' => $item['title'] ?? null,
                    'certificates' => $item['certificates'] ?? null,
                    'profile_image' => $item['profile_image'] ?? null,
                    'banner_image' => $item['banner_image'] ?? null,
                    'sample_images' => $item['sample_images'] ?? null,
                    'price_range' => $item['price_range'] ?? null,
                    'location' => $item['location'] ?? null,
                    'categories' => $item['categories'] ?? null,
                    'years_of_experience' => $item['years_of_experience'] ?? null,
                    'likes_count' => $item['likes_count'] ?? null,
                    'section' => $item['section'] ?? null,
                    'category' => $item['category'] ?? null,
                    'description' => $item['description'] ?? null,
                    'appointment_counts' => $item['appointment_counts'] ?? null,
                    'price' => $item['price'] ?? null,
                    'stylist_name' => $item['stylist_name'] ?? null,
                ];
            });

        return Inertia::render('Customer/Stylists', [
            'stylists' => $stylists_complete,
        ]);
    }

    public function getStylist(Request $request, $id)
    {
        $stylist = User::where('role', 'stylist')->where('id', $id)->whereHas('stylist_profile', function ($query) {
            $query->where('is_available', true)->where('status', 'approved');
        })->firstOrFail();
        $customer = $request->user();
        $stylist_likes = $stylist->stylist_profile->likes()->where('status', true)->count();
        $portfolio_likes = $stylist->portfolioLikes()->where('status', true)->count();
        $total_likes = $stylist_likes + $portfolio_likes;
        $stylist_rating = Review::whereHas('appointment', function ($query) use ($stylist) {
            $query->where('stylist_id', $stylist->id);
        })->avg('rating') ?? 0;
        $reviews_count = $stylist->stylistAppointments()->whereHas('review')->count();
        $likedByMe = $stylist->stylist_profile->likes()->where('user_id', $customer->id)->where('status', true)->exists();
        $minPortfolio = $stylist->portfolios->min('price');
        $maxPortfolio = $stylist->portfolios->max('price');
        $categories = $stylist->portfolios()->whereHas('category')->with('category')->get()
            ->map(function ($portfolio) {
                return [
                    'category' => $portfolio->category?->name ?? 'Uncategorized',
                    'price' => $portfolio->price,
                ];
            })
            ->take(3)
            ->toArray();

        // Get portfolio items with media
        $portfolios = $stylist->portfolios()->whereHas('category')->with('category')
            ->whereNotNull('media_urls')
            ->where('is_available', true)
            ->get()
            ->map(function ($portfolio) {
                return [
                    'id' => $portfolio->id,
                    'title' => $portfolio->title,
                    'category' => $portfolio->category?->name ?? 'Uncategorized',
                    'price' => $portfolio->price,
                    'duration' => $portfolio->duration,
                    'description' => $portfolio->description,
                    'media_urls' => $portfolio->media_urls,
                ];
            });

        // Get actual reviews with customer information
        $actual_reviews = Review::whereHas('appointment', function ($query) use ($stylist) {
            $query->where('stylist_id', $stylist->id);
        })
            ->with(['appointment.customer'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($review) {
                return [
                    'name' => $review->appointment->customer->name ?? 'Anonymous',
                    'title' => 'Customer',
                    'message' => $review->comment ?? 'Great service!',
                    'rating' => $review->rating ?? 5,
                    'ratingDate' => $review->created_at->diffForHumans(),
                ];
            });

        // Get stylist schedule
        $workingHours = $stylist->stylistSchedules()->with('slots')->get()
            ->map(function ($schedule) {
                $slots = $schedule->slots;
                if (!$schedule->available || $slots->isEmpty()) {
                    return [
                        'day' => $schedule->day,
                        'isClosed' => true,
                    ];
                }

                $openTime = $slots->min('from');
                $closeTime = $slots->max('to');

                return [
                    'day' => $schedule->day,
                    'openTime' => Carbon::parse($openTime)->format('g:i A'),
                    'closeTime' => Carbon::parse($closeTime)->format('g:i A'),
                    'isClosed' => false,
                ];
            })
            ->toArray();

        // If no schedule found, provide default hours
        if (empty($workingHours)) {
            $workingHours = [
                ['day' => 'monday', 'isClosed' => true],
                ['day' => 'tuesday', 'isClosed' => true],
                ['day' => 'wednesday', 'isClosed' => true],
                ['day' => 'thursday', 'isClosed' => true],
                ['day' => 'friday', 'isClosed' => true],
                ['day' => 'saturday', 'isClosed' => true],
                ['day' => 'sunday', 'isClosed' => true],
            ];
        }

        // Get appointment count for services completed
        $appointment_counts = $stylist->stylistAppointments()->where('status', 'completed')->count();

        // Get dynamic availability data
        $locationService = $customer->location_service;
        $targetLocationService = $stylist->location_service;
        if (!$locationService || !$locationService->hasLocation() || !$targetLocationService || !$targetLocationService->hasLocation()) {
            $distance = 'N/A';
        } else {
            $distance = $locationService->distanceTo($targetLocationService);
            $distance = $distance !== null ? round($distance, 2) . ' km' : 'N/A';
        }
        $availabilityData = calculateStylistAvailability($stylist);
        $stylist->stylist_profile->increment('visits_count');

        return Inertia::render('Customer/Stylist', [
            'stylist' => [
                'id' => $stylist->id,
                'profile_id' => $stylist->stylist_profile->id ?? null,
                'availability_status' => $stylist->stylist_profile->is_available ?? false,
                'availability' => $availabilityData['availability'],
                'description' => $stylist->bio,
                'category' => $categories[0]['category'] ?? null,
                'distance' => $distance,
                'response_time' => $availabilityData['response_time'],
                'next_available' => $availabilityData['next_available'],
                'average_rating' => round($stylist_rating, 1),
                'total_reviews' => $reviews_count,
                'is_liked' => $likedByMe,
                'name' => $stylist->name,
                'title' => $stylist->stylist_profile->business_name ?? 'Stylist',
                'certificates' => $stylist->stylist_certifications->pluck('title')->all(),
                'profile_image' => $this->getAvatar($stylist),
                'banner_image' => $stylist->stylist_profile->banner ? asset('storage/' . $stylist->stylist_profile->banner) : null,
                'sample_images' => $stylist->portfolios()->whereNotNull('media_urls')->pluck('media_urls')->flatten(1)->take(20)->toArray(),
                'price_range' => ($minPortfolio !== null && $maxPortfolio !== null) ? "R" . number_format($minPortfolio) . "-R" . number_format($maxPortfolio) : null,
                'price' => $minPortfolio,
                'location' => $stylist->country ?? 'Location not set',
                'categories' => $categories,
                'years_of_experience' => $stylist->stylist_profile->years_of_experience ?? 0,
                'likes_count' => $total_likes,
                'section' => $stylist->is_featured ? 'top_rated' : 'online',
                'appointment_counts' => $appointment_counts,
                'services_completed' => $appointment_counts . '+',
                'work_experience' => ($stylist->stylist_profile->years_of_experience ?? 0) . '+ years',
            ],
            'portfolios' => $portfolios,
            'reviews' => $actual_reviews,
            'workingHours' => $workingHours,
            'location_service' => $targetLocationService,
        ]);
    }

    public function getCustomer(Request $request, $id)
    {
        $customer = User::where('role', 'customer')->where('id', $id)->firstOrFail();
        $stylist = $request->user();

        $appointment_counts = $customer->customerAppointments()->count();
        $completed_appointments = $customer->customerAppointments()->where('status', 'completed')->count();
        $total_spending = $customer->customerAppointments()->where('status', '!=', 'processing')->sum('amount');
        $canceled_appointments = $customer->customerAppointments()->where('status', 'canceled')->count();
        $rescheduled_appointments = $customer->customerAppointments()->where('status', 'rescheduled')->count();

        //use the customer's appointment.portfolio.category.name to get the 5 most recent servicers
        $preferred_services = $customer->customerAppointments()
            ->whereHas('portfolio.category')
            ->with('portfolio.category')
            ->latest()
            ->take(5)
            ->get()
            ->pluck('portfolio.category.name')
            ->unique()
            ->values();

        // Get dynamic availability data
        $locationService = $customer->location_service;
        $targetLocationService = $stylist->location_service;
        if (!$locationService || !$locationService->hasLocation() || !$targetLocationService || !$targetLocationService->hasLocation()) {
            $distance = 'N/A';
        } else {
            $distance = $locationService->distanceTo($targetLocationService);
            $distance = $distance !== null ? round($distance, 2) . ' km' : 'N/A';
        }
        $appointments = Appointment::where('stylist_id', $stylist->id)->where('customer_id', $customer->id)->with(['stylist', 'portfolio.category'])->latest()->get();

        return Inertia::render('Stylist/Customer', [
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
                'profile_image' => $this->getAvatar($customer),
                'bio' => $customer->bio,
                'location' => $customer->country ?? 'Location not set',
                'distance' => $distance,
                'joined_date' => $customer->created_at->format('Y-m-d'),
                'total_spending' => $total_spending,
                'appointment_count' => $appointment_counts,
                'canceled_appointments' => $canceled_appointments,
                'rescheduled_appointments' => $rescheduled_appointments,
                'completed_appointments' => $completed_appointments,
                'preferred_services' => $preferred_services,
            ],
            'location_service' => $targetLocationService,
            'appointments' => $appointments,
        ]);


    }

    public function getFavorites(Request $request)
    {
        $customer = $request->user();
        $stylists = User::where('role', 'stylist')
            ->whereHas('stylist_profile', function ($query) use ($customer) {
                $query->whereHas('likes', function ($likeQuery) use ($customer) {
                    $likeQuery->where('user_id', $customer->id);
                });
            })->with('stylist_profile')->get();
        $stylistFormatted = $stylists->map(function ($stylist) use ($customer) {
            $stylist_likes = $stylist->stylist_profile->likes()->where('status', true)->count();
            $portfolio_likes = $stylist->portfolioLikes()->where('status', true)->count();
            $total_likes = $stylist_likes + $portfolio_likes;
            $stylist_rating = Review::whereHas('appointment', function ($query) use ($stylist) {
                $query->where('stylist_id', $stylist->id);
            })->avg('rating') ?? 0;
            $reviews = $stylist->stylistAppointments()->whereHas('review')->count();
            $likedByMe = $stylist->stylist_profile->likes()->where('user_id', $customer->id)->where('status', true)->exists();
            $minPortfolio = $stylist->portfolios->min('price');
            $maxPortfolio = $stylist->portfolios->max('price');
            // $categories = $stylist->portfolios()->with('category')->get()->groupBy('category.name')->take(3)->keys()->toArray();
            $categories = $stylist->portfolios()->whereHas('category')->with('category')->get()
                ->map(function ($portfolio) {
                    return [
                        'category' => $portfolio->category?->name ?? 'Uncategorized',
                        'price' => $portfolio->price,
                    ];
                })
                ->take(3)
                ->toArray();

            // Get dynamic availability data
            $availabilityData = calculateStylistAvailability($stylist);

            return [
                'id' => $stylist->id,
                'stylist_profile_id' => $stylist->stylist_profile->id ?? null,
                'availability_status' => $stylist->stylist_profile->is_available ?? false,
                'availability' => $availabilityData['availability'],
                'description' => $stylist->bio,
                'category' => $categories[0]['category'] ?? null,
                'distance' => 'N/A',
                'response_time' => $availabilityData['response_time'],
                'next_available' => $availabilityData['next_available'],
                'average_rating' => round($stylist_rating, 1),
                'total_reviews' => $reviews,
                'is_liked' => $likedByMe,
                'name' => $stylist->name,
                'title' => $stylist->stylist_profile->business_name ?? 'N/A',
                'certificates' => $stylist->stylist_certifications->pluck('title')->all(),
                'profile_image' => $this->getAvatar($stylist),
                'banner_image' => $stylist->stylist_profile->banner ? asset('storage/' . $stylist->stylist_profile->banner) : null,
                'sample_images' => $stylist->portfolios()->whereNotNull('media_urls')->pluck('media_urls')->flatten(1)->take(3),
                'price_range' => ($minPortfolio !== null && $maxPortfolio !== null) ? "R{$minPortfolio}-R{$maxPortfolio}" : null,
                'price' => $minPortfolio,
                'location' => $stylist->country,
                'categories' => $categories,
                'years_of_experience' => $stylist->stylist_profile->years_of_experience ?? 0,
                'likes_count' => $total_likes,
                'section' => $stylist->is_featured ? 'top_rated' : 'online',
            ];
        });

        $stylists_complete = $stylistFormatted
            ->map(function ($item) {
                return [
                    'id' => $item['id'] ?? null,
                    'profile_id' => $item['stylist_profile_id'] ?? null,
                    'availability' => $item['availability'] ?? null,
                    'availability_status' => $item['availability_status'] ?? null,
                    'distance' => $item['distance'] ?? null,
                    'response_time' => $item['response_time'] ?? null,
                    'next_available' => $item['next_available'] ?? null,
                    'average_rating' => $item['average_rating'] ?? null,
                    'total_reviews' => $item['total_reviews'] ?? null,
                    'is_liked' => $item['is_liked'] ?? null,
                    'name' => $item['name'] ?? null,
                    'title' => $item['title'] ?? null,
                    'certificates' => $item['certificates'] ?? null,
                    'profile_image' => $item['profile_image'] ?? null,
                    'banner_image' => $item['banner_image'] ?? null,
                    'sample_images' => $item['sample_images'] ?? null,
                    'price_range' => $item['price_range'] ?? null,
                    'location' => $item['location'] ?? null,
                    'categories' => $item['categories'] ?? null,
                    'years_of_experience' => $item['years_of_experience'] ?? null,
                    'likes_count' => $item['likes_count'] ?? null,
                    'section' => $item['section'] ?? null,
                    'category' => $item['category'] ?? null,
                    'description' => $item['description'] ?? null,
                    'appointment_counts' => $item['appointment_counts'] ?? null,
                    'price' => $item['price'] ?? null,
                    'stylist_name' => $item['stylist_name'] ?? null,
                ];
            });
        return Inertia::render('Customer/Favorites', [
            'favorite_stylists' => $stylists_complete,
        ]);
    }

    public function bookAppointment(Request $request, $portfolioId)
    {
        $customer = $request->user();
        if ($portfolioId == 0)
            return to_route('customer.stylists');
        $portfolio = Portfolio::whereHas('category')->with('category')->find($portfolioId);

        // Check if the portfolio is available
        if (!$portfolio->is_available) {
            return redirect()->back()->with('error', 'This portfolio is not available for booking.');
        }

        // Check if the customer has a profile
        $customer_profile = $customer->customer_profile;
        if (!$customer->country) {
            return redirect()->route('customer.profile')->with('error', 'Please complete your profile before booking.');
        }
        if (!$customer_profile) {
            return redirect()->route('customer.settings')->with('error', 'Please complete your billing information.');
        }

        // Get stylist's schedule data
        $stylist = $portfolio->user;
        $stylist_schedules = $stylist->stylistSchedules()
            ->whereHas('slots')->with('slots')
            ->get()
            ->map(function ($schedule) {
                return [
                    'day' => ucfirst($schedule->day),
                    'available' => $schedule->available,
                    'timeSlots' => $schedule->slots->map(function ($slot) {
                        return [
                            'id' => $slot->id,
                            'from' => Carbon::parse($slot->from)->format('H:i'),
                            'to' => Carbon::parse($slot->to)->format('H:i'),
                        ];
                    }),
                ];
            });

        // Get existing appointments for the stylist
        $existing_appointments = $stylist->stylistAppointments()
            ->whereIn('status', ['approved', 'confirmed'])
            ->get()
            ->map(function ($appointment) {
                return [
                    'appointment_date' => $appointment->appointment_date,
                    'appointment_time' => $appointment->appointment_time,
                    'duration' => $appointment->duration,
                    'status' => $appointment->status,
                ];
            });

        // Redirect to the booking page with necessary data
        $locationService = $customer->location_service;
        $targetLocationService = $stylist->location_service;
        if (!$locationService || !$locationService->hasLocation() || !$targetLocationService || !$targetLocationService->hasLocation()) {
            $distance = null;
        } else {
            $distance = $locationService->distanceTo($targetLocationService);
            $distance = $distance !== null ? round($distance, 2) . 'km away' : null;
        }
        $portfolio->increment('visits_count');
        return Inertia::render('Customer/Book', [
            'portfolio' => [
                'id' => $portfolio->id,
                'title' => $portfolio->title,
                'category' => $portfolio->category,
                'duration' => $portfolio->duration,
                'price' => $portfolio->price,
                'distance' => $distance,
            ],
            'customer_profile' => $customer_profile,
            'stylist' => $portfolio->user,
            'stylist_schedules' => $stylist_schedules,
            'existing_appointments' => $existing_appointments,
        ]);
    }

    public function getAppointment(Request $request, $appointmentId)
    {
        $customer = $request->user();
        $appointment = $customer->customerAppointments()->where('id', $appointmentId)->firstOrFail();
        $portfolio = Portfolio::whereHas('category')->with('category')->find($appointment->portfolio->id);
        $customer_profile = $customer->customer_profile;

        $stylist = $appointment->stylist;
        $stylist_schedules = $stylist->stylistSchedules()
            ->whereHas('slots')->with('slots')
            ->get()
            ->map(function ($schedule) {
                return [
                    'day' => ucfirst($schedule->day),
                    'available' => $schedule->available,
                    'timeSlots' => $schedule->slots->map(function ($slot) {
                        return [
                            'id' => $slot->id,
                            'from' => Carbon::parse($slot->from)->format('H:i'),
                            'to' => Carbon::parse($slot->to)->format('H:i'),
                        ];
                    }),
                ];
            });


        $existing_appointments = $stylist->stylistAppointments()
            ->whereIn('status', ['approved', 'confirmed'])
            ->get()
            ->map(function ($appointment) {
                return [
                    'appointment_date' => $appointment->appointment_date,
                    'appointment_time' => $appointment->appointment_time,
                    'duration' => $appointment->duration,
                    'status' => $appointment->status,
                ];
            });


        $locationService = $customer->location_service;
        $targetLocationService = $stylist->location_service;
        if (!$locationService || !$locationService->hasLocation() || !$targetLocationService || !$targetLocationService->hasLocation()) {
            $distance = null;
        } else {
            $distance = $locationService->distanceTo($targetLocationService);
            $distance = $distance !== null ? round($distance, 2) . 'km away' : null;
        }
        return Inertia::render('Customer/Appointment', [
            'portfolio' => [
                'id' => $portfolio->id,
                'title' => $portfolio->title,
                'category' => $portfolio->category,
                'duration' => $portfolio->duration,
                'price' => $portfolio->price,
                'distance' => $distance,
            ],
            'customer_profile' => $customer_profile,
            'stylist' => $portfolio->user,
            'stylist_schedules' => $stylist_schedules,
            'existing_appointments' => $existing_appointments,
            'appointment' => $appointment,
        ]);
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

        return redirect()->back()->with('success', 'Billing information updated successfully.');
    }

    public function storePaymentMethod(Request $request)
    {
        $request->validate([
            'cardNumber' => 'required|string|min:13|max:19',
            'expiry' => ['required', 'string', 'regex:/^(0[1-9]|1[0-2])\/([0-9]{2})$/'],
            'cvv' => 'required|string|min:3|max:4',
            'name' => 'required|string|max:255',
            'setAsDefault' => 'boolean',
        ]);

        [$month, $year] = explode('/', $request->expiry);
        $expiryDate = \Carbon\Carbon::createFromDate('20' . $year, $month, 1)->endOfMonth();

        if ($expiryDate->lt(now())) {
            return back()->withErrors(['expiry' => 'This card is expired.'])->withInput();
        }

        $customer = $request->user();

        // If this is set as default, remove default from other cards
        if ($request->setAsDefault) {
            $customer->customerPaymentMethods()->update(['is_default' => false]);
        }

        // Create new payment method
        $customer->customerPaymentMethods()->create([
            'card_number' => $request->cardNumber,
            'expiry' => $request->expiry,
            'cardholder' => $request->name,
            'is_default' => $request->setAsDefault ?? false,
            'is_active' => true,
        ]);

        return redirect()->back()->with('success', 'Payment method added successfully.');
    }

    public function deletePaymentMethod(Request $request, $id)
    {
        $customer = $request->user();
        $paymentMethod = $customer->customerPaymentMethods()->findOrFail($id);

        // Check if this is the default payment method
        $wasDefault = $paymentMethod->is_default;

        $paymentMethod->delete();

        // If the deleted card was default, make the first remaining card default
        if ($wasDefault) {
            $firstRemaining = $customer->customerPaymentMethods()->first();
            if ($firstRemaining) {
                $firstRemaining->update(['is_default' => true]);
            }
        }

        return redirect()->back()->with('success', 'Payment method deleted successfully.');
    }

    public function setDefaultPaymentMethod(Request $request, $id)
    {
        $customer = $request->user();

        // Remove default from all cards
        $customer->customerPaymentMethods()->update(['is_default' => false]);

        // Set this card as default
        $paymentMethod = $customer->customerPaymentMethods()->findOrFail($id);
        $paymentMethod->update(['is_default' => true]);

        return redirect()->back()->with('success', 'Default payment method updated successfully.');
    }

    public function updatePreferences(Request $request)
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
        $customerSetting = $customer->customerSetting ?? new \App\Models\CustomerSetting(['user_id' => $customer->id]);

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

        return redirect()->back()->with('success', 'Preferences updated successfully.');
    }

    public function updateNotifications(Request $request)
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

        return back()->with('success', 'Notification settings updated successfully.');
    }

    public function myAppointments(Request $request)
    {
        $customer = $request->user();
        $appointments = $customer->customerAppointments()
            ->whereHas('stylist')->with(['stylist', 'portfolio.category'])
            ->orderBy('appointment_date', 'desc')
            ->get()
            ->map(function ($appointment) use ($customer) {
                return [
                    'id' => $appointment->id,
                    'stylistName' => $appointment->stylist->name,
                    'stylistTitle' => $appointment->stylist->stylist_profile->business_name ?? 'Stylist',
                    'appointmentType' => $appointment->portfolio->category?->name ?? 'Uncategorized',
                    'location' => $customer->country,
                    'time' => Carbon::createFromFormat('H:i:s', $appointment->appointment_time)
                        ->format('g:i A'),
                    'date' => Carbon::createFromFormat('Y-m-d', $appointment->appointment_date)
                        ->format('M d, Y'),
                    'price' => $appointment->amount,
                    'status' => Str::title($appointment->status),
                    'avatarUrl' => $this->getAvatar($appointment->stylist),
                ];
            });

        return Inertia::render('Customer/Appointments', [
            'appointments' => $appointments,
        ]);
    }

    public function submitReview(Request $request, $appointmentId)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string|max:1000',
            'name' => 'required|string|exists:users,name',
        ]);

        $appointment = Appointment::findOrFail($appointmentId);
        $customer = $request->user();
        if ($appointment->customer_id == $customer->id) {
            Review::create([
                'user_id' => $customer->id,
                'appointment_id' => $appointment->id,
                'rating' => $request->rating,
                'comment' => $request->review,
            ]);
        }

        return back()->with('success', 'Review submitted successfully.');
    }

    public function disputeAppointment(Request $request, $appointmentId)
    {
        $validated = $request->validate([
            'stylist' => 'required|string|max:255',
            'comment' => 'required|string',
            'images' => 'required|array|max:10',
            'images.*' => 'file|mimes:jpg,jpeg,png|max:5120',
        ]);

        $appointment = Appointment::findOrFail($appointmentId);

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
                "Email: {$appointment->customer->email}\nMessage: " . substr($validated['comment'], 0, 100) . '...',
                'normal'
            );
        }

        if ($dispute)
            return redirect()->route('customer.explore')->with('message', 'Appointment disputed successfully! You will receive a response shortly from the Administrators.');
        else
            return back()->with('message', 'Something went wrong');
    }
}
