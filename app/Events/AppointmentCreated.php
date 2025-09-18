<?php

namespace App\Events;

use App\Models\Appointment;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AppointmentCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $appointment;

    /**
     * Create a new event instance.
     */
    public function __construct(Appointment $appointment)
    {
        $this->appointment = $appointment;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('appointment.' . $this->appointment->id),
            new PrivateChannel('user.' . $this->appointment->customer_id),
            new PrivateChannel('stylist.' . $this->appointment->stylist_id),
            new PrivateChannel('admin.appointments'),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'appointment.created';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'appointment_id' => $this->appointment->id,
            'status' => $this->appointment->status,
            'booking_id' => $this->appointment->booking_id,
            'appointment_code' => $this->appointment->appointment_code,
            'completion_code' => $this->appointment->completion_code,
            'customer_id' => $this->appointment->customer_id,
            'stylist_id' => $this->appointment->stylist_id,
            'portfolio_id' => $this->appointment->portfolio_id,
            'amount' => $this->appointment->amount,
            'customer_name' => $this->appointment->customer->name,
            'stylist_name' => $this->appointment->stylist->name,
            'portfolio_title' => $this->appointment->portfolio->title,
            'created_at' => $this->appointment->created_at->toISOString(),
        ];
    }
}
