<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureStylistIsComplete
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Safety check
        if (!$user) {
            return redirect()->route('login');
        }

        if (!$user->stylist_profile) {
            return redirect()->route('stylist.complete');
        }

        $hasBasicDetails = $user->country && $user->stylist_profile->years_of_experience;
        $hasVerification = $user->stylist_profile->identification_id && $user->stylist_profile->identification_file;

        // If either of them is missing, redirect to the profile completion page
        if (!($hasBasicDetails && $hasVerification)) {
            return redirect()->route('stylist.complete');
        }

        return $next($request);
    }
}
