<?php

namespace App\Providers;

use App\Guards\OptionalSanctumAuthGuard;
use App\Guards\QueryTokenGuard;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\PersonalAccessToken;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        //Register the query token guard as an auth driver
        Auth::extend('auth_query_token', function ($app, $name, array $config) {
            $provider = Auth::createUserProvider($config['provider']);
            $request = $app['request'];

            return new QueryTokenGuard($provider, $request);
        });

        //Register the optional sanctum auth guard as an auth driver
        Auth::extend('optional_auth_sanctum', function ($app, $name, array $config) {
            $provider = Auth::createUserProvider($config['provider']);
            $request = $app['request'];

            return new OptionalSanctumAuthGuard($provider, $request);
        });

        if (App::environment(['ngrok', 'local', 'production'])) {
            URL::forceScheme('https');
        }
    }
}
