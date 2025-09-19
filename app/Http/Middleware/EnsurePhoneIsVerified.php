<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePhoneIsVerified
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || is_null($request->user()->phone_verified_at)) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Please verify your phone number to continue',
                    'code' => 'VERIFY_PHONE'
                ], Response::HTTP_FORBIDDEN);
            }

            return redirect()->route('verification.notice');
        }

        return $next($request);
    }
}
