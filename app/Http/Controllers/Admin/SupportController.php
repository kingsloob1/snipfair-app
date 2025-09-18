<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminPaymentMethod;
use App\Models\Category;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class SupportController extends Controller
{
    public function index(Request $request)
    {
        $admin = Auth::guard('admin')->user();

        return Inertia::render('Admin/Account/Tickets/Support', [
            'auth' => $admin,
        ]);
    }

    public function planStore(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:plans,name',
            'price' => 'required|numeric|min:0|gt:0',
            'duration' => 'required|integer|min:1',
            'status' => 'boolean'
        ]);

        Plan::create([
            'name' => $validated['name'],
            'price' => $validated['price'],
            'duration' => $validated['duration'],
            'status' => $validated['status'] ?? true,
        ]);

        return back()->with('success', 'Plan created successfully.');
    }

    public function planUpdate(Request $request, Plan $plan)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:plans,name,' . $plan->id,
            'price' => 'required|numeric|min:0|gt:0',
            'duration' => 'required|integer|min:1',
            'status' => 'boolean'
        ]);

        $plan->update([
            'name' => $validated['name'],
            'price' => $validated['price'],
            'duration' => $validated['duration'],
            'status' => $validated['status'] ?? true,
        ]);

        return back()->with('success', 'Plan updated successfully.');
    }

    public function planDestroy(Plan $plan)
    {
        // Check if plan is being used by any subscriptions
        if ($plan->subscriptions()->exists()) {
            return back()->with('error', 'Cannot delete plan that has active subscriptions.');
        }

        $plan->delete();

        return back()->with('success', 'Plan deleted successfully.');
    }

    public function planToggle(Request $request, Plan $plan)
    {
        $validated = $request->validate([
            'status' => 'required|boolean'
        ]);

        $plan->update([
            'status' => $validated['status']
        ]);

        return back()->with('success', 'Plan status updated successfully.');
    }

    public function categoryStore(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'description' => 'required|string|max:1000',
            'status' => 'boolean',
            'banner' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $bannerPath = null;
        if ($request->hasFile('banner')) {
            $bannerPath = $request->file('banner')->store('category', 'public');
        }

        Category::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'status' => $validated['status'] ?? true,
            'banner' => $bannerPath,
        ]);

        return back()->with('success', 'Category created successfully.');
    }

    public function categoryUpdate(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
            'description' => 'required|string|max:1000',
            'status' => 'boolean',
            'banner' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);
        $bannerPath = $category->banner;

        if ($request->hasFile('banner')) {
            // Delete old banner if exists
            if ($category->banner && Storage::disk('public')->exists($category->banner)) {
                Storage::disk('public')->delete($category->banner);
            }

            $bannerPath = $request->file('banner')->store('category', 'public');
        }

        $category->update([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'status' => $validated['status'] ?? true,
            'banner' => $bannerPath,
        ]);

        return back()->with('success', 'Category updated successfully.');
    }

    public function categoryDestroy(Category $category)
    {
        if ($category->portfolios()->exists()) {
            return back()->with('error', 'Cannot delete category that contains portfolios.');
        }

        if ($category->banner && Storage::disk('public')->exists($category->banner)) {
            Storage::disk('public')->delete($category->banner);
        }

        $category->delete();

        return back()->with('success', 'Category deleted successfully.');
    }

    public function categoryToggle(Request $request, Category $category)
    {
        $validated = $request->validate([
            'status' => 'required|boolean'
        ]);

        $category->update([
            'status' => $validated['status']
        ]);

        return back()->with('success', 'Category status updated successfully.');
    }

    public function paymentStore(Request $request)
    {
        $admin = Auth::guard('admin')->user();
        $validated = $request->validate([
            'account_number' => 'required|string|max:50|unique:admin_payment_methods,account_number',
            'account_name' => 'required|string|max:255',
            'bank_name' => 'required|string|max:255',
            'routing_number' => 'required|string|max:50',
            'is_default' => 'boolean',
            'is_active' => 'boolean'
        ]);

        DB::transaction(function () use ($validated, $admin) {
            if ($validated['is_default'] ?? false) {
                AdminPaymentMethod::where('is_default', true)->update(['is_default' => false]);
            }

            AdminPaymentMethod::create([
                'account_number' => $validated['account_number'],
                'account_name' => $validated['account_name'],
                'bank_name' => $validated['bank_name'],
                'routing_number' => $validated['routing_number'],
                'is_default' => $validated['is_default'] ?? false,
                'is_active' => $validated['is_active'] ?? true,
                'updated_by' => $admin->id,
            ]);
        });

        return back()->with('success', 'Payment method created successfully.');
    }

    public function paymentUpdate(Request $request, AdminPaymentMethod $paymentMethod)
    {
        $admin = Auth::guard('admin')->user();
        $validated = $request->validate([
            'account_number' => 'required|string|max:50|unique:admin_payment_methods,account_number,' . $paymentMethod->id,
            'account_name' => 'required|string|max:255',
            'bank_name' => 'required|string|max:255',
            'routing_number' => 'required|string|max:50',
            'is_default' => 'boolean',
            'is_active' => 'boolean'
        ]);

        DB::transaction(function () use ($validated, $paymentMethod, $admin) {
            if ($validated['is_default'] ?? false) {
                AdminPaymentMethod::where('id', '!=', $paymentMethod->id)
                    ->where('is_default', true)
                    ->update(['is_default' => false]);
            }

            $paymentMethod->update([
                'account_number' => $validated['account_number'],
                'account_name' => $validated['account_name'],
                'bank_name' => $validated['bank_name'],
                'routing_number' => $validated['routing_number'],
                'is_default' => $validated['is_default'] ?? false,
                'is_active' => $validated['is_active'] ?? true,
                'updated_by' => $admin->id,
            ]);
        });

        return back()->with('success', 'Payment method updated successfully.');
    }

    public function paymentDestroy(AdminPaymentMethod $paymentMethod)
    {
        if ($paymentMethod->is_default) {
            $otherActiveMethod = AdminPaymentMethod::where('id', '!=', $paymentMethod->id)
                ->where('is_active', true)
                ->first();

            if ($otherActiveMethod) {
                $otherActiveMethod->update(['is_default' => true]);
            }
        }

        $paymentMethod->delete();

        return back()->with('success', 'Payment method deleted successfully.');
    }

    public function paymentToggleActive(Request $request, AdminPaymentMethod $paymentMethod)
    {
        $admin = Auth::guard('admin')->user();
        $validated = $request->validate([
            'is_active' => 'required|boolean'
        ]);

        if (!$validated['is_active'] && $paymentMethod->is_default) {
            $otherActiveMethod = AdminPaymentMethod::where('id', '!=', $paymentMethod->id)
                ->where('is_active', true)
                ->first();

            if ($otherActiveMethod) {
                $otherActiveMethod->update(['is_default' => true]);
            }

            $paymentMethod->update([
                'is_active' => false,
                'is_default' => false,
                'updated_by' => $admin->id,
            ]);
        } else {
            $paymentMethod->update([
                'is_active' => $validated['is_active'],
                'updated_by' => $admin->id,
            ]);
        }

        return back()->with('success', 'Payment method status updated successfully.');
    }

    public function paymentToggleDefault(Request $request, AdminPaymentMethod $paymentMethod)
    {
        $admin = Auth::guard('admin')->user();
        $validated = $request->validate([
            'is_default' => 'required|boolean'
        ]);

        if ($validated['is_default'] && !$paymentMethod->is_active) {
            return back()->with('error', 'Cannot set inactive payment method as default.');
        }

        DB::transaction(function () use ($validated, $paymentMethod, $admin) {
            if ($validated['is_default']) {
                AdminPaymentMethod::where('id', '!=', $paymentMethod->id)
                    ->where('is_default', true)
                    ->update(['is_default' => false]);

                $paymentMethod->update([
                    'is_default' => true,
                    'updated_by' => $admin->id,
                ]);
            } else {
                $otherActiveMethod = AdminPaymentMethod::where('id', '!=', $paymentMethod->id)
                    ->where('is_active', true)
                    ->first();

                if ($otherActiveMethod) {
                    $otherActiveMethod->update(['is_default' => true]);
                }

                $paymentMethod->update([
                    'is_default' => false,
                    'updated_by' => $admin->id,
                ]);
            }
        });

        return back()->with('success', 'Default payment method updated successfully.');
    }


}
