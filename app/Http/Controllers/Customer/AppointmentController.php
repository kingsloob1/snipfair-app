<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\AdminPaymentMethod;
use App\Models\Portfolio;
use App\Http\Controllers\CustomerApiController;
use App\Mail\DepositNotificationEmail;
use App\Models\Appointment;
use App\Models\AppointmentPouch;
use App\Models\Deposit;
use App\Models\Transaction;
use App\Models\WebsiteConfiguration;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class AppointmentController extends Controller
{
    private $customerApiController;

    public function __construct(CustomerApiController $customerApiController)
    {
        $this->customerApiController = $customerApiController;
    }

    public function getBookingStatus(Request $request, $portfolioId)
    {
        $customer = $request->user();
        $portfolio = Portfolio::findOrFail($portfolioId);

        $config = WebsiteConfiguration::first();
        $canRescheduleFree = null;
        $canCancelFree = null;
        $reschedulePenaltyPercentage = null;
        $cancelPenaltyPercentage = null;
        $hoursUntilAppointment = null;

        // Get existing appointment for this portfolio/stylist combination
        $appointment = null;
        if ($request->query('appointment')) {
            $appointment = Appointment::find($request->query('appointment'));
        }

        if (!$appointment) {
            $appointment = $customer->customerAppointments()
                ->where('portfolio_id', $portfolioId)
                ->where('stylist_id', $portfolio->user_id)
                ->latest()
                ->first();
        }

        // Check if there's a completed appointment with review
        $hasReview = false;
        if ($appointment && $appointment->status === 'completed') {
            $hasReview = $appointment->review()->exists();
        }

        if ($appointment) {
            $appointmentDateTime = \Carbon\Carbon::parse(
                $appointment->appointment_date . ' ' . $appointment->appointment_time
            );
            $hoursUntilAppointment = now()->diffInHours($appointmentDateTime, false);

            if ($hoursUntilAppointment >= $config->appointment_reschedule_threshold) {
                $canRescheduleFree = true;
            } else {
                $canRescheduleFree = false;
                $reschedulePenaltyPercentage = $config->appointment_reschedule_percentage;
            }

            if ($hoursUntilAppointment >= $config->appointment_canceling_threshold) {
                $canCancelFree = true;
            } else {
                $canCancelFree = false;
                $cancelPenaltyPercentage = $config->appointment_canceling_percentage;
            }
        }

        return response()->json([
            'success' => true,
            'user_balance' => $customer->balance ?? 0,
            'appointment' => $appointment ? [
                'id' => $appointment->id,
                'status' => $appointment->status,
                'appointment_code' => $appointment->appointment_code,
                'completion_code' => $appointment->completion_code,
                'amount' => $appointment->amount,
                'review' => $hasReview,
                'canRescheduleFree' => $canRescheduleFree,
                'reschedulePenaltyPercentage' => $reschedulePenaltyPercentage,
                'hoursUntilAppointment' => (int) $hoursUntilAppointment,
                'canCancelFree' => $canCancelFree,
                'cancelPenaltyPercentage' => $cancelPenaltyPercentage,
                'extra' => $appointment->extra ?? null,
                'appointment_date' => $appointment->appointment_date,
                'first_dispute' => $appointment->disputes()->exists() ? $appointment->disputes()->first() : null,
                'appointment_time' => Carbon::createFromFormat('H:i:s', $appointment->appointment_time)->format('g:i A'),
            ] : null,
        ]);
    }

    public function createAppointment(Request $request)
    {
        $appointmentResp = $this->customerApiController->bookAppointment($request);

        if (!($appointmentResp instanceof Appointment)) {
            return $appointmentResp;
        }

        return response()->json([
            'success' => true,
            'message' => 'Appointment created successfully',
            'appointment' => [
                'id' => $appointmentResp->id,
                'status' => $appointmentResp->status,
                'appointment_code' => $appointmentResp->appointment_code,
                'completion_code' => $appointmentResp->completion_code,
                'booking_id' => $appointmentResp->booking_id,
                'amount' => $appointmentResp->amount,
            ],
        ]);
    }

    public function processBookingPayment(Request $request)
    {
        $request->validate([
            'portfolio_id' => 'required|exists:portfolios,id',
            'amount' => 'required|numeric|min:0|gt:0',
            'payment_method_id' => 'required|exists:admin_payment_methods,id',
            'selected_date' => 'required|string',
            'selected_time' => 'required|string',
        ]);

        $customer = $request->user();

        $deposit = Deposit::create([
            'user_id' => $customer->id,
            'amount' => $request->amount,
            'portfolio_id' => $request->portfolio_id,
            'admin_payment_method_id' => $request->payment_method_id,
            'status' => 'pending',
        ]);
        $deposit->load('payment_method');
        Mail::to('admin@snipfair.com')->send(new DepositNotificationEmail(
            deposit: $deposit,
            user: $customer,
            recipientType: 'admin'
        ));
        Mail::to($customer->email)->send(new DepositNotificationEmail(
            deposit: $deposit,
            user: $customer,
            recipientType: 'customer'
        ));

        return back()->with('success', 'Your payment is being processed. You will be notified once it is confirmed.');
    }

    public function getDefaultAdminPaymentMethod(Request $request)
    {
        $defaultPaymentMethod = AdminPaymentMethod::where('is_default', true)
            ->where('is_active', true)
            ->first();

        if (!$defaultPaymentMethod) {
            return response()->json([
                'success' => false,
                'message' => 'No default payment method available',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'payment_method' => [
                'id' => $defaultPaymentMethod->id,
                'account_name' => $defaultPaymentMethod->account_name,
                'bank_name' => $defaultPaymentMethod->bank_name,
                'account_number' => $defaultPaymentMethod->account_number,
                'routing_number' => $defaultPaymentMethod->routing_number,
            ],
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'appointment_id' => 'required|exists:appointments,id',
            'verdict' => 'required|string|in:canceled,rescheduled',
        ]);

        $config = WebsiteConfiguration::first();
        $appointment = Appointment::findOrFail($request->appointment_id);
        if ($appointment && in_array($appointment->status, ['pending', 'approved', 'confirmed'])) {
            $appointmentDateTime = \Carbon\Carbon::parse(
                $appointment->appointment_date . ' ' . $appointment->appointment_time
            );
            $hoursUntilAppointment = now()->diffInHours($appointmentDateTime, false);

            if ($hoursUntilAppointment >= $config->appointment_reschedule_threshold) {
                $canRescheduleFree = true;
                $reschedulePenaltyPercentage = 0;
            } else {
                $canRescheduleFree = false;
                $reschedulePenaltyPercentage = $config->appointment_reschedule_percentage;
            }

            if ($hoursUntilAppointment >= $config->appointment_canceling_threshold) {
                $canCancelFree = true;
                $cancelPenaltyPercentage = 0;
            } else {
                $canCancelFree = false;
                $cancelPenaltyPercentage = $config->appointment_canceling_percentage;
            }

            if (($canCancelFree && $request->verdict === 'canceled') || ($canRescheduleFree && $request->verdict === 'rescheduled')) {
                $appointment->update(['status' => $request->verdict]);
                $request->user()->update([
                    'balance' => $request->user()->balance + $appointment->amount
                ]);
                if (in_array($appointment->status, ['approved', 'confirmed'])) {
                    $pouch = $appointment->pouch;
                    if ($pouch && $pouch->amount > 0)
                        $pouch->update(['status' => 'refunded']);
                }
                Transaction::create([
                    'user_id' => $request->user()->id,
                    'appointment_id' => $appointment->id,
                    'amount' => $appointment->amount,
                    'type' => 'refund',
                    'status' => 'completed',
                    'ref' => 'REF-' . time(),
                    'description' => 'Refund for appointment free cancellation/rescheduling',
                ]);
            } else {
                if ($request->verdict === 'rescheduled') {
                    $currentStatus = $appointment->status;
                    if (in_array($currentStatus, ['approved', 'confirmed'])) {
                        $pouch = $appointment->pouch;
                        if ($pouch && $pouch->amount > 0)
                            $pouch->update(['status' => 'refunded']);
                    }
                    $amount_to_stylist = $appointment->amount * ($reschedulePenaltyPercentage / 100) * (1 - getAdminConfig('commission_rate') / 100);
                    AppointmentPouch::create([
                        'appointment_id' => $appointment->id,
                        'amount' => $amount_to_stylist,
                        'status' => 'holding',
                        'user_id' => $appointment->stylist_id,
                    ]);
                    Transaction::create([
                        'user_id' => $appointment->stylist_id,
                        'appointment_id' => $appointment->id,
                        'amount' => $appointment->amount * ($reschedulePenaltyPercentage / 100) * (getAdminConfig('commission_rate') / 100),
                        'type' => 'other',
                        'status' => 'completed',
                        'ref' => 'AdminCommission-rescheduling-' . time(),
                        'description' => 'Commission for rescheduling',
                    ]);
                    $request->user()->update([
                        'balance' => $request->user()->balance + ($appointment->amount * (1 - ($reschedulePenaltyPercentage / 100)))
                    ]);
                    $appointment->update(['status' => $request->verdict]);
                    Transaction::create([
                        'user_id' => $request->user()->id,
                        'appointment_id' => $appointment->id,
                        'amount' => $appointment->amount * (1 - ($reschedulePenaltyPercentage / 100)),
                        'type' => 'refund',
                        'status' => 'completed',
                        'ref' => 'RSC-' . time(),
                        'description' => 'Refund for rescheduling',
                    ]);
                } else {
                    $currentStatus = $appointment->status;
                    if (in_array($currentStatus, ['approved', 'confirmed'])) {
                        $pouch = $appointment->pouch;
                        if ($pouch && $pouch->amount > 0)
                            $pouch->update(['status' => 'refunded']);
                    }
                    $amount_to_stylist = $appointment->amount * ($cancelPenaltyPercentage / 100) * (1 - getAdminConfig('commission_rate') / 100);
                    AppointmentPouch::create([
                        'appointment_id' => $appointment->id,
                        'amount' => $amount_to_stylist,
                        'status' => 'holding',
                        'user_id' => $appointment->stylist_id,
                    ]);
                    Transaction::create([
                        'user_id' => $appointment->stylist_id,
                        'appointment_id' => $appointment->id,
                        'amount' => $appointment->amount * ($cancelPenaltyPercentage / 100) * (getAdminConfig('commission_rate') / 100),
                        'type' => 'other',
                        'status' => 'completed',
                        'ref' => 'AdminCommission-free' . time(),
                        'description' => 'Commission for cancellation',
                    ]);
                    $request->user()->update([
                        'balance' => $request->user()->balance + ($appointment->amount * (1 - ($cancelPenaltyPercentage / 100)))
                    ]);
                    $appointment->update(['status' => 'canceled']);
                    Transaction::create([
                        'user_id' => $request->user()->id,
                        'appointment_id' => $appointment->id,
                        'amount' => $appointment->amount * (1 - ($cancelPenaltyPercentage / 100)),
                        'type' => 'refund',
                        'status' => 'completed',
                        'ref' => 'RSC-' . time(),
                        'description' => 'Refund for cancellation',
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Appointment {$request->verdict} successfully",
            ]);
        }
    }

    public function updateAppointmentStatuses(Request $request)
    {
        $customer = $request->user();
        $updated = 0;

        // // Update processing appointments to pending after 2 minutes
        // $processingAppointments = $customer->customerAppointments()
        //     ->where('status', 'processing')
        //     ->where('created_at', '<=', Carbon::now()->subMinutes(2))
        //     ->get();

        // foreach ($processingAppointments as $appointment) {
        //     $appointment->update(['status' => 'pending']);
        //     $updated++;
        // }

        // // Update pending appointments to approved after 3 minutes
        // $pendingAppointments = $customer->customerAppointments()
        //     ->where('status', 'pending')
        //     ->where('updated_at', '<=', Carbon::now()->subMinutes(3))
        //     ->get();

        // foreach ($pendingAppointments as $appointment) {
        //     $appointment->update(['status' => 'approved']);
        //     $updated++;
        // }

        // Update approved appointments to confirmed after 2 minutes
        // $approvedAppointments = $customer->customerAppointments()
        //     ->where('status', 'approved')
        //     ->where('updated_at', '<=', Carbon::now()->subMinutes(2))
        //     ->get();

        // foreach ($approvedAppointments as $appointment) {
        //     $appointment->update(['status' => 'confirmed']);
        //     $updated++;
        // }

        return response()->json([
            'success' => true,
            'updated_count' => $updated,
            'message' => "Updated {$updated} appointments",
        ]);
    }
}
