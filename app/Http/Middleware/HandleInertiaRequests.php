<?php

namespace App\Http\Middleware;

use App\Helpers\AdminNotificationHelper;
use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Helpers\ChatHelper;
use App\Helpers\NotificationHelper;
use App\Models\Category;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\URL;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        dd($request->session()->get('info'));
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'requestUrl' => $request->fullUrl(),
            'appBaseURL' => URL::to('/'),
            'seo' => [
                'title' => 'Snipfair- Book Top-Rated Stylists for In-Person Appointments',
                'description' => 'Connect with professional stylists in your area. Book hair, nails, makeup, and grooming services at your convenience.',
                'keywords' => 'Book hair, nails, makeup, and grooming services, Stylist, Booking, Online Booking',
                'image' => URL::to('/images/logo/logo.png'),
                'url' => $request->fullUrl(),
            ],
            'testMode' => config('payfast.test_mode'),
            'website_configs' => getAdminConfig(),
            'category_names' => Category::all()->pluck('name'),
            'recentChats' => fn() => Auth::check()
                ? ChatHelper::getRecentChatSummaries()
                : [],
            'recentNotifications' => function () {
                if (Auth::guard('admin')->check()) {
                    return AdminNotificationHelper::getRecentNotifications(Auth::guard('admin')->user());
                }

                if (Auth::check()) {
                    return NotificationHelper::getRecentNotifications(Auth::user());
                }

                return [];
            },
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
                'info' => fn() => $request->session()->get('info'),
                'warning' => fn() => $request->session()->get('warning'),
                'message' => fn() => $request->session()->get('message'),
                'custom_response' => fn() => $request->session()->get('custom_response'),
            ],
        ];
    }
}
