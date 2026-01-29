<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OptionalSanctumAuth
{
    public function handle(Request $request, Closure $next)
    {
        // Check if request has a bearer token
        if ($request->bearerToken()) {
            // Call the method to verify authentication or allow guest access
            Auth::guard(name: 'optional_sanctum')->check();
        }

        return $next($request);
    }
}
