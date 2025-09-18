<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use GuzzleHttp\Exception\ClientException;
use Laravel\Socialite\Contracts\User as SocialiteUser;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use App\Mail\WelcomeEmail;
use App\Models\StylistSchedule;
use App\Models\StylistSetting;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;

class SocialController extends Controller
{
    public function redirectToGoogle(Request $request, $role = 'customer')
    {
        // Validate role parameter
        $validRoles = ['customer', 'stylist'];
        if (!in_array($role, $validRoles)) {
            $role = 'customer';
        }

        return Socialite::driver('google')
            ->with(['state' => base64_encode(json_encode(['role' => $role]))])
            ->redirect();
    }

    public function handleGoogleCallback(Request $request)
    {
        try {
            // Get the role from state parameter
            $state = $request->get('state');
            $stateData = json_decode(base64_decode($state), true);
            $role = $stateData['role'] ?? 'customer';

            /** @var SocialiteUser $socialiteUser */
            $socialiteUser = Socialite::driver('google')->stateless()->user();
        } catch (ClientException $e) {
            return redirect()->route('login')
                ->withErrors('error', 'Invalid credentials provided.');
        } catch (\Exception $e) {
            return redirect()->route('login')
                ->withErrors('error', 'Authentication failed. Please try again.');
        }

        $email = $socialiteUser->getEmail();

        // Extract names
        if ($socialiteUser->offsetExists('given_name')) {
            $firstName = $socialiteUser->offsetGet('given_name');
        } else {
            $firstName = ucfirst(preg_split('/[^\w]+/', explode('@', $email)[0])[0]);
        }

        if ($socialiteUser->offsetExists('family_name')) {
            $lastName = $socialiteUser->offsetGet('family_name');
        } else {
            $lastName = ucfirst(preg_split('/[^\w]+/', explode('@', $email)[0])[0]);
        }

        $avatarUrl = $socialiteUser->getAvatar() ?? null;

        // Check if user already exists
        $user = User::where('email', $email)->first();

        if (!$user) {
            if($role === 'customer'){
                if(!getAdminConfig('allow_registration_customers')){
                    return back()->with('error', 'Registration is disabled currently, try again later or contact support if issue persists');
                }
                $user = User::create([
                    'name' => $firstName . ' ' . $lastName,
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'email' => $email,
                    'phone' => '',
                    'password' => Hash::make(Str::random(12)),
                    'role' => $role,
                    'type' => 'google',
                    'email_verified_at' => now(),
                    'avatar' => $avatarUrl,
                ]);
            } else if ($role === 'stylist') {
                if(!getAdminConfig('allow_registration_stylists')){
                    return back()->with('error', 'Registration is disabled currently, try again later or contact support if issue persists');
                }
                $user = User::create([
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'name' => $firstName . ' ' . $lastName,
                    'email' => $email,
                    'phone' => '',
                    'password' => Hash::make(Str::random(12)),
                    'type' => 'google',
                    'role' => 'stylist',
                    'avatar' => $avatarUrl,
                    'email_verified_at' => now(),
                ]);

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
            }

            $user->email_verified_at = now();
            $user->save();
            // Send welcome email
            Mail::to($email)->send(new WelcomeEmail($user->first_name, $user->email, null, $role));
            $message = "Registration successful! Welcome to our platform.";
        } else {
            // User exists, check if they have a normal account
            if ($user->type !== 'google') {
                return redirect()->route('login')
                    ->with('error', "An account with this email already exists for another authentication method. Please log in with your password.");
            }

            $message = "Welcome back!";
        }

        $user->last_login_at = now();
        $user->save();

        // Log the user in using Laravel's built-in authentication
        Auth::login($user, true); // true for "remember me"
        $request->session()->regenerate();

        // Redirect based on role or user preference
        $redirectTo = $this->getRedirectPath($user);

        return redirect($redirectTo)->with('success', $message);
    }

    private function getRedirectPath(User $user): string
    {
        // Customize redirect based on user role
        switch ($user->role) {
            case 'stylist':
                return '/stylist/dashboard';
            case 'customer':
            default:
                return '/dashboard';
        }
    }
}
