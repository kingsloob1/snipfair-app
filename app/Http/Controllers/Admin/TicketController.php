<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\TicketMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TicketController extends Controller
{
    public function index(): Response
    {
        $admin = Auth::guard('admin')->user();
        $tickets = Ticket::with(['user', 'latestMessage', 'assignedTo'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        $stats = Ticket::getStats();

        // Format tickets for frontend
        $formattedTickets = $tickets->map(function ($ticket) {
            return [
                'id' => $ticket->ticket_id,
                'userName' => $ticket->user?->name,
                'userAvatar' => $ticket->user ? getAvatar($ticket->user) : '',
                'type' => $ticket->user?->role,
                'comment' => $ticket->description,
                'updatedDate' => $ticket->updated_at->format('Y-m-d'),
                'status' => ucfirst(str_replace('_', ' ', $ticket->status)),
                'priority' => ucfirst($ticket->priority),
                'subject' => $ticket->subject,
                'created_at' => $ticket->created_at->format('Y-m-d'),
                'assigned_to' => $ticket->assignedTo?->name,
            ];
        });

        // Calculate historical data for meaningful metrics
        $lastMonthResponseTime = Ticket::getAverageResponseTimeForPeriod(now()->subMonth());
        $yesterdayResolved = Ticket::where('status', 'closed')
            ->whereDate('resolved_at', today()->subDay())
            ->count();

        $responseTimeChange = $this->calculateResponseTimeChange($stats['avg_response_time'], $lastMonthResponseTime);
        $resolvedChange = $this->calculateResolvedChange($stats['resolved_today'], $yesterdayResolved);

        // Format metrics for frontend
        $metrics = [
            'metricOne' => [
                'value' => (string) $stats['open'],
                'subtitle' => 'Open Tickets',
            ],
            'metricTwo' => [
                'value' => $stats['avg_response_time'],
                'change' => $responseTimeChange['text'],
                'changeType' => $responseTimeChange['type'],
            ],
            'metricThree' => [
                'value' => (string) $stats['resolved_today'],
                'change' => $resolvedChange['text'],
                'changeType' => $resolvedChange['type'],
            ],
            'metricFour' => [
                'value' => $stats['satisfaction_rate'] . '%',
                'subtitle' => 'Customer Satisfaction',
            ],
        ];

        return Inertia::render('Admin/Account/Tickets/Support', [
            'auth' => $admin,
            'tickets' => $formattedTickets,
            'metrics' => $metrics,
        ]);
    }

    public function show(Ticket $ticket): Response
    {
        $ticket->load(['user', 'messages.sender', 'assignedTo']);

        return Inertia::render('Admin/Account/Tickets/TicketDetail', [
            'ticket' => $ticket,
        ]);
    }

    public function updateStatus(Request $request, Ticket $ticket)
    {
        $request->validate([
            'status' => 'required|in:open,in_progress,closed,pending',
            'priority' => 'sometimes|in:low,medium,high,risky',
            'assigned_to' => 'sometimes|exists:admins,id',
        ]);

        $updates = [];

        if ($request->has('status')) {
            $updates['status'] = $request->status;
        }

        if ($request->has('priority')) {
            $updates['priority'] = $request->priority;
        }

        if ($request->has('assigned_to')) {
            $updates['assigned_to'] = $request->assigned_to;
        }

        $ticket->update($updates);

        return response()->json([
            'success' => true,
            'message' => 'Ticket updated successfully',
            'ticket' => $ticket->fresh(),
        ]);
    }

    public function updatePriority(Request $request, Ticket $ticket)
    {
        $request->validate([
            'priority' => 'required|in:low,medium,high,risky',
        ]);

        $ticket->update(['priority' => $request->priority]);

        return back()->with('success', 'Ticket priority updated successfully.');
    }

    public function assignTicket(Request $request, Ticket $ticket)
    {
        $request->validate([
            'admin_id' => 'required|exists:admins,id',
        ]);

        $ticket->update(['assigned_to' => $request->admin_id]);

        return back()->with('success', 'Ticket assigned successfully.');
    }

    public function getMessages(Ticket $ticket)
    {
        $messages = $ticket->messages()
            ->with('sender')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($message) {
                return [
                    'id' => $message->id,
                    'text' => $message->message,
                    'timestamp' => $message->created_at->format('g:i a'),
                    'isFromCustomer' => $message->sender_type === 'App\Models\User',
                    'isDelivered' => true,
                ];
            });

        return response()->json([
            'success' => true,
            'messages' => $messages,
        ]);
    }

    public function sendMessage(Request $request, Ticket $ticket)
    {
        $request->validate([
            'message' => 'required|string',
            'is_internal' => 'boolean',
        ]);

        $message = TicketMessage::create([
            'ticket_id' => $ticket->id,
            'sender_type' => 'App\Models\Admin',
            'sender_id' => Auth::guard('admin')->id(),
            'message' => $request->message,
            'is_internal' => $request->is_internal ?? false,
        ]);

        // Update ticket status to in_progress if it was open
        if ($ticket->status === 'open') {
            $ticket->update(['status' => 'in_progress']);
        }

        return back()->with('success', 'Message sent successfully.');
    }

    public function getStats()
    {
        return response()->json(Ticket::getStats());
    }

    /**
     * Calculate response time change percentage
     */
    private function calculateResponseTimeChange($current, $previous)
    {
        // Extract numeric values from time strings (e.g., "2.5hr" -> 2.5)
        $currentValue = (float) str_replace('hr', '', $current);
        $previousValue = (float) str_replace('hr', '', $previous);

        if ($previousValue == 0) {
            return ['text' => 'No data', 'type' => 'positive'];
        }

        $change = (($currentValue - $previousValue) / $previousValue) * 100;
        $changeText = abs(round($change, 1)) . '% from last month';

        // For response time, lower is better, so positive change means slower response (negative)
        return [
            'text' => $changeText,
            'type' => $change <= 0 ? 'positive' : 'negative'
        ];
    }

    /**
     * Calculate resolved tickets change
     */
    private function calculateResolvedChange($today, $yesterday)
    {
        if ($yesterday == 0) {
            return ['text' => $today > 0 ? 'New today' : 'No tickets', 'type' => 'positive'];
        }

        $change = (($today - $yesterday) / $yesterday) * 100;
        $changeText = abs(round($change, 1)) . '% from yesterday';

        return [
            'text' => $changeText,
            'type' => $change >= 0 ? 'positive' : 'negative'
        ];
    }
}
