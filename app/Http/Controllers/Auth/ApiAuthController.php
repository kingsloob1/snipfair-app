<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\StylistSchedule;
use App\Models\StylistSetting;
use App\Models\User;
use App\Rules\PhoneNumber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password as FacadesPassword;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class ApiAuthController extends Controller
{
    public function formattedUserResp(User $user)
    {
        $mainResp = [
            'user' => $user,
            'role' => $user->role,
            'subscriptions' => $user->subscriptions,
        ];

        if ($user->role === 'stylist') {
            return array_merge($mainResp, [
                'stylist_profile' => $user->stylist_profile,
                'stylist_settings' => $user->stylistSettings,
            ]);
        }

        return $mainResp;
    }

    public function generateAuthResponseForUserDevice(User $user, string $device_name)
    {
        $user->last_login_at = now();
        $user->save();
        $user->tokens()->delete(); // Ensure old token are revoked
        $token = $user->createToken($device_name, ['*'], now()->addWeeks(4));
        $role = $user->role;

        return array_merge([
            'token' => $token->plainTextToken,
        ], $this->formattedUserResp($user));
    }

    /**
     * Handle an incoming login request.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'device_name' => 'required|string|max:255',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        return $this->generateAuthResponseForUserDevice($user, $request->device_name);
    }

    /**
     * Handle an incoming logout request.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->noContent();
    }

    /**
     * Handle an incoming update password request.
     */
    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->noContent();
    }

    /**
     * Handle an incoming customer registration request.
     */
    public function registerCustomer(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'phone' => ['nullable', 'numeric', new PhoneNumber()],
            'password' => ['required', 'confirmed', Password::defaults()],
            'device_name' => 'required|string|max:255',
        ]);

        $user = User::create(
            array_merge($request->only(['first_name', 'last_name', 'email', 'phone']), [
                'name' => Str::title($request->first_name . ' ' . $request->last_name),
                'password' => Hash::make($request->password),
                'type' => 'normal',
                'role' => 'customer',
            ]),
        );

        $user->sendEmailVerificationOtp();
        return $this->generateAuthResponseForUserDevice($user, $request->device_name);
    }

    /**
     * Handle an incoming customer registration request.
     */
    public function registerStylist(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'phone' => ['required', 'numeric', new PhoneNumber()],
            'password' => ['required', 'confirmed', Password::defaults()],
            'device_name' => 'required|string|max:255',
        ]);

        $user = User::create(
            array_merge($request->only(['first_name', 'last_name', 'email', 'phone']), [
                'name' => Str::title($request->first_name . ' ' . $request->last_name),
                'password' => Hash::make($request->password),
                'type' => 'normal',
                'role' => 'stylist',
            ]),
        );

        // event(new Registered($user));
        $days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        foreach ($days as $day) {
            StylistSchedule::create([
                'user_id' => $user->id,
                'day' => $day,
                'available' => false,
            ]);
        }

        StylistSetting::create([
            'user_id' => $user->id,
            'automatic_payout' => false,
            'instant_payout' => false,
            'payout_frequency' => 'weekly',
            'payout_day' => 'sunday',
            'enable_mobile_appointments' => true,
            'enable_shop_appointments' => true,
        ]);


        $user->sendEmailVerificationOtp();
        return $this->generateAuthResponseForUserDevice($user, $request->device_name);
    }


    /**
     * Handle an incoming user forgot password request.
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        // We will send the password reset link to this user. Once we have attempted
        // to send the link, we will examine the response then see the message we
        // need to show to the user. Finally, we'll send out a proper response.
        $status = FacadesPassword::sendResetLink(
            $request->only('email')
        );

        if ($status == FacadesPassword::RESET_LINK_SENT) {
            return response()->noContent();
        }

        throw ValidationException::withMessages([
            'email' => [trans($status)],
        ]);
    }

    /**
     * Handle an incoming get user request.
     */
    public function getUserFromRequest(Request $request)
    {
        $user = $request->user();
        return $this->formattedUserResp($user);
    }

    /**
     * Handle an incoming verify email otp request.
     */
    public function verifyUserEmailFromOtp(Request $request)
    {
        $request->validate([
            'otp' => 'required|string|size:6',
        ]);

        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->noContent();
        }

        if ($user->verifyEmailWithOtp($request->otp)) {
            return response()->noContent();
        }

        throw ValidationException::withMessages([
            'otp' => 'Invalid or expired verification code.',
        ]);
    }

    /**
     * Handle an incoming verify email otp request.
     */
    public function resendVerificationOtp(Request $request)
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            throw new BadRequestHttpException('Email is already verified');
        }

        $user->sendEmailVerificationOtp();

        return response()->noContent();
    }
}
