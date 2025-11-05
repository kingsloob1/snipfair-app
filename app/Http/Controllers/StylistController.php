<?php

namespace App\Http\Controllers;

use App\Helpers\AdminNotificationHelper;
use App\Models\Category;
use App\Models\Like;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\Portfolio;
use App\Models\Review;
use App\Models\Stylist;
use App\Models\StylistSchedule;
use App\Models\StylistSetting;
use App\Models\Subscription;
use App\Models\User;
use App\Rules\UrlOrFile;
use Carbon\Carbon;
use Exception;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use App\Mail\WelcomeEmail;
use App\Models\Admin;
use App\Models\Appointment;
use App\Rules\PhoneNumber;
use Carbon\CarbonPeriod;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\URL;

class StylistController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Stylist/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            // 'name' => 'required|string|max:255',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'phone' => 'required|string|max:255',
            // 'country' => 'bio'
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        if (!getAdminConfig('allow_registration_stylists')) {
            return back()->with('error', 'Registration is disabled currently, try again later or contact support if issue persists');
        }

        $user = User::create([
            'name' => $request->first_name . ' ' . $request->last_name,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'type' => 'normal',
            'role' => 'stylist',
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

        $plan = Plan::where('name', 'Free Plan')->first();
        $payment = Payment::create([
            'plan_id' => $plan->id ?? 1,
            'user_id' => $user->id,
            'status' => 'approved',
        ]);
        $expiryDate = Carbon::now()->addYears(10); //(int) ($plan?->duration ?? 10)
        Subscription::create([
            'plan_id' => $plan->id ?? 1,
            'payment_id' => $payment->id,
            'user_id' => $user->id,
            'expiry' => $expiryDate,
        ]);

        Mail::to($user->email)->send(new WelcomeEmail($user->first_name, $user->email, null, 'stylist'));

        Auth::login($user);

        $user->sendEmailVerificationOtp();

        return redirect(route('stylist.dashboard', absolute: false));
        // return back();
    }

    public function complete(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            abort(403, 'Access Denied');
        }

        if (!$user->stylist_profile) {
            return Inertia::render('Auth/Stylist/Skills');
        }

        $hasBasicDetails = $user->country && $user->stylist_profile->years_of_experience;
        $hasVerification = $user->stylist_profile->identification_id && $user->stylist_profile->identification_file;

        if (!$hasBasicDetails) {
            return Inertia::render('Auth/Stylist/Skills');
        }

        if (!$hasVerification && $request->query('previous') && $request->previous == 'yes') {
            return Inertia::render('Auth/Stylist/Skills');
        }

        if (!$hasVerification) {
            return Inertia::render('Auth/Stylist/Identification');
        }

        if ($hasVerification && $request->query('previous') && $request->previous == 'yes') {
            return Inertia::render('Auth/Stylist/Identification');
        }

        if ($hasVerification) {
            $status = session('stylist_profile'); //dd('y', $status);
            if ($status === 'completed') {
                return Inertia::render('Auth/Stylist/Complete', [
                    'stylist_status' => $status,
                ]);
            }
            return Inertia::render('Auth/Stylist/Complete');
        }

        // If by chance everything is now complete, redirect back
        return redirect()->route('stylist.dashboard');
    }

    public function completeSkill(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            abort(403, 'Access Denied');
        }

        $request->validate([
            'business_name' => 'nullable|sometimes|string|max:255',
            'country' => 'required|string|max:255',
            'years_of_experience' => 'required|numeric|min:0|gt:0|max:50',
            'bio' => 'nullable|sometimes|string|min:25',
        ]);

        if ($request->business_name && Stylist::where('business_name', $request->business_name)->exists()) {
            return back()->withErrors(['business_name' => 'This business name is already taken.']);
        }

        $user->country = $request->country;
        if ($request->bio)
            $user->bio = $request->bio;
        $user->save();

        $user->stylist_profile()->firstOrCreate(
            [],
            [
                'business_name' => $request->business_name,
                'years_of_experience' => $request->years_of_experience,
            ]
        );

        if ($request->expectsJson()) {
            return response()->noContent();
        }

        return redirect()->route('stylist.complete');
    }

    public function completeIdentity(Request $request)
    {
        $user = $request->user();
        $stylist = $user->stylist_profile;

        if (!$user || !$stylist) {
            abort(403, 'Access Denied');
        }

        $request->validate([
            'identification_id' => 'required|string|max:255',
            'identification_file' => 'required|array|max:1',
            'identification_file.*' => 'mimes:jpeg,png,gif,webp,pdf,docx,doc|max:10240',
            'identification_proof' => 'required|image|max:20480',
        ]);

        $portfolioUrls = [];

        // Handle portfolio file uploads
        if ($request->hasFile('identification_file')) {
            foreach ($request->file('identification_file') as $file) {
                if ($file->isValid()) {
                    // Generate unique filename
                    $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();

                    // Store file in public/portfolio directory
                    $path = $file->storeAs('identifications', $filename, 'public');

                    $portfolioUrls[] = Storage::url($path);
                }
            }
        }

        $stylist->identification_id = $request->identification_id;
        $stylist->identification_file = $portfolioUrls[0];
        $stylist->identification_proof = $request->file('identification_proof')->store('identification_proofs', 'public');

        $stylist->save();

        if ($request->expectsJson()) {
            return response()->noContent();
        }

        return redirect()->route('stylist.complete');
    }

    public function completeSuccess(Request $request)
    {
        $user = $request->user();
        $stylist = $user->stylist_profile;

        if (!$user || !$stylist) {
            abort(403, 'Access Denied');
        }
        $hasBasicDetails = $user->country && $user->stylist_profile->years_of_experience;
        $hasVerification = $user->stylist_profile->identification_id && $user->stylist_profile->identification_file;

        if (!$hasBasicDetails || !$hasVerification) {
            return redirect()->route('stylist.complete');
        }
        return redirect()->route('stylist.complete')->with('stylist_profile', 'completed');
    }

    public function profileUpdate(Request $request)
    {
        $user = $request->user();
        $stylist = $user->stylist_profile;

        if (!$user || !$stylist) {
            abort(403, 'Access Denied');
        }

        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            // 'email' => 'required|email|unique:users,email,' . $user->id,
            'years_of_experience' => 'required|numeric|min:0|gte:0|max:50',
            'business_name' => 'nullable|sometimes|string|max:255',
            'phone' => 'nullable|sometimes|string|max:20',
            'location' => 'nullable|sometimes|string|max:255',
            'country' => 'nullable|sometimes|string|max:255',
            'bio' => 'nullable|sometimes|string|min:5',
            'gender' => 'sometimes|in:male,female,other',
        ]);

        $user->update([
            // 'first_name' => $request->first_name,
            // 'last_name' => $request->last_name,
            // 'email' => $request->email,
            'phone' => $request->phone ?: $user->phone,
            'country' => $request->country ?: $request->location ?: $user->country,
            'bio' => $request->bio ?: $user->bio,
            'gender' => $request->gender ?: $user->gender,
        ]);

        $stylist->update([
            'years_of_experience' => $request->years_of_experience ?: $stylist->years_of_experience,
            'business_name' => $request->business_name ?: $stylist->business_name,
        ]);

        $this->checkProfileCompleteness($user);

        return redirect()->back()->with('success', 'Profile updated successfully.');
    }

    public function serviceList(Request $request)
    {
        $user = $request->user();
        $stylist = $user->stylist_profile;

        if (!$user || !$stylist) {
            abort(403, 'Access Denied');
        }

        $portfolios = $user->portfolios()->get();
        $categories = Category::all()->pluck('name');

        return Inertia::render('Stylist/Profile/Services', [
            'portfolios' => $portfolios,
            'categories' => $categories,
        ]);
    }

    public function saveWork(Request $request)
    {
        $user = $request->user();
        $stylist = $user->stylist_profile;

        if (!$user || !$stylist) {
            abort(403, 'Access Denied');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'price' => 'required|numeric|min:0|gt:0',
            'duration' => 'required|string|max:255',
            'description' => 'required|string',
            'tags' => 'required|string',
            'media' => 'required|array|max:10',
            'media.*' => 'file|mimes:jpg,jpeg,png,gif|max:5120',
        ]);

        if ($request->price < getAdminConfig('min_booking_amount')) {
            return back()->with('error', 'Minimum booking amount is R' . getAdminConfig('min_booking_amount'));
        }
        if ($request->price > getAdminConfig('max_booking_amount')) {
            return back()->with('error', 'Maximum booking amount is R' . getAdminConfig('max_booking_amount'));
        }

        $mediaPaths = [];

        if ($request->hasFile('media')) {
            foreach ($request->file('media') as $file) {
                $mediaPaths[] = $file->store('works/media', 'public');
            }
        }

        if (!$category = Category::where('name', $validated['category'])->first()) {
            return back()->with('success', 'Something went wrong');
        }

        $work = Portfolio::create([
            'title' => $validated['title'],
            'category_id' => $category->id,
            'price' => $validated['price'],
            'duration' => $validated['duration'],
            'description' => $validated['description'],
            'tags' => $validated['tags'],
            'media_urls' => $mediaPaths,
            'user_id' => $user->id,
        ]);

        $requirementsResp = $this->runRequirementManager($user);
        if ($requirementsResp['next_requirement']) {
            $this->executeRequirementAction($requirementsResp, 'Work / Portfolio was created successfully. ', false);
        }

        if ($work)
            return redirect()->route('stylist.work')->with('success', 'Work created successfully!');
        else
            return back()->with('success', 'Something went wrong');
    }

    public function editWork(Request $request, $id)
    {
        $work = Portfolio::with('category')->findOrFail($id);
        $user = $request->user();
        $stylist = $user->stylist_profile;

        if (!$user || !$stylist || !$work) {
            abort(403, 'Access Denied');
        }

        return Inertia::render('Stylist/Work/Edit', [
            'work' => $work,

        ]);
    }

    public function updateWork(Request $request, $id)
    {
        $work = Portfolio::findOrFail($id);
        $user = $request->user();
        $stylist = $user->stylist_profile;

        if (!$user || !$stylist || !$work || $work->user_id != $user->id) {
            abort(403, 'Access Denied');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'price' => 'required|numeric|min:0|gt:0',
            'duration' => 'required|string',
            'description' => 'required|string',
            'tags' => 'required|string',
        ]);

        if ($request->price < getAdminConfig('min_booking_amount')) {
            return back()->with('error', 'Minimum booking amount is R' . getAdminConfig('min_booking_amount'));
        }
        if ($request->price > getAdminConfig('max_booking_amount')) {
            return back()->with('error', 'Maximum booking amount is R' . getAdminConfig('max_booking_amount'));
        }

        $work->update($validated);
        $requirementsResp = $this->runRequirementManager($user);

        if ($requirementsResp['next_requirement']) {
            $this->executeRequirementAction($requirementsResp, 'Work / Portfolio was updated successfully. ', false);
        }

        return redirect()->route('stylist.work')->with('success', 'Work updated successfully!');
    }

    public function toggleWork(Request $request, $id)
    {
        $work = Portfolio::findOrFail($id);
        $user = $request->user();
        $stylist = $user->stylist_profile;

        if (!$user || !$stylist || !$work || $work->user_id != $user->id) {
            abort(403, 'Access Denied');
        }

        $work->is_available = !$work->is_available;
        $work->save();

        return back()->with('success', 'Work availability updated successfully!');
    }

    public function uploadWorkMedia(Request $request, $id)
    {
        $work = Portfolio::findOrFail($id);
        $user = $request->user();
        $stylist = $user->stylist_profile;

        if (!$user || !$stylist || !$work || $work->user_id != $user->id) {
            abort(403, 'Access Denied');
        }

        $request->validate([
            'media' => 'required|array|max:10',
            'media.*' => 'file|mimes:jpg,jpeg,png|max:5120',
        ]);

        $existingFilePaths = array_map(function ($filePath) {
            return formatStoredFilePath($filePath);
        }, $work->media_urls ?? []);
        $newFiles = [];

        foreach ($request->file('media') as $file) {
            $newFiles[] = formatStoredFilePath($file->store('works/media', 'public'));
        }

        $combinedFilePaths = array_slice([...$existingFilePaths, ...$newFiles], 0, 10);

        $work->media_urls = $combinedFilePaths;
        $work->save();

        return redirect()->route('stylist.work')->with('success', 'Work updated successfully!');
    }

    public function deleteWorkMedia(Request $request, $id)
    {
        $work = Portfolio::findOrFail($id);
        $user = $request->user();
        $stylist = $user->stylist_profile;

        if (!$user || !$stylist || !$work || $work->user_id != $user->id) {
            abort(403, 'Access Denied');
        }

        $request->validate([
            'path' => 'required|string',
        ]);

        $filePathToDelete = formatStoredFilePath($request->path);
        $mediaFilePaths = array_map(function ($filePath) {
            return formatStoredFilePath($filePath);
        }, $work->media_urls ?? []);

        $mediaFilePaths = array_values(array_filter($mediaFilePaths, fn($savedPath) => !!$savedPath && ($savedPath !== $filePathToDelete)));

        Storage::disk('public')->delete($filePathToDelete);
        $work->media_urls = array_values($mediaFilePaths);
        $work->save();

        return back()->with('success', 'Media removed.');
    }

    public function deleteWork(Request $request, $id)
    {
        $work = Portfolio::findOrFail($id);
        $user = $request->user();
        $stylist = $user->stylist_profile;

        if (!$user || !$stylist || !$work || $work->user_id != $user->id) {
            abort(403, 'Access Denied');
        }

        $mediaFilePaths = array_filter(array_map(function ($filePath) {
            return formatStoredFilePath($filePath);
        }, $work->media_urls ?? []));

        foreach ($mediaFilePaths as $key => $filePath) {
            Storage::disk('public')->delete($filePath);
        }

        $work->delete();

        return back()->with('success', 'Work removed.');
    }

    public function isProfileComplete(array $profile_completeness)
    {
        $fieldsToIgnoreInCompletnessVerification = ['status_approved', 'subscription_status'];
        $completenessArrToUse = Arr::where($profile_completeness, function ($value, $key) use ($fieldsToIgnoreInCompletnessVerification) {
            return !in_array($key, $fieldsToIgnoreInCompletnessVerification);
        });

        $isProfileComplete = count($completenessArrToUse) === count(array_filter($completenessArrToUse));

        return $isProfileComplete;
    }

    public function checkProfileCompleteness(User $user, bool $autoPlaceForVerifcation = true)
    {
        $user->refresh();
        if (!$user->role === 'stylist') {
            throw new Exception('Only stylist can access this resource');
        }

        $profile_completeness = [
            'user_bio' => $user->bio !== null && $user->bio !== '',
            'address' => $user->country !== null && $user->country !== '',
            'location_service' => !!$user->location_service,
            'user_avatar' => $user->avatar !== null && $user->avatar !== '',
            'user_banner' => $user->stylist_profile?->banner !== null && $user->stylist_profile?->banner !== '',
            'social_links' => $user->stylist_profile?->socials && count($user->stylist_profile->socials) > 0,
            'works' => $user->stylist_profile?->works && count($user->stylist_profile->works) > 0,
            'portfolio' => $user->portfolios()->exists(),
            'payment_method' => $user->stylistPaymentMethods()->where('is_active', true)->exists(),
            'status_approved' => $user->stylist_profile?->status === 'approved',
            'subscription_status' => $user->subscription_status === 'active',
        ];

        $isProfileComplete = $this->isProfileComplete($profile_completeness);

        if ($isProfileComplete) {
            $stylistStatus = $user->stylist_profile?->status === 'unverified' ?? '';

            if (($stylistStatus === 'unverified') || (in_array($stylistStatus, ['unverified', 'rejected']) && $autoPlaceForVerifcation)) {
                $user->stylist_profile->update([
                    'is_available' => false,
                    'status' => 'pending',
                ]);

                defer(function () use ($user) {
                    $superAdmins = Admin::where('role', 'super-admin')
                        ->where('is_active', true)
                        ->get();

                    foreach ($superAdmins as $admin) {
                        AdminNotificationHelper::create(
                            $admin->id,
                            route('admin.users'),
                            'Stylist Business approval request for ' . $user->stylist_profile->business_name,
                            "Business Name: {$user->stylist_profile->business_name}\Stylist Name: " . $user->name . "\Stylist Email: {$user->email}",
                            'normal'
                        );
                    }
                });
            }
        }

        return $profile_completeness;
    }

    public function runRequirementManager(User $user, bool $autoPlaceForVerifcation = true)
    {
        $profile_completeness = $this->checkProfileCompleteness($user, $autoPlaceForVerifcation);

        $collection = collect($profile_completeness)->keys()->map(function (string $key) use ($profile_completeness) {
            return [
                'key' => $key,
                'value' => $profile_completeness[$key],
            ];
        });


        $nextRequirement = $collection->firstWhere('value', '===', false);
        $nextRequirement = $nextRequirement ? $nextRequirement['key'] : null;
        $nextRequirementPageName = '';


        switch ($nextRequirement) {
            case 'user_bio':
            case 'address': {
                $nextRequirementPageName = 'stylist.complete.skill';
                break;
            }

            case 'location_service': {
                $nextRequirementPageName = 'stylist.appointments.availability';
                break;
            }

            case 'user_avatar':
            case 'user_banner': {
                $nextRequirementPageName = 'stylist.profile';
                break;
            }

            case 'social_links':
            case 'works': {
                $nextRequirementPageName = 'stylist.verification';
                break;
            }

            case 'portfolio': {
                $nextRequirementPageName = 'stylist.work.create';
                break;
            }

            case 'payment_method': {
                $nextRequirementPageName = 'stylist.earnings.methods';
                break;
            }

            default: {
                $nextRequirementPageName = '';
            }
        }

        return [
            'completness' => $profile_completeness,
            'next_requirement' => $nextRequirement,
            'next_requirement_page_name' => $nextRequirementPageName
        ];
    }

    public function executeRequirementAction(array $requirementsResp, string $messagePrefix = '', bool $redirectToRequirement = true)
    {
        $nextRequirement = Arr::get($requirementsResp, 'next_requirement');
        $nextRequirementPageName = Arr::get($requirementsResp, 'next_requirement_page_name');

        if ($nextRequirement) {
            switch ($nextRequirement) {
                case 'user_bio': {
                    request()->session()->put('info', $messagePrefix . 'Kindly update your biography to continue.');
                    break;
                }

                case 'address': {
                    request()->session()->put('info', $messagePrefix . 'Kindly update your address to continue.');
                    break;
                }

                case 'location_service': {
                    request()->session()->put('info', $messagePrefix . 'Kindly update your blocation service');
                    break;
                }

                case 'user_avatar': {
                    request()->session()->put('info', $messagePrefix . 'Kindly update your profile picture / avatar');
                    break;
                }

                case 'user_banner': {
                    request()->session()->put('info', $messagePrefix . 'Kindly update your profile banner picture');
                    break;
                }

                case 'social_links': {
                    request()->session()->put('info', $messagePrefix . 'Kindly update your social media accounts');
                    break;
                }

                case 'works': {
                    request()->session()->put('info', $messagePrefix . 'Kindly upload images of your past works');
                    break;
                }

                case 'portfolio': {
                    request()->session()->put('info', $messagePrefix . 'Kindly add at least one (1) service you render');
                    break;
                }

                case 'payment_method': {
                    request()->session()->put('info', $messagePrefix . 'Kindly add at least one (1) payout method');
                    break;
                }

                default: {
                    request()->session()->forget('info');
                    //
                }
            }
        }


        if ($redirectToRequirement) {
            return redirect()->route($nextRequirementPageName ?: 'stylist.profile');
        }
    }


    public function profile(Request $request)
    {
        $user = $request->user();
        $user = $user->load(['stylist_profile']);
        $requirementsResp = $this->runRequirementManager($user, false);
        $profile_completeness = $requirementsResp['completness'];

        $profile_link = getSlug($user->id);
        $profile_link = url('/link/' . $profile_link);

        $respData = [
            'user' => $user,
            'portfolios' => $user->portfolios()->get(),
            'services' => Category::all()->pluck('name'),
            'statistics' => [
                'total_works' => $user->portfolios()->count(),
                'total_likes' => 0,
                'total_reviews' => $user->getTotalReviews(),
                'average_rating' => $user->getAverageRating(),
                'total_appointments' => $user->stylistAppointments()->count(),
                'total_earnings' => $request->user()->transactions()->where('type', 'earning')->where('status', 'completed')->sum('amount') ?? 0,
                'schedule_summary' => $user->getScheduleSummary(),
            ],
            'certifications' => $user->stylist_certifications()->get(),
            'profile_completeness' => $profile_completeness,
            'profile_link' => $profile_link,
        ];

        if ($request->expectsJson()) {
            return $respData;
        }

        if ($requirementsResp['next_requirement']) {
            $this->executeRequirementAction($requirementsResp, '', false);
        }

        return Inertia::render('Stylist/Profile/Index', $respData);
    }


    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $stylist = $user->stylist_profile;

        if (!$user || !$stylist) {
            abort(403, 'Access Denied');
        }

        /**
         * This means that social will be send as a JSON stringified array of object
         */
        if ($request->has('socials')) {
            // Replace the original string input with the new array
            $request->merge(['socials' => json_decode($request->input('socials'), true)]);
        }

        $request->validate([
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'phone' => ['sometimes', 'numeric', new PhoneNumber()],
            'gender' => 'sometimes|in:male,female,other',
            'years_of_experience' => 'sometimes|required|numeric|min:0|gt:0|max:50',
            'country' => 'sometimes|required|string|max:255',
            'bio' => 'nullable|sometimes|string|min:5',
            'business_name' => 'nullable|string|max:255',
            'socials' => 'sometimes|required|array|list',
            'socials.*.social_app' => 'required|string|max:255',
            'socials.*.url' => 'required|string|max:255',
            'media' => 'sometimes|required|array|max:10',
            'media.*' => [
                new UrlOrFile(
                    urlAndFileRules: [
                        'url' => [
                            'required',
                            'url',
                            'starts_with:' . URL::to('/storage')
                        ],
                        'file' => [
                            'required',
                            'file',
                            'mimes:jpg,jpeg,png,gif,webp',
                            'max:5120'
                        ]
                    ],
                    urlAndFileMessages: [
                        'url' => [
                            'required' => 'Media URL is required',
                            'url' => 'Media URL is invalid',
                            'starts_with' => 'Media URL is invalid'
                        ],
                        'file' => [
                            'required' => 'Media file is required',
                            'file' => 'Media file is invalid',
                            'mimes' => 'Media file must be a valid image',
                            'max' => 'Media file size must be less than 5MB',
                        ]
                    ]
                )
            ],
        ]);

        $user->update([
            // 'first_name' => $request->first_name,
            // 'last_name' => $request->last_name,
            // 'email' => $request->email,
            'phone' => $request->phone ?: $user->phone,
            'country' => $request->country ?: $user->country,
            'bio' => $request->bio ?: $user->bio,
            'gender' => $request->gender ?: $user->gender,
        ]);

        $socials = [];
        // Validate and clean each social entry
        foreach ($request->socials as $social) {
            if (empty($social['social_app']) || empty($social['url'])) {
                continue; // Skip empty entries
            }

            $socials[] = [
                'social_app' => trim($social['social_app']),
                'url' => trim($social['url']),
            ];
        }

        $existingWorkMediaList = $stylist->works ?? [];
        if (!is_array($existingWorkMediaList)) {
            $existingWorkMediaList = [];
        }

        $retainedWorkMediaList = $request->input('media') ?? [];
        if (!is_array($retainedWorkMediaList)) {
            $retainedWorkMediaList = [];
        }

        //Formatted retained file paths and select only paths that exists
        $retainedWorkMediaList = Arr::where(Arr::map($retainedWorkMediaList, function ($fileUrl): string {
            return formatStoredFilePath($fileUrl);
        }), fn(string $filePath): string => !!$filePath);

        $validWorkMedia = [];
        $removedWorkMedia = [];

        //Iterate through existing media and delete removed media and curate valid work media
        foreach ($existingWorkMediaList as $filePath) {
            $filePath = formatStoredFilePath($filePath);

            if ($filePath) {
                if (in_array($filePath, $retainedWorkMediaList)) {
                    $validWorkMedia[] = $filePath;
                } else {
                    $removedWorkMedia[] = $filePath;
                }
            }
        }

        foreach (($request->file('media') ?? []) as $file) {
            $validWorkMedia[] = $file->store('stylists/works', 'public');
        }

        $stylist->update([
            'business_name' => $request->business_name ?: $stylist->business_name,
            'years_of_experience' => $request->years_of_experience ?: $stylist->years_of_experience,
            'socials' => count($socials) ? $socials : null,
            'works' => count($validWorkMedia) ? $validWorkMedia : null,
        ]);

        $disk = Storage::disk('public');
        foreach ($removedWorkMedia as $mediaPath) {
            $disk->delete($mediaPath);
        }

        $this->checkProfileCompleteness($user);

        return response()->noContent();
    }


    public function certificationCreate(Request $request)
    {
        $user = $request->user();

        // Validate the certificate form data
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'skill' => 'required|string|max:255',
            'issuer' => 'required|string|max:255',
            'certification' => 'required|file|mimes:jpeg,png,jpg,pdf|max:5120', // 5MB max
            'description' => 'nullable|string|max:500',
        ]);

        try {
            // Handle file upload
            $certificateFile = null;
            if ($request->hasFile('certification')) {
                $file = $request->file('certification');
                $filename = time() . '_' . $file->getClientOriginalName();
                $certificateFile = $file->storeAs('certifications', $filename, 'public');
            }

            // Create the stylist certification
            $user->stylist_certifications()->create([
                'title' => $validated['title'],
                'skill' => $validated['skill'],
                'issuer' => $validated['issuer'],
                'certificate_file' => $certificateFile,
                'about' => $validated['description'] ?? null,
                'status' => 'pending', // Set initial status
            ]);

            return back()->with('success', 'Certificate added successfully and is pending approval.');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to save certificate. Please try again.']);
        }
    }

    public function avatarUpdate(Request $request)
    {
        $request->validate([
            'avatar' => ['required', 'image', 'max:2048'],
        ]);

        $user = $request->user();
        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }

            $user->avatar = $request->file('avatar')->store('avatars', 'public');
            $user->save();
        }

        $requirementsResp = $this->runRequirementManager($user);
        if ($request->expectsJson()) {
            return response()->noContent();
        }

        if ($requirementsResp['next_requirement']) {
            return $this->executeRequirementAction($requirementsResp, 'Avatar updated successfully. ', true);
        }

        return redirect()->back()->with('success', 'Avatar updated successfully.');
    }

    public function bannerUpdate(Request $request)
    {
        $request->validate([
            'avatar' => ['required', 'image', 'max:2048'],
        ]);

        $user = $request->user();
        $stylist_profile = $user->stylist_profile;

        if (!$user || !$stylist_profile) {
            abort(403, 'Access Denied');
        }
        if ($request->hasFile('avatar')) {
            if ($stylist_profile->banner) {
                Storage::disk('public')->delete($stylist_profile->banner);
            }

            $stylist_profile->banner = $request->file('avatar')->store('stylists/banners', 'public');
            $stylist_profile->save();
        }

        $requirementsResp = $this->runRequirementManager($user);
        if ($request->expectsJson()) {
            return response()->noContent();
        }

        if ($requirementsResp['next_requirement']) {
            return $this->executeRequirementAction($requirementsResp, 'Banner updated successfully. ', true);
        }

        return redirect()->back()->with('success', 'Banner updated successfully.');
    }

    public function verificationUpdate(Request $request)
    {
        $user = $request->user();
        $stylist = $user->stylist_profile;

        if (!$user || !$stylist) {
            abort(403, 'Access Denied');
        }

        if ($request->completeness == 9 && $request->status == 'false') {
            $stylist->update([
                'is_available' => false,
                'status' => 'pending',
            ]);
            return redirect()->back()->with('success', 'Verification request submitted successfully. Please wait for approval');
        }

        $socials = json_decode($request->input('socials'), true);

        // Replace the original string input with the new array
        $request->merge(['socials_array' => $socials]);

        $request->validate([
            'business_name' => 'nullable|string|max:255',
            'socials_array' => 'required|array',
            'socials_array.*.social_app' => 'required|string|max:255',
            'socials_array.*.url' => 'required|string|max:255',
            'media' => 'required|array|max:10',
            'media.*' => 'file|mimes:jpg,jpeg,png|max:5120',
        ], [
            'socials_array.required' => 'Please add at least one social media link.',
            'socials_array.array' => 'The social media links must be in a list format.',
            'socials_array.*.social_app.required' => 'The social media application name is required for all links.',
            'socials_array.*.url.required' => 'A valid social handle is required',
            'socials_array.*.url.string' => 'A valid social handle is required',
        ]);

        $socials = [];
        if ($request->socials) {
            $decodedSocials = json_decode($request->socials, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                return back()->withErrors(['socials' => 'Invalid social media data format.']);
            }

            // Validate and clean each social entry
            foreach ($decodedSocials as $social) {
                if (empty($social['social_app']) || empty($social['url'])) {
                    continue; // Skip empty entries
                }

                $socials[] = [
                    'social_app' => trim($social['social_app']),
                    'url' => trim($social['url']),
                ];
            }
        }

        $stylist->update([
            'business_name' => $request->business_name,
            'socials' => $socials,
        ]);

        $existing = $stylist->works ?? [];
        $newFiles = [];
        foreach ($request->file('media') as $file) {
            $newFiles[] = $file->store('stylists/works', 'public');
        }
        if (count($newFiles) > 0) {
            foreach ($existing as $oldFile) {
                if (Storage::disk('public')->exists($oldFile)) {
                    Storage::disk('public')->delete($oldFile);
                }
            }
            $stylist->works = array_slice($newFiles, 0, 10);
            $stylist->save();
        }

        $requirementsResp = $this->runRequirementManager($user);
        if ($requirementsResp['next_requirement']) {
            return $this->executeRequirementAction($requirementsResp, 'Social media handles and past works was updated successfully. ', true);
        }

        return redirect()->back()->with('success', 'Verification request updated successfully.');
    }

    public function getCurrentStylistStats(Request $request)
    {
        $user = $request->user();
        $resp = $this->getStylistStats($user);

        if ($request->expectsJson()) {
            return $resp;
        }

        return $resp;
    }

    private function getStylistAppointmentStatQueryBuilder(User $user)
    {
        return Appointment::query()
            ->selectRaw('COUNT(*) as count')
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month")
            ->where('stylist_id', $user->id)
            ->where('created_at', '>=', Carbon::now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month');
    }

    public function getStylistStats(User $user)
    {
        $user->load(['stylist_profile']);
        $stylist = $user->stylist_profile;

        $fetchedBookingTrends = $this->getStylistAppointmentStatQueryBuilder($user)->get();
        $fetchedConfirmedAppoitmentTrends = $this->getStylistAppointmentStatQueryBuilder($user)->whereIn('status', ['confirmed', 'completed'])->get();
        $fetchedCanceledAppointmentTrends = $this->getStylistAppointmentStatQueryBuilder($user)->where('status', 'canceled')->get();
        $fetchedCompletedAppointmentTrends = $this->getStylistAppointmentStatQueryBuilder($user)->where('status', 'completed')->get();
        $fetchedPremiumAppointmentTrends = $this
            ->getStylistAppointmentStatQueryBuilder($user)
            ->where('status', 'completed')
            ->where('amount', '>', 100) // Assuming premium appointments are above R100
            ->get();


        $months = collect(CarbonPeriod::create(now()->subMonths(value: 11)->startOfMonth(), '1 month', now())->map(fn(Carbon $date) => [
            'start_date' => $date->startOfMonth()->toISOString(),
            'end_date' => $date->endOfMonth()->toISOString(),
            'search' => $date->format('Y-m'),
        ]));

        $last12Months = $months->map(function ($month) use ($fetchedBookingTrends, $fetchedConfirmedAppoitmentTrends, $fetchedCanceledAppointmentTrends, $fetchedCompletedAppointmentTrends, $fetchedPremiumAppointmentTrends) {
            $startAndEndDateArr = Arr::only($month, ['start_date', 'end_date']);

            return array_merge($startAndEndDateArr, [
                'appointment_count' => (int) $fetchedBookingTrends->firstWhere('month', $month['search'])?->count ?? 0,
                'confirmed_appointment_count' => (int) $fetchedConfirmedAppoitmentTrends->firstWhere('month', $month['search'])?->count ?? 0,
                'canceled_appointment_count' => (int) $fetchedCanceledAppointmentTrends->firstWhere('month', $month['search'])?->count ?? 0,
                'completed_appointment_count' => (int) $fetchedCompletedAppointmentTrends->firstWhere('month', $month['search'])?->count ?? 0,
                'premium_appointment_count' => (int) $fetchedPremiumAppointmentTrends->firstWhere('month', $month['search'])?->count ?? 0
            ]);
        });

        $resp = [
            'total' => [
                'works' => (int) $user->portfolios()->count(),
                'likes' => (int) Like::where([
                    ['user_id', '=', $user->id],
                    ['type', '=', 'portfolio'],
                    ['status', '=', true]
                ])->count(),
                'appointments' => (int) $user->stylistAppointments()
                    ->where('status', 'confirmed')
                    ->count(),
                'earnings' => (float) $user->transactions()
                    ->where('type', 'earning')
                    ->where('status', 'completed')
                    ->sum('amount') ?? 0,
            ],
            'average_rating' => (float) $user->stylistAppointments()
                ->join('reviews', 'appointments.id', '=', 'reviews.appointment_id')
                ->whereNotNull('reviews.rating')
                ->avg('reviews.rating') ?? 0,
            'today' => [
                'earnings' => (int) $user->transactions()
                    ->whereBetween('created_at', getDateRanges('daily'))
                    ->where('type', 'earning')
                    ->where('status', 'completed')
                    ->sum('amount') ?? 0,
                'appointments' => (int) $user->stylistAppointments()
                    ->whereBetween('created_at', getDateRanges('daily'))
                    ->where('status', 'confirmed')
                    ->count(),
                'pending_appointments' => (int) $user->stylistAppointments()
                    ->whereBetween('created_at', getDateRanges('daily'))
                    ->where('status', 'pending')
                    ->count()
            ],
            'last_12_months' => $last12Months
        ];

        return $resp;
    }
}
