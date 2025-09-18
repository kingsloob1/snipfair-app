<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminPaymentMethod;
use App\Models\Appointment;
use App\Models\Category;
use App\Models\Plan;
use App\Models\Review;
use App\Models\User;
use App\Models\WebsiteConfiguration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        $admin = Auth::guard('admin')->user();
        $settings = WebsiteConfiguration::first();
        $plans = Plan::all();
        $payment_methods = AdminPaymentMethod::all();
        $categories = Category::all();
        $categories = $categories->map(function ($category) {
            $category->image_url = $category->banner ? asset('storage/' . $category->banner) : null;
            return $category;
        });
        // $ip = $request->ip();
        // dd($ip);

        return Inertia::render('Admin/Settings/Index', [
            'auth' => $admin,
            'settings' => $settings,
            'plans' => $plans,
            'payment_methods' => $payment_methods,
            'categories' => $categories,
        ]);
    }

    public function updatePassword(Request $request)
    {
        $admin = Auth::guard('admin')->user();
        $validated = $request->validate([
            'current_password' => ['required', function ($attribute, $value, $fail) use ($admin) {
                if (!Hash::check($value, $admin->password)) {
                    $fail('The current password is incorrect.');
                }
            }],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);
        $admin->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'Password updated successfully.');
    }

    public function update(Request $request)
    {
        $admin = Auth::guard('admin')->user();
        $config = WebsiteConfiguration::first();

        if (!$config || !$admin) {
            return back()->with('error', 'Configuration not found.');
        }

        $fields = [
            'email_verification' => 'boolean',
            'two_factor_auth' => 'boolean',
            'min_booking_amount' => 'numeric|min:0|gt:0',
            'max_booking_amount' => 'numeric|min:0|gt:0',
            'allow_registration_stylists' => 'boolean',
            'allow_registration_customers' => 'boolean',
            'maintenance_mode' => 'boolean',
            'maintenance_message' => 'nullable|string',
            'email_notifications' => 'boolean',
            'push_notifications' => 'boolean',
            'system_alerts' => 'boolean',
            'payment_alerts' => 'boolean',
            'content_moderation' => 'boolean',
            'appointment_reschedule_threshold' => 'integer|min:0|gt:0',
            'appointment_reschedule_percentage' => 'numeric|min:0|gt:0|max:100',
            'appointment_canceling_threshold' => 'integer|min:0|gt:0',
            'appointment_canceling_percentage' => 'numeric|min:0|gt:0|max:100',
            'professional_stylists' => 'integer|min:0|gt:0',
            'happy_customers' => 'integer|min:0|gt:0',
            'services_completed' => 'integer|min:0|gt:0',
            'customer_satisfaction' => 'numeric|min:0|gt:0|max:100',
        ];

        // Extract only the fields present in the request
        $rules = array_intersect_key($fields, $request->all());

        if (empty($rules)) {
            return back()->withErrors(['settings' => 'No valid fields provided.']);
        }

        $validated = $request->validate($rules);

        // Apply updates only for fields present
        $config->fill($validated);
        $config->updated_by = $admin->id;
        $config->save();

        return back()->with('success', 'Settings updated successfully.');
    }

    public function updatePolicy(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:terms,privacy_policy,cookies',
            'content' => 'required|string',
        ]);

        $config = WebsiteConfiguration::first();

        if (!$config) {
            return back()->with('error', 'Configuration not found.');
        }

        // Update the appropriate field
        $field = $validated['type'];
        $config->$field = $validated['content'];
        $config->save();

        return back()->with('success', ucfirst(str_replace('_', ' ', $field)) . ' saved successfully.');
    }

    public function calculateStatistics()
    {
        $admin = Auth::guard('admin')->user();
        $config = WebsiteConfiguration::first();

        if (!$config || !$admin) {
            return back()->with('error', 'Configuration not found.');
        }

        // Calculate statistics
        $professional_stylists = User::where('role', 'stylist')
            ->whereHas('stylist_profile')
            ->count();

        $happy_customers = User::where('role', 'customer')->count();

        $services_completed = Appointment::where('status', 'completed')->count();

        $averageRating = Review::avg('rating') ?? 0;
        $customer_satisfaction = round(($averageRating / 5) * 100, 2);

        // Update configuration
        $config->update([
            'professional_stylists' => $professional_stylists,
            'happy_customers' => $happy_customers,
            'services_completed' => $services_completed,
            'customer_satisfaction' => $customer_satisfaction,
            'updated_by' => $admin->id,
        ]);

        return to_route('admin.admin-dashboard')->with('success', 'Statistics calculated and updated successfully.');
    }

}
