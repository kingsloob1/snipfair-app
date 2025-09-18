<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = $request->user();
        $user->last_login_at = now();
        if($user->status === 'inactive') $user->status = 'active';
        $user->save();

        if($user->status === 'banned') return $this->logout($request, 'banned');
        
        if($user->role === 'stylist')
            return redirect()->intended(route('stylist.dashboard', absolute: false));
        elseif($user->role === 'customer')
            return redirect()->intended(route('dashboard', absolute: false));

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        return $this->logout($request);
    }

    private function logout(Request $request, $reason = null){
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/')->with($reason ? 'error' : 'message', $reason ? 'Your account may have been flagged or banned due to violations or suspicious activities, please contact support' : 'Logout successful!');
    }
}
