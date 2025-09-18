<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class EmailVerificationOtpController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();

        $successMessage = session('success');
        if ($user->hasVerifiedEmail() && !$successMessage) {
            return redirect()->intended(route('dashboard'));
        }

        // $user->sendEmailVerificationOtp();
        if($user->role === 'stylist')
            return Inertia::render('Auth/Stylist/VerifyEmail', ['status' => session('status')]);
        else return Inertia::render('Auth/VerifyEmail', ['status' => session('status')]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'otp' => 'required|string|size:6',
        ]);

        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return redirect()->intended(route('dashboard'));
        }

        if ($user->verifyEmailWithOtp($request->otp)) {
            return back()->with('success', 'Email verified successfully!');
        }

        return back()->withErrors([
            'otp' => 'Invalid or expired verification code.',
        ]);
    }

    public function resend(Request $request)
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return redirect()->intended(route('dashboard'));
        }

        $user->sendEmailVerificationOtp();

        return back()->with('status', 'verification-code-sent');
    }
}
