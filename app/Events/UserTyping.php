<?php

namespace App\Events;

use App\Models\User;
use App\Models\Conversation;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserTyping implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $user;
    public $conversation;
    public $isTyping;

    /**
     * Create a new event instance.
     */
    public function __construct(User $user, Conversation $conversation, bool $isTyping)
    {
        $this->user = $user;
        $this->conversation = $conversation;
        $this->isTyping = $isTyping;

        //Trigger firebase notification
        defer(function () use ($user, $conversation) {
            $isSenderStylist = $user->role === 'stylist';
            $senderName = ($isSenderStylist ? $user->stylist_profile?->business_name : null) ?? $user->name;

            $receiver = $conversation->initiator_id == $user->id ? $conversation->recipient : $conversation->initiator;

            //Send to receiver
            $receiver->sendFireBaseMessage("{$senderName} is typing a message", '', [
                'data' => [
                    'type' => 'conversation',
                    'type_identifier' => (int) $conversation->id,
                    'silent' => true,
                ],
                'link' => route($isSenderStylist ? 'customer.chat' : 'stylist.chat', ['conversation' => $conversation->id])
            ]);
        });
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('conversation.' . $this->conversation->id),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'user.typing';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'user_id' => $this->user->id,
            'user_name' => $this->user->name,
            'is_typing' => $this->isTyping,
            'conversation_id' => $this->conversation->id,
        ];
    }
}
