<?php

namespace App\Http\Controllers\Stylist;

use App\Http\Controllers\Controller;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\StylistController;
use App\Mail\WithdrawalNotificationEmail;
use App\Models\Appointment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class DashboardController extends Controller
{
    private $stylistController;
    private $paymentController;

    public function __construct(StylistController $stylistController, PaymentController $paymentController)
    {
        $this->stylistController = $stylistController;
        $this->paymentController = $paymentController;
    }

    public function index(Request $request)
    {
        $totalEarnings = (float) $request->user()->transactions()
            ->where('type', 'earning')
            ->where('status', 'completed')
            ->sum('amount') ?? 0;
        $activeAppointmentCount = (int) $request->user()->stylistAppointments()
            ->whereIn('status', ['confirmed', 'escalated'])
            ->count();
        $averageRating = (float) $request->user()->stylistAppointments()
            ->join('reviews', 'appointments.id', '=', 'reviews.appointment_id')
            ->whereNotNull('reviews.rating')
            ->avg('reviews.rating') ?? 0;
        $portfolioCount = (int) $request->user()->portfolios()->count();
        $allBookingCount = (int) $request->user()->stylistAppointments()
            ->where('status', 'completed')
            ->count();

        $appointments = Appointment::where('stylist_id', $request->user()->id)->whereIn('status', ['processing', 'pending', 'approved'])->with([
            'customer',
            'portfolio.category'
        ])->get()->map(function ($appointment) {
            return [
                'appointment' => $appointment->id,
                'name' => $appointment->customer->name,
                'service' => $appointment->portfolio?->category?->name ?? 'None',
                'amount' => (float) $appointment->amount,
                'status' => $appointment->status,
                'date' => $appointment->created_at->format('M j, Y'),
                'time' => $appointment->created_at->format('g:i A') . ' (' . $appointment->created_at->diffForHumans() . ')',
                'imageUrl' => $appointment->customer->avatar ?? null,
            ];
        });

        // Generate booking trends data (last 12 months)
        $bookingTrends = collect(range(11, 0))->map(function ($monthsAgo) use ($request) {
            $date = now()->subMonths($monthsAgo);
            $count = $request->user()->stylistAppointments()
                ->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->count();

            return [
                'name' => $date->format('M'),
                'value' => $count,
            ];
        });

        // Generate appointment trend data (last 12 months)
        $appointmentTrends = collect(range(11, 0))->map(function ($monthsAgo) use ($request) {
            $date = now()->subMonths($monthsAgo);
            $scheduled = $request->user()->stylistAppointments()
                ->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->where('status', 'confirmed')
                ->count();

            $premium = $request->user()->stylistAppointments()
                ->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->where('status', 'completed')
                ->where('amount', '>', 100) // Assuming premium appointments are above R100
                ->count();

            return [
                'name' => $date->format('M'),
                'scheduled' => $scheduled,
                'premium' => $premium,
            ];
        });

        $stylistUser = $request->user();
        $profile_completeness = [
            'portfolio' => $stylistUser->portfolios()->exists(),
            'payment_method' => $stylistUser->stylistPaymentMethods()->where('is_active', true)->exists(),
            'status_approved' => $stylistUser->stylist_profile?->status === 'approved',
            'social_links' => $stylistUser->stylist_profile?->socials && count($stylistUser->stylist_profile->socials) > 0,
            'works' => $stylistUser->stylist_profile?->works && count($stylistUser->stylist_profile->works) > 0,
            'location_service' => $stylistUser->location_service,
            'address' => $stylistUser->country !== null && $stylistUser->country !== '',
            'subscription_status' => $stylistUser->subscription_status === 'active',
            'user_avatar' => $stylistUser->avatar !== null && $stylistUser->avatar !== '',
            'user_bio' => $stylistUser->bio !== null && $stylistUser->bio !== '',
            'user_banner' => $stylistUser->stylist_profile?->banner !== null && $stylistUser->stylist_profile?->banner !== '',
        ];

        return Inertia::render('Stylist/Dashboard', [
            'appointments' => $appointments,
            'statistics' => [
                'total_earnings' => $totalEarnings,
                'active_appointments' => $activeAppointmentCount,
                'average_rating' => $averageRating ? round($averageRating, 1) : 0,
                'total_portfolios' => $portfolioCount,
                'all_bookings' => $allBookingCount,
            ],
            'bookingTrends' => $bookingTrends,
            'appointmentTrends' => $appointmentTrends,
            'profile_completeness' => $profile_completeness,
        ]);
    }

    public function earningIndex(Request $request)
    {
        $user = $request->user();

        // Current period (this month)
        $currentMonth = now()->startOfMonth();
        $totalEarnings = $user->transactions()
            ->where('type', 'earning')
            ->where('status', 'completed')
            ->sum('amount') ?? 0;

        $currentMonthEarnings = $user->transactions()
            ->where('type', 'earning')
            ->where('status', 'completed')
            ->where('created_at', '>=', $currentMonth)
            ->sum('amount') ?? 0;

        // Previous period (last month) for comparison
        $lastMonth = now()->subMonth()->startOfMonth();
        $lastMonthEnd = now()->subMonth()->endOfMonth();
        $lastMonthEarnings = $user->transactions()
            ->where('type', 'earning')
            ->where('status', 'completed')
            ->whereBetween('created_at', [$lastMonth, $lastMonthEnd])
            ->sum('amount') ?? 0;

        // Calculate percentage change for earnings
        $earningsChange = 0;
        $earningsChangeText = 'No previous data';
        if ($lastMonthEarnings > 0) {
            $earningsChange = (($currentMonthEarnings - $lastMonthEarnings) / $lastMonthEarnings) * 100;
            $earningsChangeText = abs($earningsChange) < 0.01
                ? 'Same as last month'
                : ($earningsChange > 0 ? 'Up from last month' : 'Down from last month');
        } elseif ($currentMonthEarnings > 0) {
            $earningsChange = 100;
            $earningsChangeText = 'First earnings this month';
        }

        $totalBalance = $user->balance ?? 0;
        $totalWithdrawn = $user->withdrawals()->where('status', 'approved')->sum('amount') ?? 0;
        $totalEarnings = $totalBalance + $totalWithdrawn;

        // Get this week's withdrawals for comparison
        $thisWeekStart = now()->startOfWeek();
        $thisWeekWithdrawn = $user->withdrawals()
            ->where('status', 'approved')
            ->where('created_at', '>=', $thisWeekStart)
            ->sum('amount') ?? 0;

        $lastWeekStart = now()->subWeek()->startOfWeek();
        $lastWeekEnd = now()->subWeek()->endOfWeek();
        $lastWeekWithdrawn = $user->withdrawals()
            ->where('status', 'approved')
            ->whereBetween('created_at', [$lastWeekStart, $lastWeekEnd])
            ->sum('amount') ?? 0;

        // Calculate percentage change for withdrawals
        $withdrawnChange = 0;
        $withdrawnChangeText = 'No previous data';
        if ($lastWeekWithdrawn > 0) {
            $withdrawnChange = (($thisWeekWithdrawn - $lastWeekWithdrawn) / $lastWeekWithdrawn) * 100;
            $withdrawnChangeText = abs($withdrawnChange) < 0.01
                ? 'Same as last week'
                : ($withdrawnChange > 0 ? 'Up from last week' : 'Down from last week');
        } elseif ($thisWeekWithdrawn > 0) {
            $withdrawnChange = 100;
            $withdrawnChangeText = 'First withdrawal this week';
        }

        $totalRequests = $user->withdrawals()->where('status', 'pending')->count() ?? 0;

        // Get yesterday's balance for comparison (if available)
        $yesterdayTransaction = $user->transactions()
            ->where('created_at', '>=', now()->subDay()->startOfDay())
            ->where('created_at', '<', now()->startOfDay())
            ->latest()
            ->first();

        $balanceChange = 0;
        $balanceChangeText = 'No recent activity';
        if ($yesterdayTransaction) {
            // Simple comparison based on transaction types
            if ($yesterdayTransaction->type === 'earning') {
                $balanceChange = 5; // Positive indicator
                $balanceChangeText = 'Recent earnings added';
            } elseif (in_array($yesterdayTransaction->type, ['withdraw', 'refund'])) {
                $balanceChange = -2; // Negative indicator
                $balanceChangeText = 'Recent withdrawal made';
            }
        }

        //appountment_pouches:status->holding,transactions:withdraw,refund,earning
        $transactions = $user->transactions()
            ->with(['appointment.customer'])
            ->whereIn('type', ['withdraw', 'refund', 'earning'])
            ->latest()
            ->get()
            ->map(function ($transaction) use ($user) {
                $isSelf = in_array($transaction->type, ['withdraw', 'refund']);
                $customer = !$isSelf ? $transaction->appointment?->customer : $user;

                return [
                    'id' => $transaction->id,
                    'name' => $isSelf ? 'Me' : ($customer?->name ?? 'N/A'),
                    'email' => $customer?->email ?? 'N/A',
                    'requestId' => $transaction->ref,
                    'purpose' => Str::title($transaction->type),
                    'requestTime' => $transaction->created_at->format('M d, Y, H:i:s'),
                    'amount' => number_format($transaction->amount, 2),
                    'status' => Str::title($transaction->status),
                    'avatar' => $this->getAvatar($customer),
                    'source' => 'transaction'
                ];
            });

        // Get appointment pouches with holding status
        $appointmentPouches = $user->pouches()
            ->with(['appointment.customer'])
            ->where('status', 'holding')
            ->latest()
            ->get()
            ->map(function ($pouch) use ($user) {
                $customer = $pouch->appointment?->customer;

                return [
                    'id' => 'pouch_' . $pouch->id,
                    'name' => $customer?->name ?? 'N/A',
                    'email' => $customer?->email ?? 'N/A',
                    'requestId' => $pouch->appointment?->booking_id ?? 'N/A',
                    'purpose' => 'Appointment',
                    'requestTime' => $pouch->created_at->format('M d, Y, H:i:s'),
                    'amount' => number_format($pouch->amount, 2),
                    'status' => Str::title($pouch->status),
                    'avatar' => $this->getAvatar($customer),
                    'source' => 'pouch'
                ];
            });

        // Combine and sort by created_at
        $allTransactions = $transactions->concat($appointmentPouches)
            ->sortByDesc(function ($item) {
                return $item['requestTime'];
            })
            ->values();

        $setting = $user->stylistSetting;
        $payment_methods = $user->stylistPaymentMethods()
            ->where('is_active', true)->get();

        $method = null;
        if ($payment_methods) {
            $default_method = $payment_methods->where('is_default', true)->first();
            if (!$default_method) {
                $first = $payment_methods->first();
                if ($first)
                    $first->update(['is_default' => true]);
                $default_method = $payment_methods->first();
            }

            if ($default_method) {
                $method = array_merge($default_method->toArray(), [
                    'bank' => $default_method->bank_name,
                    'account' => $this->maskAccountNumber($default_method->account_number),
                    'routing' => $this->maskRoutingNumber($default_method->routing_number),
                ]);
            }
        }

        $resp = [
            'statistics' => [
                'total_earnings' => [
                    'value' => $totalEarnings,
                    'current_period' => $currentMonthEarnings,
                    'change_percentage' => round($earningsChange, 1),
                    'change_text' => $earningsChangeText,
                    'is_positive' => $earningsChange >= 0,
                ],
                'total_balance' => [
                    'value' => $totalBalance,
                    'change_percentage' => $balanceChange,
                    'change_text' => $balanceChangeText,
                    'is_positive' => $balanceChange >= 0,
                ],
                'total_withdrawn' => [
                    'value' => $totalWithdrawn,
                    'current_period' => $thisWeekWithdrawn,
                    'change_percentage' => round($withdrawnChange, 1),
                    'change_text' => $withdrawnChangeText,
                    'is_positive' => $withdrawnChange >= 0,
                ],
                'total_requests' => [
                    'value' => $totalRequests,
                    'change_text' => $totalRequests === 0 ? 'No pending requests' : ($totalRequests === 1 ? '1 request pending' : "{$totalRequests} requests pending"),
                    'is_positive' => $totalRequests === 0, // No pending requests is positive
                ],
            ],
            'transactions' => $allTransactions,
            'payment_method' => $method,
            'payment_methods' => $payment_methods->map(function ($method) {
                return array_merge($method->toArray(), [
                    'bank' => $method->bank_name,
                    'account' => $this->maskAccountNumber($method->account_number),
                    'routing' => $this->maskRoutingNumber($method->routing_number),
                ]);
            }),
            'settings' => $setting,
        ];

        if ($request->expectsJson()) {
            return $resp;
        }

        return Inertia::render('Stylist/Earnings/Index', $resp);
    }

    public function earningMethods(Request $request)
    {
        $user = $request->user();
        $payment_methods = $user->stylistPaymentMethods()->orderBy('created_at', 'desc')->get();
        if (!$payment_methods) {
            $methods = [];
        } else {
            $methods = $payment_methods->map(function ($method) {
                return array_merge($method->toArray(), [
                    'bank' => $method->bank_name,
                    'account' => $this->maskAccountNumber($method->account_number),
                    'routing' => $this->maskRoutingNumber($method->routing_number),
                ]);
            })
                ->toArray();
        }

        if ($request->expectsJson()) {
            return $methods;
        }

        return Inertia::render('Stylist/Earnings/Methods', [
            'payment_methods' => $methods,
        ]);
    }

    public function accountSettings(Request $request)
    {
        $user = $request->user();
        // $setting = $user->stylistSetting;
        return Inertia::render('Stylist/Settings/Account');
    }

    public function earningSettings(Request $request)
    {
        $user = $request->user();
        $setting = $user->stylistSetting;

        if ($request->expectsJson()) {
            return $setting;
        }

        return Inertia::render('Stylist/Settings/Earnings', [
            'settings' => $setting,
        ]);
    }

    public function earningsSettingsUpdate(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'automatic_payout' => ['required', 'boolean'],
            'instant_payout' => ['required', 'boolean'],
            'payout_frequency' => ['required', Rule::in(['daily', 'bi-weekly', 'weekly', 'monthly'])],
            'payout_day' => ['required', Rule::in(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'])],
            'enable_mobile_appointments' => ['sometimes', 'boolean'],
            'enable_shop_appointments' => ['sometimes', 'boolean'],
        ]);

        $user->stylistSetting()->update($validated);

        if ($request->expectsJson()) {
            return response()->noContent();
        }

        return redirect()->back()->with('success', 'Payout settings updated successfully.');
    }

    public function withdrawalRequest(Request $request)
    {
        $resp = $this->paymentController->withdrawFromWallet($request);
        if ($resp instanceof JsonResponse) {
            $body = $resp->getData(true);
            return back()->withErrors($body);
        }

        return redirect()->back()->with('success', 'Payout requested successfully.');
    }

    public function earningsMethodsCreate(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'account_number' => ['required', 'string'],
            'account_name' => ['required', 'string'],
            'bank_name' => ['required'],
            'routing_number' => ['nullable', 'sometimes', 'string'],
        ]);

        $user->stylistPaymentMethods()->create($validated);
        $requirementsResp = $this->stylistController->runRequirementManager($user, true);

        if ($request->expectsJson()) {
            return response()->noContent();
        }

        if ($requirementsResp['next_requirement']) {
            return $this->stylistController->executeRequirementAction($requirementsResp, 'Payout method was created successfully. ', true);
        }

        return redirect()->back()->with('success', 'Payout methods created successfully.');
    }

    public function earningsMethodsUpdate(Request $request, $id)
    {
        $user = $request->user();
        $validated = $request->validate([
            'account_number' => ['required', 'string'],
            'account_name' => ['required', 'string'],
            'bank_name' => ['required'],
            'routing_number' => ['nullable', 'sometimes', 'string'],
        ]);

        $paymentMethod = $user->stylistPaymentMethods()->where('id', $id)->first();

        if (!$paymentMethod) {
            abort(403, 'Unauthorized action.');
        }

        $paymentMethod->update($validated);

        if ($request->expectsJson()) {
            return response()->noContent();
        }

        return redirect()->back()->with('success', 'Payout methods updated successfully.');
    }

    public function earningsMethodsSetDefault(Request $request, $id)
    {
        $user = $request->user();
        $paymentMethod = $user->stylistPaymentMethods()->where('id', $id)->first();

        if (!$paymentMethod) {
            abort(403, 'Unauthorized action.');
        }

        // Set the selected payment method as default
        $user->stylistPaymentMethods()->update(['is_default' => false]);
        $paymentMethod->update(['is_default' => true]);

        if ($request->expectsJson()) {
            return response()->noContent();
        }

        return redirect()->back()->with('success', 'Default payout method updated successfully.');
    }

    public function earningsMethodsToggle(Request $request, $id)
    {
        $user = $request->user();
        $paymentMethod = $user->stylistPaymentMethods()->where('id', $id)->first();

        if (!$paymentMethod) {
            abort(403, 'Unauthorized action.');
        }

        $paymentMethod->is_active = !$paymentMethod->is_active;
        // If deactivating the default method, unset default
        if (!$paymentMethod->is_active && $paymentMethod->is_default) {
            $paymentMethod->is_default = false;
            // Optionally, set another active method as default
            $anotherMethod = $user->stylistPaymentMethods()
                ->where('id', '!=', $paymentMethod->id)
                ->where('is_active', true)
                ->first();
            if ($anotherMethod) {
                $anotherMethod->is_default = true;
                $anotherMethod->save();
            }
        }
        $paymentMethod->save();

        if ($request->expectsJson()) {
            return response()->noContent();
        }

        return redirect()->back()->with('success', 'Payout method status updated successfully.');
    }

    public function earningsMethodsDestroy(Request $request, $id)
    {
        $user = $request->user();
        $paymentMethod = $user->stylistPaymentMethods()->where('id', $id)->first();

        if (!$paymentMethod) {
            abort(403, 'Unauthorized action.');
        }

        if ($paymentMethod->is_default) {
            $anotherMethod = $user->stylistPaymentMethods()
                ->where('id', '!=', $paymentMethod->id)
                ->where('is_active', true)
                ->first();
            if ($anotherMethod) {
                $anotherMethod->is_default = true;
                $anotherMethod->save();
            }
        }
        $paymentMethod->delete();
        $this->stylistController->checkProfileCompleteness($user, false);

        if ($request->expectsJson()) {
            return response()->noContent();
        }

        return redirect()->back()->with('success', 'Payout method deleted successfully.');
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

    private function maskAccountNumber(?string $number): string
    {
        return $number ? '•••• ' . substr($number, -4) : '';
    }

    private function maskRoutingNumber(?string $number): string
    {
        return $number ? '••• ' . substr($number, -3) : '';
    }
}

