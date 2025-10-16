<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use App\Mail\WelcomeEmail;
use Illuminate\Support\Facades\Mail;


class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        if (!getAdminConfig('allow_registration_customers')) {
            return back()->with('error', 'Registration is disabled currently, try again later or contact support if issue persists');
        }

        $user = User::create([
            'name' => $request->name,
            'first_name' => explode(' ', $request->name, 2)[0] ?? '',
            'last_name' => explode(' ', $request->name, 2)[1] ?? '',
            'email' => $request->email,
            'phone' => '',
            'password' => Hash::make($request->password),
        ]);

        Mail::to($user->email)->send(new WelcomeEmail($user->first_name, $user->email, null, 'customer'));
        // event(new Registered($user));

        Auth::login($user);

        $user->sendEmailVerificationOtp();

        // return redirect(route('dashboard', absolute: false));
        return back();
    }
}
