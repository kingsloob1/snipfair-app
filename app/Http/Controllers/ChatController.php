<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;
use Inertia\Inertia;
use App\Events\MessageSent;
use App\Events\UserTyping;

class ChatController extends Controller
{
    /**
     * Display the chat interface with conversations
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $selectedConversationId = $request->query('conversation');

        $conversations = Conversation::with([ //whereHas('messages')->
            'messages' => function ($query) {
                $query->orderBy('created_at');
            },
            'initiator', 'recipient'
        ])
        ->where('initiator_id', $user->id)
        ->orWhere('recipient_id', $user->id)
        ->orderBy('updated_at', 'desc')
        ->get()
        ->map(function ($conversation) use ($user) {
            $otherUser = $conversation->initiator_id == $user->id ? $conversation->recipient : $conversation->initiator;

            $groupedMessages = $conversation->messages
                ->groupBy(fn($msg) => $msg->created_at->isToday() ? 'Today' : $msg->created_at->format('d F Y'))
                ->map(function ($messages, $date) {
                    return [
                        'date' => $date,
                        'messages' => $messages->map(function ($msg) {
                            return [
                                'id' => (string) $msg->id,
                                'text' => $msg->text,
                                'is_read' => $msg->is_read,
                                'sender_id' => (string) $msg->sender_id,
                                'receiver_id' => (string) $msg->receiver_id,
                                'timestamp' => $msg->created_at->format('h:i a'),
                            ];
                        })->values(),
                    ];
                })->values();

            return [
                'id' => (string) $conversation->id,
                'other_user_id' => (string) $otherUser->id,
                'other_user_name' => $otherUser->name,
                'other_user_role' => $otherUser->role,
                'other_user_image' => asset('storage/'.$otherUser->avatar) ?? null,
                'is_online' => $otherUser->isOnline(),
                'message_groups' => $groupedMessages,
            ];
        });

        return Inertia::render('Chat', [
            'conversations' => $conversations,
            'selectedConversationId' => $selectedConversationId ? (string) $selectedConversationId : null,
        ]);
    }

    /**
     * Send a new message
     */
    public function sendMessage(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'text' => 'required|string|max:1000',
        ]);

        $user = $request->user();
        $conversation = Conversation::findOrFail($request->conversation_id);

        // Verify user is part of this conversation
        if (!in_array($user->id, [$conversation->initiator_id, $conversation->recipient_id])) {
            return back()->withErrors(['error' => 'Unauthorized']);
        }

        $receiverId = $conversation->initiator_id == $user->id
            ? $conversation->recipient_id
            : $conversation->initiator_id;

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'receiver_id' => $receiverId,
            'text' => $request->text,
            'is_read' => false,
        ]);

        // Update conversation timestamp
        $conversation->touch();

        // Broadcast the message to both users
        broadcast(new MessageSent($message, $conversation))->toOthers();

        return back()->with('suppress', 'Message sent successfully');
    }

    /**
     * Start a new conversation or return existing one
     */
    public function startConversation(Request $request)
    {
        $request->validate([
            'recipient_id' => 'required|exists:users,id',
        ]);

        $user = $request->user();
        $recipientId = $request->recipient_id;

        // Prevent users from starting conversation with themselves
        if ($user->id == $recipientId) {
            return back()->withErrors(['error' => 'Cannot start conversation with yourself']);
        }

        // Check if conversation already exists
        $conversation = Conversation::where(function ($query) use ($user, $recipientId) {
            $query->where('initiator_id', $user->id)
                  ->where('recipient_id', $recipientId);
        })->orWhere(function ($query) use ($user, $recipientId) {
            $query->where('initiator_id', $recipientId)
                  ->where('recipient_id', $user->id);
        })->first();

        if (!$conversation) {
            $conversation = Conversation::create([
                'initiator_id' => $user->id,
                'recipient_id' => $recipientId,
            ]);
        }

        // Redirect to the chat page with the conversation ID
        $route = $user->role == 'customer' ? 'customer.chat' : 'stylist.chat';
        return redirect()->route($route, ['conversation' => $conversation->id])->with('message', 'Conversation started successfully');
    }

    /**
     * Mark messages as read
     */
    public function markAsRead(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
        ]);

        $user = $request->user();
        $conversation = Conversation::findOrFail($request->conversation_id);

        // Verify user is part of this conversation
        if (!in_array($user->id, [$conversation->initiator_id, $conversation->recipient_id])) {
            return back()->withErrors(['error' => 'Unauthorized']);
        }

        // Mark all messages from other user as read
        Message::where('conversation_id', $conversation->id)
            ->where('receiver_id', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return back()->with('suppress', 'Messages marked as read');
    }

    /**
     * Handle typing indicator
     */
    public function typing(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'is_typing' => 'required|boolean',
        ]);

        $user = $request->user();
        $conversation = Conversation::findOrFail($request->conversation_id);

        // Verify user is part of this conversation
        if (!in_array($user->id, [$conversation->initiator_id, $conversation->recipient_id])) {
            return back()->withErrors(['error' => 'Unauthorized']);
        }

        // Broadcast typing status to other user
        broadcast(new UserTyping($user, $conversation, $request->is_typing))->toOthers();

        return back()->with('suppress', 'Typing status updated');
    }
}
