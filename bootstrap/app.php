<?php

use App\Http\Middleware\AdminAuthenticate;
use App\Http\Middleware\AdminRole;
use App\Http\Middleware\EnsureIsCustomer;
use App\Http\Middleware\EnsureIsStylist;
use App\Http\Middleware\EnsurePhoneIsVerified;
use App\Http\Middleware\EnsureStylistIsComplete;
use App\Http\Middleware\EnsureStylistProfile;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        // admin: __DIR__.'/../routes/admin.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
        then: function () {
        Route::middleware('web')
                ->group(base_path('routes/admin.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\SEOMiddleware::class,
        ]);

        $middleware->alias([
            'admin.auth' => AdminAuthenticate::class,
            'admin.role' => AdminRole::class,
            'phone.verified' => EnsurePhoneIsVerified::class,
            'profile.complete' => EnsureStylistIsComplete::class,
            'is.customer' => EnsureIsCustomer::class,
            'is.stylist' => EnsureIsStylist::class,
            'stylist.profile' => EnsureStylistProfile::class,
        ]);
        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (TransportExceptionInterface $e, $request) {
            // Log details for debugging
            Log::error('Global Mail send failed', [
                'error' => $e->getMessage(),
                'user' => auth(),
            ]);

            // Handle Inertia/React (expects JSON)
            if ($request->expectsJson()) {
                return new JsonResponse([
                    'message' => 'We could not send the email. Please check the address or try again later.'
                ], 422);
            }

            // Handle traditional Blade/web requests
            return redirect()->back()->with(
                'error',
                'Mailer error. Please check the email address or try again later.'
            );
        });
    })
    ->create();
