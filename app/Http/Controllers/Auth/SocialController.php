<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\File;
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
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Laravel\Socialite\Two\GoogleProvider;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;

use function Illuminate\Log\log;

class SocialController extends Controller
{
    public function __construct(private ApiAuthController $apiAuthController)
    {
    }

    public function redirectToGoogle(Request $request, $role = 'customer')
    {
        // Validate role parameter
        $validRoles = ['customer', 'stylist'];
        if (!in_array($role, $validRoles)) {
            $role = 'customer';
        }

        /** @var GoogleProvider $socialiteGoogleDriver */
        $socialiteGoogleDriver = Socialite::driver('google');

        return $socialiteGoogleDriver
            ->with(['state' => base64_encode(json_encode(['role' => $role]))])
            ->redirect();
    }

    /**
     * @param \Laravel\Socialite\AbstractUser $socialiteUser
     * @param 'customer'|'stylist' $role
     * */
    private function processGoogleSocialiteUser($socialiteUser, $role = 'customer')
    {
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
        $getLocalAvatar = function () use ($avatarUrl) {
            $avatarContents = file_get_contents($avatarUrl);
            do {
                $filePath = 'avatars/' . Str::uuid() . '.jpg';
            } while (Storage::disk('public')->exists($filePath));

            return Storage::disk('public')->put($filePath, $avatarContents) ? $filePath : null;
        };

        // Check if user already exists
        $user = User::where('email', $email)->first();
        $wasCreated = false;

        if (!$user) {
            if ($role === 'customer') {
                // if (!getAdminConfig('allow_registration_customers')) {
                //     throw new BadRequestException('Registration is disabled currently, try again later or contact support if issue persists');
                // }
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
                    'avatar' => $getLocalAvatar() ?: null,
                ]);
            } else if ($role === 'stylist') {
                if (!getAdminConfig('allow_registration_stylists')) {
                    throw new BadRequestException('Registration is disabled currently, try again later or contact support if issue persists');
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
                    'avatar' => $getLocalAvatar() ?: null,
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
            $wasCreated = true;
        } else {
            //Auto verify user if user is not verified
            if (!$user->email_verified_at) {
                $user->email_verified_at = now();
            }

            if ($role !== $user->role) {
                switch ($user->role) {
                    case 'stylist': {
                        throw new BadRequestException('A stylist account currently exists for this email');
                    }


                    case 'customer': {
                        throw new BadRequestException('A customer account currently exists for this email');
                    }
                }
            }

            $wasCreated = false;
        }


        $user->last_login_at = now();
        $user->save();

        if ($wasCreated) {
            defer(function () use ($user) {
                // Send welcome email
                Mail::to($user->email)->send(new WelcomeEmail($user->first_name, $user->email, null, $user->role));
            });
        }

        return ['user' => $user, 'was_created' => $wasCreated];
    }

    public function handleGoogleCallback(Request $request)
    {
        try {
            // Get the role from state parameter
            $state = $request->get('state');
            $stateData = json_decode(base64_decode($state), true);
            $role = $stateData['role'] ?? 'customer';

            /** @var GoogleProvider $socialiteGoogleDriver */
            $socialiteGoogleDriver = Socialite::driver('google');
            $socialiteUser = $socialiteGoogleDriver->stateless()->user();
        } catch (ClientException $e) {
            return redirect()->route('login')
                ->withErrors('error', 'Invalid credentials provided.');
        } catch (\Exception $e) {
            return redirect()->route('login')
                ->withErrors('error', 'Authentication failed. Please try again.');
        }

        if (!$socialiteUser) {
            return redirect()->route('login')
                ->withErrors('error', 'Authentication failed. Please try again.');
        }

        try {
            $resp = $this->processGoogleSocialiteUser($socialiteUser, $role);

            $user = Arr::get($resp, 'user');
            $wasCreated = Arr::get($resp, 'was_created', false);

            if (!$user) {
                return redirect()->route('login')
                    ->with('error', "An error occurred while logging into user account. Kindly use another authentication method.");
            }

            $message = $wasCreated ? 'Registration successful! Welcome to our platform.' : 'Welcome back';

            // Log the user in using Laravel's built-in authentication
            Auth::login($user, true); // true for "remember me"
            $request->session()->regenerate();

            // Redirect based on role or user preference
            $redirectTo = $this->getRedirectPath($user);

            return redirect($redirectTo)->with('success', $message);
        } catch (BadRequestException $e) {
            Log::error($e);

            return redirect()->route('login')
                ->with('error', $e->getMessage());
        }
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

    public function handleGoogleLoginFromApi(Request $request)
    {
        $request->validate([
            'device_name' => 'required|string|max:255',
            'access_token' => 'required|string',
            'role' => [
                'required',
                Rule::in(['customer', 'stylist'])
            ],
        ]);

        Log::info($request->all());

        /** @var GoogleProvider $socialiteGoogleDriver */
        $socialiteGoogleDriver = Socialite::driver('google');

        $googleUser =
            $socialiteGoogleDriver->userFromToken($request->access_token);

        if (!$googleUser) {
            return response()->json([
                'status' => false,
                'message' => 'Authentication failed. Please try again.'
            ], 400);
        }

        try {
            $resp = $this->processGoogleSocialiteUser($googleUser, $request->role);
            $user = Arr::get($resp, 'user');
            $wasCreated = Arr::get($resp, 'was_created', false);

            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'An error occurred while logging into user account. Kindly use another authentication method.'
                ], 400);
            }

            return array_merge(
                $this->apiAuthController->generateAuthResponseForUserDevice(
                    $user,
                    $request->device_name
                ),
                [
                    'was_created' => $wasCreated
                ]
            );
        } catch (BadRequestException $e) {
            Log::error($e);
            Log::info(json_encode([
                'status' => false,
                'message' => $e->getMessage()
            ]));

            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
