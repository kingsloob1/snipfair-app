<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\TicketMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class TicketController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $tickets = $user->tickets()
            ->with(['latestMessage'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Support/Tickets', [
            'tickets' => $tickets,
        ]);
    }

    public function create(): Response
    {// dd('inside');
        return Inertia::render('Support/CreateTicket');
    }

    public function store(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'description' => 'required|string',
            'priority' => 'sometimes|in:low,medium,high,risky',
        ]);

        $ticket = Ticket::create([
            'user_id' => Auth::id(),
            'subject' => $request->subject,
            'description' => $request->description,
            'priority' => $request->priority ?? 'medium',
            'status' => 'open',
        ]);

        // Create initial message
        TicketMessage::create([
            'ticket_id' => $ticket->id,
            'sender_type' => 'App\Models\User',
            'sender_id' => Auth::id(),
            'message' => $request->description,
        ]);

        return redirect()->route('tickets.show', $ticket)
            ->with('success', 'Ticket created successfully.');
    }

    public function show(Request $request, Ticket $ticket): Response
    {
        $user = $request->user();
        // Ensure user can only see their own tickets
        if ($ticket->user_id != $user->id) {
            abort(403, 'Unauthorized access to ticket.');
        }

        $ticket->load(['messages.sender']);

        $ticket->messages->map(function (TicketMessage $message) {
            $message->attachments = array_map(function ($attachment) {
                $filePath = formatStoredFilePath(Arr::get($attachment, 'path'));

                return array_merge($attachment, [
                    'url' => $filePath ? Storage::url($filePath) : '',
                ]);
            }, $message->attachments ?? []);

            return $message;
        });

        return Inertia::render('Support/TicketDetail', [
            'ticket' => $ticket,
        ]);
    }

    public function sendMessage(Request $request, Ticket $ticket)
    {
        // Ensure user can only message their own tickets
        if ($ticket->user_id != Auth::id()) {
            abort(403, 'Unauthorized access to ticket.');
        }

        $request->validate([
            'message' => 'required|string',
            'attachments' => 'nullable|array|max:5',
            'attachments.*' => 'file|mimes:jpg,jpeg,png,gif,webp,pdf,doc,docx|max:20480',
        ]);

        $attachments = [];

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('dispute-attachments', 'public');
                $attachments[] = [
                    'name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'size' => $file->getSize(),
                    'type' => $file->getMimeType(),
                ];
            }
        }

        TicketMessage::create([
            'ticket_id' => $ticket->id,
            'sender_type' => 'App\Models\User',
            'sender_id' => Auth::id(),
            'message' => $request->message,
            'attchments' => $attachments,
        ]);

        // Reopen ticket if it was closed
        if ($ticket->status === 'closed') {
            $ticket->update(['status' => 'open']);
        }

        return back()->with('success', 'Message sent successfully.');
    }

    /**
     * Download an attachment from a ticket message.
     */
    public function downloadAttachment(Request $request, $ticketId, $messageId, $attachmentIndex)
    {
        $user = $request->user();
        $ticketMessage = TicketMessage::query()
            ->whereHas('ticket', function ($qb) use ($ticketId, $user) {
                $qb->where('id', '=', $ticketId)->where('user_id', '=', $user->id);
            })
            ->where('id', '=', $messageId)
            ->firstOrFail();

        $attachments = $ticketMessage->attachments;
        if (!$attachments || !isset($attachments[$attachmentIndex])) {
            return response()->json([
                'message' => 'Attachment not found.'
            ], 404);
        }

        $attachment = $attachments[$attachmentIndex];
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
