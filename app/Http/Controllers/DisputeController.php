<?php

namespace App\Http\Controllers;

use App\Helpers\AdminNotificationHelper;
use App\Models\AppointmentDispute;
use App\Models\AppointmentDisputeMessage;
use App\Models\User;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DisputeController extends Controller
{
    /**
     * Display a listing of disputes for the authenticated user.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $perPage = formatPerPage($request);
        $conversationType = $user->role === 'customer' ? 'admin_customer' : 'admin_stylist';

        $disputeQueryBuilder = AppointmentDispute::with([
            'appointment',
            'appointment.portfolio',
            'customer',
            'stylist',
            'messages' => function ($query) use ($conversationType) {
                $query->where('sender_type', $conversationType)->latest()->limit(1);
            }
        ])
            ->where(function ($query) use ($user) {
                $query->where('customer_id', $user->id)
                    ->orWhere('stylist_id', $user->id);
            })
            //->where('status', '!=', 'open') // Only show disputes that are in progress or resolved
            ->orderBy('updated_at', 'desc');

        if ($request->expectsJson()) {
            return $disputeQueryBuilder->cursorPaginate($perPage, ['*'], 'page');
        }


        return Inertia::render('Disputes/Index', [
            'disputes' => $disputeQueryBuilder
                ->paginate(max($perPage, 10)),
        ]);
    }

    /**
     * Display the specified dispute.
     */
    public function show(Request $request, $disputeId)
    {
        $user = $request->user();
        $dispute = AppointmentDispute::query()->where('id', '=', $disputeId)->where(function ($qb) use ($user) {
            $qb->where('customer_id', '=', $user->id)->orWhere('stylist_id', '=', $user->id);
        })->firstOrFail();

        if ($dispute->customer_id == $user->id) {
            // Customer sees only admin-customer conversation
            $messages = $dispute->adminCustomerMessages;
            $conversationType = 'admin_customer';
        } elseif ($dispute->stylist_id == $user->id) {
            // Stylist sees only admin-stylist conversation
            $messages = $dispute->adminStylistMessages;
            $conversationType = 'admin_stylist';
        }

        // Load dispute with all related data
        $dispute->load([
            'appointment',
            'appointment.portfolio',
            'customer',
            'stylist',
        ]);

        $dispute->messages = $messages;

        if ($request->expectsJson()) {
            return $dispute;
        }

        // Mark messages as read for the current user
        // $dispute->messages()
        //     ->where('sender_type', '!=', get_class($user))
        //     ->whereNull('read_at')
        //     ->update(['read_at' => now()]);

        return Inertia::render('Disputes/Show', [
            'dispute' => $dispute,
        ]);
    }

    /**
     * Store a new message in the dispute.
     */
    public function storeMessage(Request $request, $disputeId)
    {
        $user = $request->user();
        $dispute = AppointmentDispute::query()->where('id', '=', $disputeId)->where(function ($qb) use ($user) {
            $qb->where('customer_id', '=', $user->id)->orWhere('stylist_id', '=', $user->id);
        })->firstOrFail();

        // Check if dispute is still open for messaging
        if ($dispute->status === 'closed' || $dispute->status === 'resolved') {
            return response()->json(['error' => 'This dispute is no longer accepting messages.'], 422);
        }

        $request->validate([
            'message' => 'required|string|max:1000',
            'attachments' => 'nullable|array|max:5',
            'attachments.*' => 'file|mimes:jpg,jpeg,png,gif,webp,pdf,doc,docx|max:10240', // 10MB max per file
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

        $conversationType = ($dispute->customer_id == $user->id)
            ? 'admin_customer'
            : 'admin_stylist';

        $message = AppointmentDisputeMessage::create([
            'appointment_dispute_id' => $dispute->id,
            'sender_type' => get_class($user),
            'sender_id' => $user->id,
            'message' => $request->message,
            'conversation_type' => $conversationType,
            'attachments' => !empty($attachments) ? $attachments : null,
        ]);

        $superAdmins = Admin::where('role', 'super-admin')
            ->where('is_active', true)
            ->get();

        foreach ($superAdmins as $admin) {
            AdminNotificationHelper::create(
                $admin->id,
                route('admin.disputes.show', $dispute->id),
                'Dispute response from ' . $user->name,
                "Email: {$user->email}\nMessage: " . substr($request->message, 0, 100) . '...',
                'normal'
            );
        }

        // Update dispute's updated_at timestamp
        $dispute->touch();

        $message->load('sender');

        return response()->json([
            'message' => $message,
            'success' => true,
        ]);
    }

    /**
     * Download an attachment from a dispute message.
     */
    public function downloadAttachment(Request $request, $disputeMessageId, $disputeMessageAttachmentIndex)
    {
        $user = $request->user();
        $disputeMessage = AppointmentDisputeMessage::query()
            ->where('id', '=', $disputeMessageId)->whereHas('appointmentDispute', function ($qb) use ($user) {
                $qb->where('customer_id', '=', $user->id)->orWhere('stylist_id', '=', $user->id);
            })->firstOrFail();

        $attachments = $disputeMessage->attachments;
        if (!$attachments || !isset($attachments[$disputeMessageAttachmentIndex])) {
            return response()->json([
                'message' => 'Attachment not found.'
            ], 404);
        }

        $attachment = $attachments[$disputeMessageAttachmentIndex];
        $filePath = formatStoredFilePath($attachment['path']);

        if (!Storage::disk('public')->exists($filePath)) {
            return response()->json([
                'message' => 'File not found.'
            ], 404);
        }

        return response()->download(
            Storage::disk('public')->path($filePath),
            $attachment['name']
        );
    }
}
