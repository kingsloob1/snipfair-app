<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminAuthenticate
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::guard('admin')->check()) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }

            return redirect()->route('admin.login');
        }

        $admin = Auth::guard('admin')->user();

        if (!$admin->is_active) {
            Auth::guard('admin')->logout();
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Account is inactive.'], 403);
            }

            return redirect()->route('admin.login')->with('error', 'Account is inactive.');
        }

        return $next($request);
    }
}
