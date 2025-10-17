<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\User;
use App\Models\Appointment;
use App\Models\Transaction;
use App\Models\Withdrawal;
use App\Models\Payment;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;
use App\Mail\StylistAccountApprovedEmail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class DashboardController extends Controller
{
    public function index()
    {
        $admin = Auth::guard('admin')->user();

        // Basic statistics
        $totalUsers = User::count();
        $totalStylists = User::where('type', 'stylist')->count();
        $totalCustomers = User::where('type', 'customer')->count();
        $totalBookings = Appointment::count();

        // Revenue calculations
        $totalRevenue = Transaction::where('status', 'completed')->sum('amount');
        $thisMonthRevenue = Transaction::where('status', 'completed')
            ->whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->sum('amount');

        // Calculate previous month for comparison
        $previousMonthRevenue = Transaction::where('status', 'completed')
            ->whereMonth('created_at', Carbon::now()->subMonth()->month)
            ->whereYear('created_at', Carbon::now()->subMonth()->year)
            ->sum('amount');

        $revenueGrowth = $previousMonthRevenue > 0
            ? (($thisMonthRevenue - $previousMonthRevenue) / $previousMonthRevenue) * 100
            : 0;

        // Growth rate calculation (users registered this month vs last month)
        $thisMonthUsers = User::whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->count();
        $lastMonthUsers = User::whereMonth('created_at', Carbon::now()->subMonth()->month)
            ->whereYear('created_at', Carbon::now()->subMonth()->year)
            ->count();

        $userGrowthRate = $lastMonthUsers > 0
            ? (($thisMonthUsers - $lastMonthUsers) / $lastMonthUsers) * 100
            : 0;

        $stats = [
            'total_users' => $totalUsers,
            'total_bookings' => $totalBookings,
            'platform_revenue' => $totalRevenue,
            'growth_rate' => round($userGrowthRate, 1),
            'revenue_growth' => round($revenueGrowth, 1),
            'this_month_revenue' => $thisMonthRevenue,
            'total_stylists' => $totalStylists,
            'total_customers' => $totalCustomers,
        ];

        // Chart data for revenue over last 12 months
        $revenueChartData = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $monthRevenue = Transaction::where('status', 'completed')
                ->whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->sum('amount');

            $revenueChartData[] = [
                'month' => $date->format('M'),
                'revenue' => (float) $monthRevenue,
            ];
        }

        // User growth data over last 12 months
        $userGrowthData = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $monthCustomers = User::where('role', 'customer')
                ->whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->count();
            $monthStylists = User::where('role', 'stylist')
                ->whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->count();

            $userGrowthData[] = [
                'month' => $date->format('M'),
                'customers' => $monthCustomers,
                'stylists' => $monthStylists,
            ];
        }

        // Booking trends over last 6 months
        $bookingTrends = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $monthBookings = Appointment::whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->count();

            $bookingTrends[] = [
                'month' => $date->format('M'),
                'bookings' => $monthBookings,
            ];
        }

        // Platform revenue breakdown
        $premiumSubscriptions = Payment::join('plans', 'payments.plan_id', '=', 'plans.id')
            ->whereRaw('LOWER(plans.name) LIKE ?', ['%premium%'])
            ->sum('plans.amount');

        $basicSubscriptions = Payment::join('plans', 'payments.plan_id', '=', 'plans.id')
            ->whereRaw('LOWER(plans.name) LIKE ?', ['%basic%'])
            ->sum('plans.amount');

        $bookingCommissions = Transaction::where('type', 'other')->where('ref', 'AdminCommission')
            ->where('status', 'completed')
            ->sum('amount');

        $revenueBreakdown = [
            [
                'name' => 'Premium Subscriptions',
                'value' => (float) $premiumSubscriptions,
                'color' => '#f97316'
            ],
            [
                'name' => 'Basic Subscriptions',
                'value' => (float) $basicSubscriptions,
                'color' => '#8b5cf6'
            ],
            [
                'name' => 'Booking Commissions',
                'value' => (float) $bookingCommissions,
                'color' => '#1e3a8a'
            ]
        ];

        // Payout requests data
        $payoutRequests = Withdrawal::with(['user', 'payment_method'])
            ->whereHas('user', function ($query) {
                $query->where('role', 'stylist');
            })
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($withdrawal) {
                return [
                    'id' => $withdrawal->id,
                    'stylist_name' => $withdrawal->user->name,
                    'amount' => (float) $withdrawal->amount,
                    'payment_method' => 'Bank Transfer', // Since we're using bank details
                    'submitted_date' => $withdrawal->created_at->toDateString(),
                    'status' => $withdrawal->status,
                    'profile_image' => getAvatar($withdrawal->user),
                    'account_name' => $withdrawal->payment_method?->account_name,
                    'bank_name' => $withdrawal->payment_method?->bank_name,
                    'account_number' => $withdrawal->payment_method?->account_number,
                ];
            });

        $stylist_approvals = User::where('role', 'stylist')
            ->whereHas('stylist_profile', function ($query) {
                $query->where('status', 'pending');
            })
            ->with('stylist_profile')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'created_at' => $user->created_at,
                    'avatar' => $this->getAvatar($user),
                    'country' => $user->country,
                    'bio' => $user->bio,
                    'phone' => $user->phone,
                    'experience' => $user->stylist_profile->years_of_experience ?? null,
                    'specialties' => $user->portfolios()->with('category')->get()->pluck('category.name')->filter()->unique()->take(3)->values()->toArray(),
                    'portfolio_count' => $user->portfolios()->count(),
                ];
            });

        return Inertia::render('Admin/Account/Dashboard', [
            'statistics' => $stats,
            'chartData' => [
                'revenue' => $revenueChartData,
                'userGrowth' => $userGrowthData,
                'bookingTrends' => $bookingTrends,
                'revenueBreakdown' => $revenueBreakdown,
            ],
            'payoutRequests' => $payoutRequests,
            'stylist_approvals' => $stylist_approvals,
            'auth' => $admin,
        ]);
    }

    public function users()
    {
        $admin = Auth::guard('admin')->user();

        // Get customers with computed fields
        $customers = User::where('role', 'customer')
            ->withCount(['customerAppointments as total_bookings'])
            ->with([
                'payments' => function ($query) {
                    $query->where('status', 'completed');
                }
            ])
            ->get()
            ->map(function ($customer) {
                $customer->total_spent = $customer->payments->sum('amount');
                $customer->avatar = $this->getAvatar($customer);
                return $customer;
            });

        // Get all stylists with computed fields
        $allStylists = Inertia::defer(fn() => User::where('role', 'stylist')
            ->whereHas('stylist_profile', function ($query) {
                $query->whereNotNull('id');
            })
            ->withCount([
                'stylistAppointments as total_appointments',
                'portfolios as portfolios_count'
            ])
            ->with('stylist_profile', 'stylistAppointments', 'stylistAppointments.customer', 'stylistAppointments.portfolio.category', 'transactions')
            ->get()
            ->map(function ($stylist) {
                $stylist->total_earned = $stylist->transactions()->where('type', 'earning')->where('status', 'completed')->sum('amount');
                $stylist->subscription = $stylist->plan ?? 'Yet to Subscribe';
                $stylist->avatar = $this->getAvatar($stylist);
                return $stylist;
            }));

        // Get stylists with computed fields
        $stylists = Inertia::defer(fn() => User::where('role', 'stylist')
            ->whereHas('stylist_profile', function ($query) {
                $query->whereIn('status', ['approved', 'flagged']);
            })
            ->withCount([
                'stylistAppointments as total_appointments',
                'portfolios as portfolios_count'
            ])
            ->with('stylist_profile', 'stylistAppointments', 'stylistAppointments.customer', 'stylistAppointments.portfolio.category', 'transactions')
            ->get()
            ->map(function ($stylist) {
                $stylist->total_earned = $stylist->transactions()->where('type', 'earning')->where('status', 'completed')->sum('amount');
                $stylist->subscription = $stylist->plan ?? 'Yet to Subscribe';
                $stylist->avatar = $this->getAvatar($stylist);
                return $stylist;
            }));

        // Get pending stylist applications
        $stylist_approvals = Inertia::defer(fn() => User::where('role', 'stylist')
            ->whereHas('stylist_profile', function ($query) {
                $query->where('status', 'pending');
            })
            ->with('stylist_profile')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'created_at' => $user->created_at,
                    'avatar' => $this->getAvatar($user),
                    'country' => $user->country,
                    'bio' => $user->bio,
                    'phone' => $user->phone,
                    'experience' => $user->stylist_profile->years_of_experience ?? null,
                    'specialties' => $user->portfolios()->with('category')->get()->pluck('category.name')->filter()->unique()->take(3)->values()->toArray(),
                    'portfolio_count' => $user->portfolios()->count(),
                ];
            }));

        $deleted_users = Inertia::defer(fn() => User::onlyTrashed()->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'created_at' => $user->created_at,
                    'avatar' => $this->getAvatar($user),
                    'deleted_at' => $user->deleted_at,
                    'role' => $user->role,
                    'deleted_by' => 'Admin',
                ];
            }));


        return Inertia::render('Admin/Account/Users/Index', [
            'customers' => $customers,
            'all_stylists' => $allStylists,
            'stylists' => $stylists,
            'stylist_approvals' => $stylist_approvals,
            'deleted_users' => $deleted_users,
            'auth' => $admin,
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

    // User management methods
    public function disableUser(Request $request)
    {
        $user = User::findOrFail($request->user_id);
        $user->update(['status' => 'inactive']);

        return back()->with('success', 'User disabled successfully.');
    }

    public function enableUser(Request $request)
    {
        $user = User::findOrFail($request->user_id);
        $user->update(['status' => 'active']);

        return back()->with('success', 'User enabled successfully.');
    }

    public function destroyUser(User $user)
    {
        $user->delete();

        return back()->with('success', 'User deleted successfully.');
    }

    public function restoreUser($id)
    {
        $user = User::withTrashed()->findOrFail($id);
        $user->restore();

        return back()->with('success', 'User restored successfully.');
    }

    public function forceDeleteUser($id)
    {
        $user = User::withTrashed()->findOrFail($id);
        $user->forceDelete();

        return back()->with('success', 'User permanently deleted successfully.');
    }

    // Stylist management methods
    public function disableStylist(Request $request)
    {
        $user = User::findOrFail($request->user_id);
        $user->update(['status' => 'inactive']);
        $user->stylist_profile?->update(['is_available' => false]);

        return back()->with('success', 'Stylist disabled successfully.');
    }

    public function enableStylist(Request $request)
    {
        $user = User::findOrFail($request->user_id);
        $user->update(['status' => 'active']);

        return back()->with('success', 'Stylist enabled successfully.');
    }

    public function flagStylist(Request $request)
    {
        $user = User::findOrFail($request->user_id);
        $user->update(['status' => 'banned']);
        $user->stylist_profile?->update(['status' => 'flagged', 'is_available' => false]);

        return back()->with('success', 'Stylist account flagged successfully.');
    }

    public function unflagStylist(Request $request)
    {
        $user = User::findOrFail($request->user_id);
        $user->update(['status' => 'active']);
        $user->stylist_profile?->update(['status' => 'approved']);

        return back()->with('success', 'Stylist account reinstated successfully.');
    }

    public function destroyStylist(User $user)
    {
        $user->delete();

        return back()->with('success', 'Stylist deleted successfully.');
    }

    // Stylist approval methods
    public function approveStylist(Request $request)
    {
        $user = User::findOrFail($request->application_id);

        // Update stylist profile status
        if ($user->stylist_profile) {
            $user->update(['status' => 'active']);
            $user->stylist_profile->update(['status' => 'approved']);
            Mail::to($user->email)->send(new StylistAccountApprovedEmail(
                stylistName: $user->first_name,
                stylistEmail: $user->email,
                loginUrl: url('/login')
            ));
        }

        // Update user status
        $user->update(['status' => 'active']);

        return back()->with('success', 'Stylist application approved successfully.');
    }

    public function rejectStylist(Request $request)
    {
        $user = User::findOrFail($request->application_id);

        // Update stylist profile status
        if ($user->stylist_profile) {
            $user->stylist_profile->update(['status' => 'rejected']);
        }

        return back()->with('success', 'Stylist application rejected.');
    }

    public function getStylist($id)
    {
        $admin = Auth::guard('admin')->user();
        $stylist = User::where('role', 'stylist')->where('id', $id)->whereHas('stylist_profile')->first();
        if (!$stylist) {
            return redirect()->back()->with('error', 'Stylist profile not completely registered.');
        }
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
                    'category' => $portfolio->category->name ?? 'Uncategorized',
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
                    'category' => $portfolio->category->name ?? 'Uncategorized',
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



        return Inertia::render('Admin/Account/Users/Stylist', [
            'auth' => $admin,
            'stylist' => [
                'id' => $stylist->id,
                'profile_id' => $stylist->stylist_profile->id ?? null,
                'availability_status' => $stylist->stylist_profile->is_available ?? false,
                'availability' => 'Today',
                'description' => $stylist->bio,
                'category' => $categories[0]['category'] ?? null,
                'distance' => 'N/A',
                'response_time' => '30mins',
                'next_available' => 'Today 2:00 PM',
                'average_rating' => round($stylist_rating, 1),
                'total_reviews' => $reviews_count,
                'name' => $stylist->name,
                'title' => $stylist->stylist_profile->business_name ?? 'Stylist',
                'socials' => $stylist->stylist_profile->socials ?? [],
                'certificates' => $stylist->stylist_certifications->pluck('title')->all(),
                'profile_image' => $this->getAvatar($stylist),
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
                'identification_id' => $stylist->stylist_profile->identification_id ?? null,
                'identification_proof' => $stylist->stylist_profile->identification_proof ? Storage::url(formatStoredFilePath($stylist->stylist_profile->identification_file)) : null,
                'identification_image' => $stylist->stylist_profile->identification_file ? Storage::url(formatStoredFilePath($stylist->stylist_profile->identification_file)) : null,
                'works' => $stylist->stylist_profile?->works ?? [],
            ],
            'portfolios' => $portfolios,
            'reviews' => $actual_reviews,
            'workingHours' => $workingHours,
            'location_service' => $targetLocationService,
            'stylistAppointments' => $stylist->stylistAppointments()->with(['customer', 'portfolio.category'])->latest()->get(),
            'transactions' => $stylist->transactions()->latest()->get(),
        ]);
    }

    public function getCustomer($id)
    {
        $admin = Auth::guard('admin')->user();
        $customer = User::where('role', 'customer')->where('id', $id)->firstOrFail();

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

        $targetLocationService = $customer->location_service;
        $appointments = Appointment::where('customer_id', $customer->id)->with(['stylist', 'portfolio.category'])->latest()->get();

        return Inertia::render('Admin/Account/Users/Customer', [
            'auth' => $admin,
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
                'profile_image' => $this->getAvatar($customer),
                'bio' => $customer->bio,
                'location' => $customer->country ?? 'Location not set',
                'distance' => 'N/A',
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
            'transactions' => $customer->transactions()->latest()->get(),
        ]);
    }
}
