<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureStylistProfile
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || $request->user()->role !== 'stylist' || !$request->user()->stylist_profile) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Ooops.. Only stylists with valid profile can access this resource',
                    'code' => 'NO_STYLIST_PROFILE'
                ], Response::HTTP_FORBIDDEN);
            }

            return redirect()->route('home')->with('info', 'You must be a stylist with a valid profile to access this page.');
        }

        return $next($request);
    }
}
