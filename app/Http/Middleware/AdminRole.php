<?php

namespace App\Http\Middleware;

use App\Models\Admin;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminRole
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!Auth::guard('admin')->check()) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
            return redirect()->route('admin.login');
        }

        /**
         * @var Admin
         */
        $admin = Auth::guard('admin')->user();

        if (!$admin->hasAnyRole($roles)) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Insufficient permissions.'], 403);
            }
            abort(403, 'Insufficient permissions.');
        }

        return $next($request);
    }
}
