<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Transaction;
use App\Events\AppointmentStatusUpdated;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function verifyPayment(Request $request)
    {
        $request->validate([
            'appointment_id' => 'required|exists:appointments,id',
            'status' => 'required|in:approved,rejected',
            'admin_note' => 'nullable|string',
        ]);

        $appointment = Appointment::with(['customer', 'stylist', 'portfolio'])->findOrFail($request->appointment_id);
        $previousStatus = $appointment->status;

        // Update transaction status
        $transaction = Transaction::where('appointment_id', $appointment->id)
            ->where('type', 'payment')
            ->first();

        if ($transaction) {
            $transaction->update([
                'status' => $request->status === 'approved' ? 'completed' : 'failed',
                'admin_note' => $request->admin_note,
            ]);
        }

        // Update appointment status
        if ($request->status === 'approved') {
            $appointment->update(['status' => 'pending']);
            
            // Broadcast status update
            broadcast(new AppointmentStatusUpdated($appointment, $previousStatus));
            
            return response()->json([
                'success' => true,
                'message' => 'Payment approved. Appointment is now pending stylist approval.',
            ]);
        } else {
            $appointment->update(['status' => 'canceled']);
            
            // Refund customer balance
            $appointment->customer->update([
                'balance' => $appointment->customer->balance + $appointment->amount
            ]);
            
            // Create refund transaction
            Transaction::create([
                'user_id' => $appointment->customer_id,
                'appointment_id' => $appointment->id,
                'amount' => $appointment->amount,
                'type' => 'refund',
                'status' => 'completed',
                'reference' => 'REF-' . time(),
            ]);
            
            // Broadcast status update
            broadcast(new AppointmentStatusUpdated($appointment, $previousStatus));
            
            return response()->json([
                'success' => true,
                'message' => 'Payment rejected. Customer has been refunded.',
            ]);
        }
    }

    public function getPendingPayments(Request $request)
    {
        $appointments = Appointment::with(['customer', 'stylist', 'portfolio', 'transaction'])
            ->where('status', 'processing')
            ->latest()
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'booking_id' => $appointment->booking_id,
                    'customer_name' => $appointment->customer->name,
                    'customer_email' => $appointment->customer->email,
                    'stylist_name' => $appointment->stylist->name,
                    'portfolio_title' => $appointment->portfolio->title,
                    'amount' => $appointment->amount,
                    'payment_reference' => $appointment->transaction?->reference,
                    'created_at' => $appointment->created_at->diffForHumans(),
                    'appointment_date' => $appointment->appointment_date,
                    'appointment_time' => $appointment->appointment_time,
                ];
            });

        return response()->json([
            'success' => true,
            'payments' => $appointments,
        ]);
    }
}
