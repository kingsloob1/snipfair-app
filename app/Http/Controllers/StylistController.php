<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\Portfolio;
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
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use App\Mail\WelcomeEmail;
use Illuminate\Support\Facades\Mail;

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
            'identification_file.*' => 'mimes:jpeg,png,gif,pdf,docx|max:5120',
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
            'email' => 'required|email|unique:users,email,' . $user->id,
            'years_of_experience' => 'required|numeric|min:0|gt:0|max:50',
            'business_name' => 'nullable|sometimes|string|max:255',
            'phone' => 'nullable|sometimes|string|max:20',
            'country' => 'required|string|max:255',
            'bio' => 'nullable|sometimes|string|min:25',
        ]);

        $user->update([
            // 'first_name' => $request->first_name,
            // 'last_name' => $request->last_name,
            // 'email' => $request->email,
            'phone' => $request->phone,
            'country' => $request->country,
            'bio' => $request->bio,
        ]);

        $stylist->update([
            'years_of_experience' => $request->years_of_experience,
            'business_name' => $request->business_name,
        ]);
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

        $existing = $work->media_urls ?? [];
        $newFiles = [];

        foreach ($request->file('media') as $file) {
            $newFiles[] = $file->store('works/media', 'public');
        }

        $combined = array_slice([...$existing, ...$newFiles], 0, 10);
        $work->media_urls = $combined;
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

        $media = $work->media_urls ?? [];
        $media = array_filter($media, fn($url) => $url !== $request->path);

        Storage::disk('public')->delete($request->path);
        $work->media_urls = array_values($media);
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

        $work->delete();

        return back()->with('success', 'Work removed.');
    }

    public function checkProfileCompleteness(User $user)
    {
        if (!$user->role === 'stylist') {
            throw new Exception('Only stylist can access this resource');
        }

        $profile_completeness = [
            'portfolio' => $user->portfolios()->exists(),
            'payment_method' => $user->stylistPaymentMethods()->where('is_active', true)->exists(),
            'status_approved' => $user->stylist_profile?->status === 'approved',
            'location_service' => $user->location_service,
            'address' => $user->country !== null && $user->country !== '',
            'subscription_status' => $user->subscription_status === 'active',
            'social_links' => $user->stylist_profile?->socials && count($user->stylist_profile->socials) > 0,
            'works' => $user->stylist_profile?->works && count($user->stylist_profile->works) > 0,
            'user_avatar' => $user->avatar !== null && $user->avatar !== '',
            'user_bio' => $user->bio !== null && $user->bio !== '',
            'user_banner' => $user->stylist_profile?->banner !== null && $user->stylist_profile?->banner !== '',
        ];

        $isProfileComplete = count($profile_completeness) === count(array_filter($profile_completeness));

        if ($isProfileComplete) {
            if ($user->stylist_profile?->status === 'unverified') {
                $user->stylist_profile->update([
                    'is_available' => false,
                    'status' => 'pending',
                ]);
            }
        } else if ($user->stylist_profile && in_array($user->stylist_profile?->status, ['approved', 'pending', 'rejected'])) {
            $user->stylist_profile->update([
                'is_available' => false,
                'status' => 'unverified',
            ]);
        }

        return $profile_completeness;
    }

    public function profile(Request $request)
    {
        $user = $request->user();
        $user = $user->load(['stylist_profile']);
        $profile_completeness = $this->checkProfileCompleteness($user);

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
            'business_name' => 'nullable|string|max:255',
            'socials' => 'sometimes|required|array|list',
            'socials.*.social_app' => 'required|string|max:255',
            'socials.*.url' => 'required|url|max:255',
            'media' => 'sometimes|required|array|list|max:10',
            'media.*' => [
                new UrlOrFile(
                    urlAndFileRules: [
                        'url' => ['required', 'url'],
                        'file' => [
                            'required',
                            'file',
                            'mimes:jpg,jpeg,png',
                            'max:5120'
                        ]
                    ],
                    urlAndFileMessages: [
                        'url' => [
                            'required' => 'Media URL is required',
                            'url' => 'Media URL is invalid'
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

        $uploadedWorks = array_slice($request->file('media') ?? [], 0, 10);

        foreach ($uploadedWorks as $key => $file) {
            $uploadedWorks[$key] = $file->store('stylists/works', 'public');
        }

        if (count($uploadedWorks) > 0) {
            $existingWorkMedia = $stylist->works ?? [];
            foreach ($existingWorkMedia as $oldFile) {
                if (Storage::disk('public')->exists($oldFile)) {
                    Storage::disk('public')->delete($oldFile);
                }
            }
        }


        $stylist->update([
            'business_name' => $request->business_name || $stylist->business_name,
            'socials' => count($socials) ? $socials : null,
            'works' => count($uploadedWorks) ? $uploadedWorks : null,
            'is_available' => false,
            'status' => 'unverified',
        ]);

        $user->refresh();
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

        if ($request->expectsJson()) {
            return response()->noContent();
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

        if ($request->expectsJson()) {
            return response()->noContent();
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
            'socials_array.*.url' => 'required|url|max:255',
            'media' => 'required|array|max:10',
            'media.*' => 'file|mimes:jpg,jpeg,png|max:5120',
        ], [
            'socials_array.required' => 'Please add at least one social media link.',
            'socials_array.array' => 'The social media links must be in a list format.',
            'socials_array.*.social_app.required' => 'The social media application name is required for all links.',
            'socials_array.*.url.required' => 'A URL is required for each social media link.',
            'socials_array.*.url.url' => 'The URL for a social media link is not a valid format.',
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
            'is_available' => false,
            'status' => 'unverified',
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

        return redirect()->back()->with('success', 'Verification request updated successfully.');
    }
}
