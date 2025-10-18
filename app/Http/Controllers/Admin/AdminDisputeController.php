<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\AppointmentDisputeEmail;
use App\Mail\AppointmentDisputeResolutionEmail;
use App\Models\AppointmentDispute;
use App\Models\AppointmentDisputeMessage;
use App\Models\Admin;
use App\Models\Appointment;
use App\Models\AppointmentPouch;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AdminDisputeController extends Controller
{
    /**
     * Display a listing of disputes for admin management.
     */
    public function index(Request $request)
    {
        $admin = Auth::guard('admin')->user();
        $query = AppointmentDispute::with([
            'appointment',
            'appointment.portfolio',
            'customer',
            'stylist',
            'messages' => function ($query) {
                $query->latest()->limit(1);
            }
        ]);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by priority
        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('comment', 'like', "%{$search}%")
                    ->orWhere('ref_id', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($q) use ($search) {
                        $q->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('stylist', function ($q) use ($search) {
                        $q->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        $disputes = $query->orderBy('created_at', 'desc')->paginate(15);

        // Get metrics for dashboard
        $metrics = [
            'total' => AppointmentDispute::count(),
            'open' => AppointmentDispute::where('status', 'open')->count(),
            'in_progress' => AppointmentDispute::where('status', 'in_progress')->count(),
            'resolved' => AppointmentDispute::where('status', 'resolved')->count(),
            'closed' => AppointmentDispute::where('status', 'closed')->count(),
        ];

        return Inertia::render('Admin/Disputes/Index', [
            'auth' => $admin,
            'disputes' => $disputes,
            'metrics' => $metrics,
            'filters' => $request->only(['status', 'priority', 'search']),
        ]);
    }

    /**
     * Display the specified dispute for admin management.
     */
    public function show(AppointmentDispute $dispute)
    {
        $admin = Auth::guard('admin')->user();

        // Load dispute with all related data
        $dispute->load([
            'appointment',
            'appointment.portfolio',
            'customer',
            'stylist',
            // 'messages' => function ($query) {
            //     $query->with('sender')->orderBy('created_at', 'asc');
            // }
            'adminCustomerMessages',
            'adminStylistMessages'
        ]);

        return Inertia::render('Admin/Disputes/Show', [
            'auth' => $admin,
            'dispute' => $dispute,
        ]);
    }

    /**
     * Update the dispute status.
     */
    public function updateStatus(Request $request, AppointmentDispute $dispute)
    {
        $request->validate([
            'status' => 'required|in:open,in_progress,resolved,closed',
        ]);

        $oldStatus = $dispute->status;
        $newStatus = $request->status;

        $dispute->update([
            'status' => $newStatus,
        ]);

        // If status changed to in_progress from open, notify the other party
        if ($oldStatus === 'open' && $newStatus === 'in_progress') {
            $this->notifyOtherParty($dispute);
        }

        // If dispute is being resolved, handle the resolution
        if ($newStatus === 'resolved') {
            $this->handleResolution($request, $dispute);
        } else {
            return response()->json([
                'success' => true,
                'message' => 'Dispute status updated successfully.',
            ]);
        }
    }

    /**
     * Store a new admin message in the dispute.
     */
    public function storeMessage(Request $request, AppointmentDispute $dispute)
    {
        $request->validate([
            'conversation_type' => 'required|in:admin_customer,admin_stylist',
            'message' => 'required|string|max:1000',
            'attachments' => 'nullable|array|max:5',
            'attachments.*' => 'file|mimes:jpg,jpeg,png,pdf,doc,docx|max:10240',
        ]);

        $attachments = [];

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('dispute-attachments', 'public');
                $attachments[] = [
                    'name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'url' => Storage::url($path),
                    'size' => $file->getSize(),
                    'type' => $file->getMimeType(),
                ];
            }
        }

        $message = AppointmentDisputeMessage::create([
            'appointment_dispute_id' => $dispute->id,
            'conversation_type' => $request->conversation_type,
            'sender_type' => Admin::class,
            'sender_id' => Auth::guard('admin')->id(),
            'message' => $request->message,
            'attachments' => !empty($attachments) ? $attachments : null,
        ]);

        sendNotification(
            $request->conversation_type === 'admin_customer' ? $dispute->customer_id : $dispute->stylist_id,
            route('disputes.show', $dispute->id),
            'Message from Admin',
            $request->message,
            'normal'
        );

        // Update dispute's updated_at timestamp
        $dispute->touch();

        $message->load('sender');

        return response()->json([
            'message' => $message,
            'success' => true,
        ]);
    }

    /**
     * Update dispute priority.
     */
    public function updatePriority(Request $request, AppointmentDispute $dispute)
    {
        $request->validate([
            'priority' => 'required|in:low,medium,high,risky',
        ]);

        $dispute->update([
            'priority' => $request->priority,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Dispute priority updated successfully.',
        ]);
    }

    /**
     * Handle dispute resolution logic.
     */
    private function handleResolution(Request $request, AppointmentDispute $dispute)
    {
        $request->validate([
            'resolutionType' => 'required|in:refund_customer,split_refund,complete_for_stylist,no_action',
            'refundAmount' => 'nullable|numeric|min:0',
            'stylistAmount' => 'nullable|numeric|min:0',
            'resolutionComment' => 'nullable|string|max:1000',
        ]);

        $appointment = $dispute->appointment;
        $refundAmount = 0;

        if ($request->refundAmount > $appointment->amount) {
            return back()->with('error', 'Refund amount exceeds appointment amount.');
        }

        // Update dispute with resolution details
        $dispute->update([
            'resolution_type' => $request->resolutionType,
            'resolution_amount' => $request->refundAmount,
            'resolution_comment' => $request->resolutionComment,
            'resolved_at' => now(),
            'resolved_by' => Auth::guard('admin')->id(),
        ]);

        // Generate resolution messages based on resolution type
        $customerResolution = '';
        $stylistResolution = '';
        $adminComment = $request->resolutionComment ? trim($request->resolutionComment) . ' ' : '';

        switch ($request->resolutionType) {
            case 'refund_customer':
                // Logic to process refund to customer
                $this->processCustomerRefund($appointment, $request->refundAmount);

                $refundAmount = $request->refundAmount ?? $appointment->amount;
                if ($refundAmount == $appointment->amount) {
                    $customerResolution = $adminComment . "After careful review of your dispute, we have determined that a full refund of R" . number_format($refundAmount, 2) . " is appropriate. The refund has been processed and will be reflected in your account within 1-2 business days.";
                    $stylistResolution = $adminComment . "After careful review of the dispute for appointment #" . $appointment->booking_id . ", we have determined that a full refund of R" . number_format($refundAmount, 2) . " should be issued to the customer. This decision means no payment will be released for this appointment.";
                } else {
                    $customerResolution = $adminComment . "After careful review of your dispute, we have determined that a partial refund of R" . number_format($refundAmount, 2) . " is appropriate. The refund has been processed and will be reflected in your account within 1-2 business days.";
                    $stylistResolution = $adminComment . "After careful review of the dispute for appointment #" . $appointment->id . ", we have determined that a partial refund of R" . number_format($refundAmount, 2) . " should be issued to the customer. This decision means no payment will be released for this appointment.";
                }
                break;

            case 'split_refund':
                // Logic to process split refund
                $this->processSplitRefund($appointment, $request->refundAmount, $request->stylistAmount);

                $refundAmount = $request->refundAmount ?? 0;
                $stylistAmount = $request->stylistAmount ?? 0;

                $customerResolution = $adminComment . "After careful review of your dispute, we have determined that a partial refund of R" . number_format($refundAmount, 2) . " is appropriate. The refund has been processed and will be reflected in your account within 1-2 business days.";
                $stylistResolution = $adminComment . "After careful review of the dispute for appointment #" . $appointment->booking_id . ", we have determined that both parties share responsibility. A partial refund of R" . number_format($refundAmount, 2) . " has been issued to the customer, and you will receive R" . number_format($stylistAmount, 2) . " for the services provided.";
                break;

            case 'complete_for_stylist':
                // Logic to complete appointment for stylist (release payment)
                $this->completeAppointmentForStylist($appointment);

                $customerResolution = $adminComment . "After careful review of your dispute, we have determined that the service was provided satisfactorily according to the agreed terms. The appointment has been marked as completed and no refund will be issued. We appreciate your understanding in this matter.";
                $stylistResolution = $adminComment . "After careful review of the dispute for appointment #" . $appointment->booking_id . ", we have determined that the service was provided satisfactorily. The appointment has been marked as completed and payment of R" . number_format($appointment->amount, 2) . " has been released to you.";
                break;

            case 'no_action':
                // No financial action taken
                $customerResolution = $adminComment . "After careful review of your dispute, we have determined that no financial adjustments are necessary. The original transaction and appointment status remain unchanged. We appreciate your understanding in this matter.";
                $stylistResolution = $adminComment . "After careful review of the dispute for appointment #" . $appointment->booking_id . ", we have determined that no financial adjustments are necessary. The original transaction and appointment status remain unchanged. We appreciate your understanding in this matter.";
                break;
        }

        // Send customer resolution email
        Mail::to($appointment->customer->email)->send(new AppointmentDisputeResolutionEmail(
            dispute: $dispute,
            appointment: $appointment,
            recipient: $appointment->customer,
            recipientType: 'customer',
            resolution: $customerResolution
        ));

        sendNotification(
            $appointment->customer_id,
            route('disputes.show', $dispute->id),
            'Appointment Dispute Resolved',
            $customerResolution,
            'normal'
        );

        // Send stylist resolution email
        Mail::to($appointment->stylist->email)->send(new AppointmentDisputeResolutionEmail(
            dispute: $dispute,
            appointment: $appointment,
            recipient: $appointment->stylist,
            recipientType: 'stylist',
            resolution: $stylistResolution
        ));
        sendNotification(
            $appointment->stylist_id,
            route('disputes.show', $dispute->id),
            'Appointment Dispute Resolved',
            $stylistResolution,
            'normal'
        );

        return back()->with('success', 'Dispute resolved and parties notified successfully.');
    }

    /**
     * Process refund to customer.
     */
    private function processCustomerRefund(Appointment $appointment, $amount = null)
    {
        $refundAmount = $amount ?? $appointment->amount;
        $appointment->customer->increment('balance', $refundAmount);
        Transaction::create([
            'user_id' => $appointment->customer->id,
            'appointment_id' => $appointment->id,
            'amount' => $appointment->amount,
            'type' => 'refund',
            'status' => 'completed',
            'ref' => 'REF-' . time(),
        ]);
    }

    private function processSplitRefund(Appointment $appointment, $amount, $to_stylist)
    {
        if (!$amount || !$to_stylist)
            return;
        $appointment->customer->increment('balance', $amount);
        $appointment->pouches()->update(['status' => 'refunded']);
        AppointmentPouch::create([
            'appointment_id' => $appointment->id,
            'amount' => $to_stylist * (1 - getAdminConfig('commission_rate') / 100),
            'status' => 'holding',
            'user_id' => $appointment->stylist_id,
        ]);
        Transaction::create([
            'user_id' => $appointment->stylist_id,
            'appointment_id' => $appointment->id,
            'amount' => $to_stylist * (getAdminConfig('commission_rate') / 100),
            'type' => 'other',
            'status' => 'completed',
            'ref' => 'AdminCommission-' . time(),
            'description' => 'Commission for dispute resolution from stylist',
        ]);
        Transaction::create([
            'user_id' => $appointment->customer->id,
            'appointment_id' => $appointment->id,
            'amount' => $amount,
            'type' => 'refund',
            'status' => 'completed',
            'ref' => 'REF-' . time(),
        ]);
    }

    /**
     * Complete appointment for stylist.
     */
    private function completeAppointmentForStylist(Appointment $appointment)
    {
        $appointment->transactions()->update(['status' => 'completed']);
    }

    /**
     * Notify the other party when dispute status changes to in_progress.
     */
    private function notifyOtherParty(AppointmentDispute $dispute)
    {
        // Determine who is the other party (not the one who created the dispute)
        $appointment = $dispute->appointment;

        //create notification message
        $message = '';


        if ($dispute->from === 'customer') {
            $message1 = 'Your dispute has been successfully filed for appointment ' . $appointment->booking_id . '.';
            $message2 = 'A dispute has been filed by the customer for appointment ' . $appointment->booking_id . '.';
        } else {
            $message1 = 'A dispute has been filed by the stylist for your appointment ' . $appointment->booking_id . '.';
            $message2 = 'Your dispute has been successfully filed for appointment ' . $appointment->booking_id . '.';
        }


        Mail::to($dispute->customer->email)->send(new AppointmentDisputeEmail(
            dispute: $dispute,
            appointment: $appointment,
            recipient: $dispute->customer,
            recipientType: 'customer'
        ));
        sendNotification(
            $appointment->customer_id,
            route('disputes.show', $dispute->id),
            'Appointment Dispute Resolved',
            $message1,
            'normal'
        );

        // Notify stylist
        Mail::to($appointment->stylist->email)->send(new AppointmentDisputeEmail(
            dispute: $dispute,
            appointment: $appointment,
            recipient: $dispute->stylist,
            recipientType: 'stylist'
        ));
        sendNotification(
            $appointment->stylist_id,
            route('disputes.show', $dispute->id),
            'Appointment Dispute Resolved',
            $message2,
            'normal'
        );
    }
}
