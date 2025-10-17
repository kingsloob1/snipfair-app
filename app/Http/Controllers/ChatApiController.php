<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use App\Events\MessageSent;
use App\Events\UserTyping;

class ChatApiController extends Controller
{
    /**
     * Get conversations
     */
    public function getConversations(Request $request)
    {
        $user = $request->user();
        $conversations = Conversation::with([ //whereHas('messages')->
            'messages' => function ($query) {
                $query->orderBy('created_at', 'desc')->limit(5);
            },
            'initiator' => function ($query) {
                $query->withTrashed();
            },
            'recipient' => function ($query) {
                $query->withTrashed();
            }
        ])
            ->where('initiator_id', $user->id)
            ->orWhere('recipient_id', $user->id)
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function ($conversation) use ($user) {
                $otherUser = $conversation->initiator_id == $user->id ? $conversation->recipient : $conversation->initiator;

                $conversation->initiator->is_online = $conversation->initiator->isOnline();


                $conversation->recipient->is_online = $conversation->recipient->isOnline();

                return $conversation;
            });

        return $conversations;
    }

    /**
     * Get conversation messages
     */
    public function getConversationMessages(Request $request, $conversationId)
    {
        $user = $request->user();
        $perPage = formatPerPage($request);
        return Message::query()->where('conversation_id', '=', $conversationId)
            ->where(function ($qb) use ($user) {
                $qb->where('sender_id', '=', $user->id)
                    ->orWhere('receiver_id', '=', $user->id);
            })
            ->orderBy('created_at', 'desc')
            ->cursorPaginate($perPage, ['*'], 'page');
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
            return response()->json([
                'message' => 'Cannot start conversation with yourself'
            ], 400);
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

        $conversation->load([
            'messages' => function ($query) {
                $query->orderBy('created_at', 'desc')->limit(5);
            },
            'initiator' => function ($query) {
                $query->withTrashed();
            },
            'recipient' => function ($query) {
                $query->withTrashed();
            }
        ]);

        $conversation->initiator->is_online = $conversation->initiator->isOnline();
        $conversation->recipient->is_online = $conversation->recipient->isOnline();

        return $conversation;
    }


    /**
     * Send a new message
     */
    public function sendMessage(Request $request, $conversationId)
    {
        $user = $request->user();

        // Verify user is part of this conversation
        $conversation = Conversation::query()->where('id', '=', $conversationId)
            ->where(function ($qb) use ($user) {
                $qb->where(function ($qb) use ($user) {
                    $qb->where('initiator_id', '=', $user->id)
                        ->orWhere('recipient_id', '=', $user->id);
                });
            })
            ->firstOrFail();

        $request->validate([
            'text' => 'required|string|max:1000',
        ]);

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

        return response()->noContent();
    }


    /**
     * Mark messages as read
     */
    public function markAsRead(Request $request, $conversationId)
    {
        $user = $request->user();

        // Verify user is part of this conversation
        $conversation = Conversation::query()->where('id', '=', $conversationId)
            ->where(function ($qb) use ($user) {
                $qb->where(function ($qb) use ($user) {
                    $qb->where('initiator_id', '=', $user->id)
                        ->orWhere('recipient_id', '=', $user->id);
                });
            })
            ->firstOrFail();

        // Mark all messages from other user as read
        Message::where('conversation_id', $conversation->id)
            ->where('receiver_id', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->noContent();
    }

    /**
     * Handle typing indicator
     */
    public function typing(Request $request, $conversationId)
    {
        $user = $request->user();
        // Verify user is part of this conversation
        $conversation = Conversation::query()->where('id', '=', $conversationId)
            ->where(function ($qb) use ($user) {
                $qb->where(function ($qb) use ($user) {
                    $qb->where('initiator_id', '=', $user->id)
                        ->orWhere('recipient_id', '=', $user->id);
                });
            })
            ->firstOrFail();

        $request->validate([
            'is_typing' => 'required|boolean',
        ]);

        // Broadcast typing status to other user
        broadcast(new UserTyping($user, $conversation, $request->is_typing))->toOthers();

        return response()->noContent();
    }
}
