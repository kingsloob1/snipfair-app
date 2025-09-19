<?php

namespace App\Http\Middleware;

use App\Models\Admin;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureProfileIsComplete
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        /**
         * @var User
         */
        $user = $request->user();

        // Safety check
        if (!$user) {
            return redirect()->route('login');
        }

        if ($user instanceof Admin) {
            return $next($request);
        } else if ($user instanceof User) {
            if (!$user->email_verified_at) {
                if ($request->expectsJson()) {
                    return response()->json([
                        'message' => 'Please verify your email address to continue',
                        'code' => 'VERIFY_EMAIL'
                    ], Response::HTTP_FORBIDDEN);
                }

                return redirect()->route('verification.notice');
            }

            if ($user->role === 'customer') {
                return $next($request);
            }

            if ($user->role === 'stylist') {
                if (!$user->stylist_profile) {
                    if ($request->expectsJson()) {
                        return response()->json([
                            'message' => 'Ooops.. Only stylists with valid profile can access this resource',
                            'code' => 'NO_STYLIST_PROFILE'
                        ], Response::HTTP_FORBIDDEN);
                    }

                    return redirect()->route('stylist.complete');
                }

                $hasBasicDetails = $user->country && $user->stylist_profile->years_of_experience;
                $hasVerification = $user->stylist_profile->identification_id && $user->stylist_profile->identification_file;

                // If either of them is missing, redirect to the profile completion page
                if (!($hasBasicDetails && $hasVerification)) {
                    if ($request->expectsJson()) {
                        return response()->json([
                            'message' => 'Ooops.. Only stylists with complete onboarding can access this resource',
                            'code' => 'INCOMPLETE_STYLIST_PROFILE'
                        ], Response::HTTP_FORBIDDEN);
                    }

                    return redirect()->route('stylist.complete');
                }
            }
        }



        return $next($request);
    }
}
