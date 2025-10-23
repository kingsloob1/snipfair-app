<?php

namespace App\Events;

use App\Models\Appointment;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AppointmentStatusUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $appointment;
    public $previousStatus;

    /**
     * Create a new event instance.
     */
    public function __construct(Appointment $appointment, string $previousStatus = null)
    {
        $this->appointment = $appointment;
        $this->previousStatus = $previousStatus;

        //Trigger firebase notification
        defer(function () use ($appointment, $previousStatus) {
            //Send to stylist
            $appointment->stylist->sendFireBaseMessage("Appointment Status Updated", "Appointment ({$appointment->booking_id}) status changed from {$previousStatus} to {$appointment->status}", [
                'data' => [
                    'type' => 'appointment',
                    'type_identifier' => (int) $appointment->id
                ],
                // 'link' => route('customer.appointment.show', $appointment->id)
                'link' => route('stylist.appointment', $appointment->id)
            ]);

            //Send to Customer
            $appointment->customer->sendFireBaseMessage("Your Appointment ({$appointment->booking_id}) Status Changed", "Appointment ($appointment->booking_id) status changed from {$previousStatus} to {$appointment->status}", [
                'data' => [
                    'type' => 'appointment',
                    'type_identifier' => (int) $appointment->id
                ],
                'link' => route('customer.appointment.show', $appointment->id)
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
            new PrivateChannel('appointment.' . $this->appointment->id),
            new PrivateChannel('user.' . $this->appointment->customer_id),
            new PrivateChannel('stylist.' . $this->appointment->stylist_id),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'appointment.status.updated';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'appointment_id' => $this->appointment->id,
            'status' => $this->appointment->status,
            'previous_status' => $this->previousStatus,
            'appointment_code' => $this->appointment->appointment_code,
            'completion_code' => $this->appointment->completion_code,
            'customer_id' => $this->appointment->customer_id,
            'stylist_id' => $this->appointment->stylist_id,
            'portfolio_id' => $this->appointment->portfolio_id,
            'amount' => $this->appointment->amount,
            'updated_at' => $this->appointment->updated_at->toISOString(),
        ];
    }
}
