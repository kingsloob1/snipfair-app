<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Auth;
use App\Models\Conversation;
use Illuminate\Support\Str;

class ChatHelper
{
    public static function getRecentChatSummaries()
    {
        $user = Auth::user();

        $conversations = Conversation::whereHas('messages')->with(['messages' => function ($q) {
            $q->latest()->limit(1);
        }, 'initiator', 'recipient'])
        ->where(function ($query) use ($user) {
            $query->where('initiator_id', $user->id)
                  ->orWhere('recipient_id', $user->id);
        })
        ->latest('updated_at')
        ->limit(3)
        ->get();

        return $conversations->filter(function ($conversation) {
            return $conversation->initiator && $conversation->recipient;
        })->map(function ($conversation) use ($user) {
            $latestMessage = $conversation->messages->first();
            $otherUser = $conversation->initiator_id == $user->id
                ? $conversation->recipient
                : $conversation->initiator;

            return [
                'type' => 'chat',
                'title' => $otherUser->name,
                'description' => Str::limit($latestMessage?->text ?? '', 100),
                'timestamp' => $latestMessage
                    ? $latestMessage->created_at->diffForHumans()
                    : '',
                'isUnread' => $latestMessage
                    ? !$latestMessage->is_read && $latestMessage->sender_id != $user->id
                    : false,
                'image' => $otherUser->avatar ? asset('storage/' . ltrim($otherUser->avatar, '/')) : null,
                'id' => $conversation->id,
                'other_id' => $otherUser->id,
                // ?? '/images/temp/default.jpg',
            ];
        })->values();
    }
}
