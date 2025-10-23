<?php

namespace App\Events;

use App\Models\Notification;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class NotificationPushed
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $notification;
    /**
     * Create a new event instance.
     */
    public function __construct(Notification $notification)
    {
        $this->notification = $notification;

        //Trigger firebase notification
        defer(function () use ($notification) {
            $type = 'notification';
            $id = null;

            switch (true) {
                case Str::endsWith($notification->type, 'customer/wallet'):
                case Str::endsWith($notification->type, 'stylist/earnings'): {
                    $type = 'wallet';
                    break;
                }

                case preg_match('/\b(stylist|customer)\b\/appointment\/(\d{1,})/', $notification->type, $matches): {
                    $type = 'appointment';
                    $id = Arr::get($matches, '2', null);
                    break;
                }

                case preg_match('/\b(disputes)\b\/(\d{1,})/', $notification->type, $matches): {
                    $type = 'dispute';
                    $id = Arr::get($matches, '2', null);
                    break;
                }

                default: {
                    $type = 'notification';
                }
            }

            if ($id) {
                $id = (int) $id;
            }

            //Send to user
            $notification->user->sendFireBaseMessage($notification->title, $notification->description, [
                'data' => [
                    'type' => $type,
                    'type_identifier' => $id,
                ],
                'link' => $notification->type
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
            new PrivateChannel('user.' . $this->notification->user_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'notification.pushed';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->notification->id,
            'type' => $this->notification->priority,
            'title' => $this->notification->title,
            'description' => Str::limit($this->notification->description ?? '', 100),
            'timestamp' => $this->notification->created_at->diffForHumans(),
            'isUnread' => !$this->notification->is_seen,
        ];
    }
}
