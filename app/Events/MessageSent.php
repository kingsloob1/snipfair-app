<?php

namespace App\Events;

use App\Models\Message;
use App\Models\Conversation;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $conversation;

    /**
     * Create a new event instance.
     */
    public function __construct(Message $message, Conversation $conversation)
    {
        $this->message = $message;
        $this->conversation = $conversation;

        //Trigger firebase notification
        defer(function () use ($message, $conversation) {
            $isSenderStylist = $message->sender->role === 'stylist';
            $senderName = ($isSenderStylist ? $message->sender->stylist_profile?->business_name : null) ?? $message->sender->name;

            //Send to receiver
            $message->receiver->sendFireBaseMessage("{$senderName} sent a message", $message->text, [
                'data' => [
                    'type' => 'conversation',
                    'type_identifier' => (int) $conversation->id
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
            new PrivateChannel('user.' . $this->message->receiver_id),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'message' => [
                'id' => (string) $this->message->id,
                'text' => $this->message->text,
                'is_read' => $this->message->is_read,
                'sender_id' => (string) $this->message->sender_id,
                'receiver_id' => (string) $this->message->receiver_id,
                'timestamp' => $this->message->created_at->format('h:i a'),
            ],
            'conversation_id' => (string) $this->conversation->id,
            'sender' => [
                'id' => (string) $this->message->sender->id,
                'name' => $this->message->sender->name,
                'avatar' => $this->message->sender->avatar,
            ]
        ];
    }
}
