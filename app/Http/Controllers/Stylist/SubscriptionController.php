<?php

namespace App\Http\Controllers\Stylist;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Transaction;
use App\Models\Payment;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class SubscriptionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Get paid plans only (exclude free plans)
        $plans = Plan::where('status', 1)
            // ->where('amount', '>', 0)
            ->get();

        // Get current subscription details
        $currentSubscription = $user->subscriptions()
            ->with('plan')
            ->where('expiry', '>', Carbon::now())
            ->latest('created_at')
            ->first();

        // Set user plan and subscription status
        $user->plan = $currentSubscription ? $currentSubscription->plan->name : null;
        $user->subscription_status = $user->subscription_status;
        $user->subscription_expiry = $currentSubscription ? $currentSubscription->expiry->toISOString() : null;

        return Inertia::render('Stylist/Payments/Subscription', [
            'plans' => $plans,
        ]);
    }

    public function processSubscriptionPayment(Request $request)
    {
        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'amount' => 'required|numeric|min:0|gt:0',
            'payment_method_id' => 'required|exists:admin_payment_methods,id',
        ]);

        $user = $request->user();
        $plan = Plan::findOrFail($validated['plan_id']);

        try {
            // Generate unique reference
            $reference = 'SNPSUB-' . time();

            if($plan->name !== 'Free Plan' && $validated['amount'] > 0) {
                // Create transaction with pending status
                $transaction = Transaction::create([
                    'user_id' => $user->id,
                    'appointment_id' => null, // No appointment for subscription
                    'amount' => $validated['amount'],
                    'type' => 'subscription',
                    'status' => 'pending',
                    'ref' => $reference,
                    'description' => "Subscription payment for {$plan->name}",
                ]);

                // For demo purposes, we'll automatically approve the transaction
                // In a real application, this would be handled by payment gateway webhooks
                // $transaction->update(['status' => 'completed']);
            }

            $payment = Payment::create([
                'plan_id' => $plan->id,
                'user_id' => $user->id,
                'status' => $plan->name !== 'Free Plan' && $validated['amount'] > 0 ? 'pending' : 'approved',
            ]);

            // Calculate expiry date
            if($plan->name === 'Free Plan' && $validated['amount'] <= 0){
                // $expiryDate = Carbon::now()->addDays((int) $plan->duration);
                $expiryDate = Carbon::now()->addYears((int) $plan->duration);

                // Create or update subscription
                Subscription::create([
                    'plan_id' => $plan->id,
                    'payment_id' => $payment->id,
                    'user_id' => $user->id,
                    'expiry' => $expiryDate,
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Subscription processing successfully!',
                'transaction_id' => $transaction->id ?? 'free',
                'reference' => $reference,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to process subscription payment: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function updateAvailability(Request $request)
    {
        $request->validate([
            'availability' => 'required|boolean',
        ]);
        $user = $request->user();
        $stylist = $user->stylist_profile;

        if (!$stylist) {
            return response()->json([
                'success' => false,
                'message' => 'Stylist profile not found.',
            ], 404);
        }

        $stylist->is_available = $request->availability;
        $stylist->save();

        return response()->json([
            'success' => true,
            'message' => 'Availability updated successfully.',
        ]);
    }

    public function getVerification(Request $request)
    {
        $user = $request->user();
        $user = $user->load(['stylist_profile']);
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
        return Inertia::render('Stylist/Verification/Index', [
            'user' => $user,
            'portfolios' => $user->portfolios()->get(),
            'profile_completeness' => $profile_completeness,
        ]);
    }

}
