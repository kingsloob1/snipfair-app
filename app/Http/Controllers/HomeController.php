<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\FAQ;
use App\Models\Portfolio;
use App\Models\Review;
use App\Models\StylesMedia;
use App\Models\User;
use App\Models\WebsiteConfiguration;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function testView()
    {
        // return Inertia::render('Support/TicketDetail', [
        //     'auth' => [
        //         'user' => User::find(40),
        //     ],
        //     'ticket' => [
        //         "id" => 1,
        //         "ticket_id" => 1,
        //         "subject" => "A very nice ticket",
        //         "description" => "I have an issue with this guy",
        //         "status" => 'pending', //'open' | 'in_progress' | 'closed' | 'pending';
        //         "priority" => 'low', //'low' | 'medium' | 'high' | 'risky';
        //         "created_at" => now(),
        //         "updated_at" => now(),
        //         "resolved_at" => now(),
        //         'messages' => [
        //             [
        //                 "id" => 1,
        //                 'ticket_id' => '1',
        //                 "message" => 'Hi there',
        //                 "created_at" => now(),
        //                 "sender_type" => 'App\Models\User',
        //                 "sender" => [
        //                     "id" => 1,
        //                     "first_name" => "Okafor",
        //                     "last_name" => "Obinna",
        //                     "email" => "kingsleoob1@gmail.com",
        //                     "name" => "Okafor Obinna Kingsley"
        //                 ],
        //                 "attachments" => [
        //                     [
        //                         'name' => 'kings.pdf',
        //                         'path' => 'avatars/0qv7Eht7GbTT9Y4k7P53rzf7ZEUMsqzLO2R13Uto.jpg'
        //                     ],
        //                     [
        //                         'name' => 'men.pdf',
        //                         'path' => 'works/media/0lW9RgbvtlF568ymJJDeacx3sTHZVNVLfnI4GKRA.jpg'
        //                     ]
        //                 ],
        //                 "is_internal" => false,
        //             ],
        //             [
        //                 "id" => 1,
        //                 'ticket_id' => '1',
        //                 "message" => 'Hi there',
        //                 "created_at" => now(),
        //                 "sender_type" => 'App\Models\User',
        //                 "sender" => [
        //                     "id" => 1,
        //                     "first_name" => "Okafor",
        //                     "last_name" => "Obinna",
        //                     "email" => "kingsleoob1@gmail.com",
        //                     "name" => "Okafor Obinna Kingsley"
        //                 ],
        //                 "attachments" => [
        //                     [
        //                         'name' => 'kings.pdf',
        //                         'path' => 'avatars/0qv7Eht7GbTT9Y4k7P53rzf7ZEUMsqzLO2R13Uto.jpg'
        //                     ],
        //                     [
        //                         'name' => 'men.pdf',
        //                         'path' => 'works/media/0lW9RgbvtlF568ymJJDeacx3sTHZVNVLfnI4GKRA.jpg'
        //                     ]
        //                 ],
        //                 "is_internal" => false,
        //             ]
        //         ]
        //     ],
        // ]);
    }

    public function home()
    {
        $faqs = FAQ::all();
        $categories = Category::all()->map(function ($category) {
            $imageUrl = null;
            if ($category->banner) {
                $imageUrl = Storage::url($category->banner);
            }

            return [
                'id' => $category->id,
                'name' => $category->name,
                'description' => $category->description,
                'tags' => array_map('trim', explode(',', $category->description)),
                'banner' => $category->banner,
                'image_url' => $imageUrl,
            ];
        });

        $stylists = User::where('role', 'stylist')->where('is_featured', true)->whereHas('stylist_profile', function ($query) {
            $query->where('deleted_at', null); //is_available
        })->get();
        $stylistFormatted = $stylists->map(function ($stylist) {
            $minPortfolio = $stylist->portfolios->min('price');
            $maxPortfolio = $stylist->portfolios->max('price');
            $categories = $stylist->portfolios()->with('category')->get()
                ->map(function ($portfolio) {
                    return [
                        'category' => $portfolio->category->name ?? 'Uncategorized',
                        'price' => $portfolio->price,
                    ];
                })
                ->take(3)
                ->toArray();

            return [
                'id' => $stylist->id,
                'stylist_profile_id' => $stylist->stylist_profile->id ?? null,
                'category' => $categories[0]['category'] ?? null,
                'name' => $stylist->name,
                'title' => $stylist->stylist_profile->business_name ?? 'N/A',
                'profile_image' => getAvatar($stylist),
                'banner_image' => $stylist->stylist_profile->banner ? asset('storage/' . $stylist->stylist_profile->banner) : null,
                'price_range' => ($minPortfolio !== null && $maxPortfolio !== null) ? "R{$minPortfolio} - R{$maxPortfolio}" : null,
                'location' => $stylist->country,
                'categories' => $categories,
            ];
        });
        $portfolios = StylesMedia::where('type', 'styles')->inRandomOrder()->get()
            ->map(function ($media) {
                $portfolio_id = null;
                if ($media->model_id) {
                    $parts = explode(':', $media->model_id);
                    if (isset($parts[1])) {
                        $portfolio_id = explode('_', $parts[1])[0];
                    }
                }
                return [
                    'id' => $media->id,
                    'slug_id' => $portfolio_id ?? 0,
                    'banner_image' => $media->url,
                    'name' => ucwords($media->type),
                ];
            });
        return Inertia::render('Landing/Home', [
            'services' => $categories,
            'faqs' => $faqs,
            'stylists' => $stylistFormatted,
            'portfolios' => $portfolios,
        ]);
    }

    public function about()
    {
        $faqs = FAQ::all();
        $categories = Category::all()->map(function ($category) {
            $imageUrl = null;
            if ($category->banner) {
                $imageUrl = Storage::url($category->banner);
            }

            return [
                'id' => $category->id,
                'name' => $category->name,
                'description' => $category->description,
                'tags' => array_map('trim', explode(',', $category->description)),
                'banner' => $category->banner,
                'image_url' => $imageUrl,
            ];
        });
        $config = WebsiteConfiguration::first();
        $stats = [
            [
                'id' => 1,
                'name' => 'Professional Stylists',
                'count' => formatCount($config->professional_stylists ?? 500)['count'],
                'unit' => formatCount($config->professional_stylists ?? 500)['unit'],
            ],
            [
                'id' => 2,
                'name' => 'Happy Customers',
                'count' => formatCount($config->happy_customers ?? 1)['count'],
                'unit' => formatCount($config->happy_customers ?? 1)['unit'],
            ],
            [
                'id' => 3,
                'name' => 'Services Completed',
                'count' => formatCount($config->services_completed ?? 1)['count'],
                'unit' => formatCount($config->services_completed ?? 1)['unit'],
            ],
            [
                'id' => 4,
                'name' => 'Customer Satisfaction',
                'count' => (int) ($config->customer_satisfaction ?? 99),
                'unit' => '%',
            ],
        ];

        return Inertia::render('Landing/About', [
            'services' => $categories,
            'faqs' => $faqs,
            'user_statistics' => $stats,
        ]);
    }

    public function faqs()
    {
        $faqs = FAQ::all();
        return Inertia::render('Landing/FaqPage', [
            'faqs' => $faqs,
        ]);
    }

    public function explore()
    {
        // $portfolios = Portfolio::with(['user', 'category', 'appointments.review', 'likes' => function ($query) {
        //     $query->where('status', true);
        // }])->get()
        // ->map(function ($portfolio) {
        //     $portfolio_likes = $portfolio->likes->count();
        //     $portfolio_average_rating = $portfolio->appointments
        //         ->pluck('review')
        //         ->filter()
        //         ->avg('rating') ?? 0;

        //     $portfolio_total_reviews = $portfolio->appointments
        //         ->filter(fn($appointment) => $appointment->review !== null)
        //         ->count();

        //     return [
        //         'id' => $portfolio->id,
        //         'banner_image' => $portfolio->media_urls[0] ?? null,
        //         'category' => $portfolio->category->name ?? null,
        //         'name' => $portfolio->title,
        //         'description' => $portfolio->description,
        //         'appointment_counts' => $portfolio->appointments->count(),
        //         'likes_count' => $portfolio_likes,
        //         'average_rating' => $portfolio_average_rating,
        //         'total_reviews' => $portfolio_total_reviews,
        //         'price' => $portfolio->price,
        //         'stylist_name' => $portfolio->user->name ?? null,
        //     ];
        // });
        // $sorted = $portfolios->sortByDesc(function ($portfolio) {
        //     return ($portfolio['likes_count'] * 2) + ($portfolio['average_rating'] * 10);
        // })->pluck('banner_image')->values();

        $featured_media = getAdminConfig('featured_media') ?? [];
        // if(count($featured_media) >= 6){
        //     $bestPortfolios = $featured_media;
        //     $otherPortfolios = $sorted;
        // } else {
        //     if ($sorted->count() > 6) {
        //         $bestPortfolios = $sorted->take(6);
        //         $otherPortfolios = $sorted->slice(6)->values();
        //     } else {
        //         $bestPortfolios = collect();
        //         $otherPortfolios = $sorted;
        //     }
        // }
        // dd($bestPortfolios);
        $otherPortfolios = StylesMedia::where('type', 'media')->inRandomOrder()->pluck('url')->values();
        $portfolios = StylesMedia::where('type', 'styles')->inRandomOrder()->get()
            ->map(function ($media) {
                $portfolio_id = null;
                if ($media->model_id) {
                    $parts = explode(':', $media->model_id);
                    if (isset($parts[1])) {
                        $portfolio_id = explode('_', $parts[1])[0];
                    }
                }
                return [
                    'id' => $media->id,
                    'slug_id' => $portfolio_id ?? 0,
                    'banner_image' => $media->url,
                    'name' => ucwords($media->type),
                ];
            });
        return Inertia::render('Landing/Explore', [
            'bestPortfolios' => $featured_media,
            'otherPortfolios' => $otherPortfolios,
            'portfolios' => $portfolios,
        ]);
    }

    public function services()
    {
        $categories = Category::all()->map(function ($category) {
            $imageUrl = null;
            if ($category->banner) {
                $imageUrl = Storage::url($category->banner);
            }

            return [
                'id' => $category->id,
                'name' => $category->name,
                'description' => $category->description,
                'tags' => array_map('trim', explode(',', $category->description)),
                'banner' => $category->banner,
                'image_url' => $imageUrl,
            ];
        });

        return Inertia::render('Landing/Services', [
            'services' => $categories,
        ]);
    }

    public function terms()
    {
        $config = WebsiteConfiguration::first();

        return Inertia::render('Landing/Terms', [
            'content' => $config->terms ?? '<h2>Terms of Service</h2><p>Terms of service content will be available soon.</p>',
        ]);
    }

    public function privacyPolicy()
    {
        $config = WebsiteConfiguration::first();

        return Inertia::render('Landing/PrivacyPolicy', [
            'content' => $config->privacy_policy ?? '<h2>Privacy Policy</h2><p>Privacy policy content will be available soon.</p>',
        ]);
    }

    public function cookies()
    {
        $config = WebsiteConfiguration::first();

        return Inertia::render('Landing/Cookies', [
            'content' => $config->cookies ?? '<h2>Cookies Policy</h2><p>Cookies policy content will be available soon.</p>',
        ]);
    }

    public function linkRedirect($link)
    {
        $id = decodeSlug($link);
        $user = User::find($id);

        if (!$user) {
            return redirect()->route('home')->with('error', 'Stylist not found.');
        } else {
            if ($user->role === 'customer')
                return redirect()->route('stylists.show', $user->id);
            else
                return redirect()->route('link.show', $user->id);
        }
    }

    public function showStylist($id)
    {
        $user = User::where('role', 'stylist')->where('id', $id)->whereHas('stylist_profile')->firstOrFail();
        if ($user->stylist_profile->status !== 'approved' && !$user->stylist_profile->is_available) {
            return back()->with('error', 'Stylist public profile is not available.');
        }
        $stylist = User::where('role', 'stylist')->where('id', $id)->whereHas('stylist_profile', function ($query) {
            $query->where('is_available', true)->where('status', 'approved');
        })->firstOrFail();
        $stylist_likes = $stylist->stylist_profile->likes()->where('status', true)->count();
        $portfolio_likes = $stylist->portfolioLikes()->where('status', true)->count();
        $total_likes = $stylist_likes + $portfolio_likes;
        $stylist_rating = Review::whereHas('appointment', function ($query) use ($stylist) {
            $query->where('stylist_id', $stylist->id);
        })->avg('rating') ?? 0;
        $reviews_count = $stylist->stylistAppointments()->whereHas('review')->count();
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
        $targetLocationService = $stylist->location_service;
        $appointment_counts = $stylist->stylistAppointments()->where('status', 'completed')->count();
        // Get dynamic availability data
        $availabilityData = calculateStylistAvailability($stylist);
        $stylist->stylist_profile->increment('visits_count');

        return Inertia::render('Landing/Stylist', [
            'stylist' => [
                'id' => $stylist->id,
                'profile_id' => $stylist->stylist_profile->id ?? null,
                'availability_status' => $stylist->stylist_profile->is_available ?? false,
                'availability' => $availabilityData['availability'],
                'description' => $stylist->bio,
                'category' => $categories[0]['category'] ?? null,
                'distance' => 'N/A',
                'response_time' => $availabilityData['response_time'],
                'next_available' => $availabilityData['next_available'],
                'average_rating' => round($stylist_rating, 1),
                'total_reviews' => $reviews_count,
                'name' => $stylist->name,
                'title' => $stylist->stylist_profile->business_name ?? 'Stylist',
                'certificates' => $stylist->stylist_certifications->pluck('title')->all(),
                'profile_image' => getAvatar($stylist),
                'banner_image' => $stylist->stylist_profile->banner ? asset('storage/' . $stylist->stylist_profile->banner) : null,
                'sample_images' => $stylist->portfolios()->whereNotNull('media_urls')->pluck('media_urls')->flatten()->take(6)->toArray(),
                'price_range' => ($minPortfolio !== null && $maxPortfolio !== null) ? "R" . number_format($minPortfolio) . "-R" . number_format($maxPortfolio) : null,
                'price' => $minPortfolio,
                'location' => $stylist->country ?? 'Location not set',
                'categories' => $categories,
                'years_of_experience' => $stylist->stylist_profile->years_of_experience ?? 0,
                'likes_count' => $total_likes,
                'section' => $stylist->plan === 'Premium Plan' ? 'top_rated' : 'online',
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
}
