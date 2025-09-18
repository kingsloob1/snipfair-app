<?php

namespace App\Events;

use App\Models\Appointment;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PaymentVerificationRequested implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $appointment;
    public $paymentAmount;
    public $paymentReference;

    /**
     * Create a new event instance.
     */
    public function __construct(Appointment $appointment, float $paymentAmount, string $paymentReference)
    {
        $this->appointment = $appointment;
        $this->paymentAmount = $paymentAmount;
        $this->paymentReference = $paymentReference;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('admin.payments'),
            new PrivateChannel('appointment.' . $this->appointment->id),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'payment.verification.requested';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'appointment_id' => $this->appointment->id,
            'booking_id' => $this->appointment->booking_id,
            'customer_id' => $this->appointment->customer_id,
            'customer_name' => $this->appointment->customer->name,
            'payment_amount' => $this->paymentAmount,
            'payment_reference' => $this->paymentReference,
            'stylist_name' => $this->appointment->stylist->name,
            'portfolio_title' => $this->appointment->portfolio->title,
            'created_at' => now()->toISOString(),
        ];
    }
}
