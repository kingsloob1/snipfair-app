<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;
use App\Mail\DepositConfirmationEmail;
use App\Models\Deposit;
use App\Models\Transaction;  // Your Transaction model
use Illuminate\Support\Facades\Log;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessPayfastDeposit implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        protected Deposit $deposit,
        protected array $pfData,
        protected ?string $transactionId
    ){}

    /**
     * Execute the job.
     */
    public function handle()
    {
        $deposit = $this->deposit->fresh();
        $transactionId = $this->transactionId;
        $pfData = $this->pfData;
        $pfPaymentId = $pfData['pf_payment_id'] ?? null;

        // 🔒 Deduplication check
        if ($pfPaymentId && $deposit->reference === $pfPaymentId) {
            Log::warning("Duplicate Payfast webhook ignored for deposit {$deposit->id} [pf_payment_id={$pfPaymentId}]");
            return;
        }

        $transaction = Transaction::find($transactionId);

        // If it's a portfolio deposit, wait until appointment exists
        if ($deposit->portfolio_id == (int) $transactionId && !$deposit->appointment) {
            Log::info("Appointment not ready for deposit {$deposit->id}, retrying...");
            self::dispatch($deposit, $pfData, $transactionId)->delay(now()->addSeconds(5));
            return;
        }

        if($appointment = $deposit->appointment) $transaction = null;
        if ($deposit && (($transaction && $deposit->transaction_id == $transaction->id) || ($appointment && $deposit->appointment_id == $appointment->id))) {
            $status = strtolower($pfData['payment_status'] ?? 'unknown');

            if ($status === 'complete') {
                if ($transaction) {
                    $transaction->update([
                        'status' => 'completed',
                    ]);
                } else if ($appointment) {
                    $appointmentTransaction = $appointment->transaction;
                    if ($appointmentTransaction) {
                        $user = $appointment->customer;
                        if ($user->balance > 0 && str_contains(strtolower($appointmentTransaction->description), 'partial')) {
                            $user->update(['balance' => 0]);
                        }
                        $appointment->update(['status' => 'pending']);
                        $appointmentTransaction->update(['status' => 'completed']);
                    }
                }

                $deposit->user->increment('balance', $deposit->amount);
                $deposit->update([
                    'status' => 'approved',
                    'reference' => $pfPaymentId,
                ]);

                Mail::to($deposit->user->email)->send(new DepositConfirmationEmail(
                    deposit: $deposit,
                    customer: $deposit->user,
                    newBalance: $deposit->user->balance
                ));
                sendNotification(
                    $deposit->user->id,
                    route('customer.wallet'),
                    'Deposit Successful',
                    'Your deposit of R' . $deposit->amount . ' has been successfully completed.',
                    'normal',
                );
            } elseif ($status === 'cancelled') {
                $deposit->update([
                    'status' => 'declined',
                    'reference' => $pfPaymentId, // ✅ Still store so we don’t reprocess
                ]);
            }
        } else {
            Log::error("Transaction {$transactionId} not found or not matching deposit {$deposit->id}");
        }
    }
}
