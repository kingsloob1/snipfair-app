<?php

namespace App\Jobs;

use App\Events\AppointmentStatusUpdated;
use App\Http\Controllers\Admin\TransactionController;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;
use App\Mail\DepositConfirmationEmail;
use App\Models\Deposit;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

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
    ) {
    }

    /**
     * Execute the job.
     */
    public function handle(TransactionController $transactionController)
    {
        $deposit = $this->deposit->fresh();
        $transactionId = $this->transactionId;
        $pfData = $this->pfData;
        $pfPaymentId = $pfData['pf_payment_id'] ?? null;
        $lockKey = "payfast:payment:handler:{$pfPaymentId}";

        //Only process pending deposit
        if ($deposit->status !== 'pending') {
            Log::warning("Payfast deposit has already been processed for deposit {$deposit->id} [pf_payment_id={$pfPaymentId}]");
            return;
        }

        $cleanUpWithStatus = function (string $status) use ($deposit, $lockKey) {
            $deposit->update([
                'status' => $status
            ]);
            Cache::lock($lockKey)->forceRelease();
        };

        //Hold the lock for a day.. This ensures only one process can process this deposit
        Cache::lock($lockKey, 60 * 60 * 24)->block(20, function () use ($deposit, $transactionId, $pfData, $pfPaymentId, $cleanUpWithStatus, $transactionController) {
            $deposit->update([
                'status' => 'processing'
            ]);

            //Appointment has not been created for deposit. Wait until appointment is available
            if ($deposit->portfolio_id && !$deposit->appointment_id) {
                Log::info("Appointment not ready for deposit {$deposit->id}, retrying...");

                $cleanUpWithStatus('pending');
                self::dispatch($deposit, $pfData, $transactionId)->delay(now()->addSeconds(10));
                return;
            }

            $status = strtolower($pfData['payment_status'] ?? 'unknown');
            $transaction = $deposit->transaction;
            $appointment = $deposit->appointment;

            if ($appointment) {
                $appointmentDepositTxn = $appointment
                    ->transactions()
                    ->where('type', '=', 'payment')
                    ->whereLike('ref', "PAY-DEPOSIT-DEBIT-%", false)
                    ->first();

                if ($appointmentDepositTxn) {
                    $deposit->update([
                        'transaction_id' => $appointmentDepositTxn->id
                    ]);

                    $transaction = $appointmentDepositTxn;
                }
            }

            try {
                DB::transaction(function () use ($appointment, $deposit, $transaction, $status, $pfPaymentId, $cleanUpWithStatus, $transactionController) {
                    switch ($status) {
                        case 'complete': {
                            $transactionController->approveDepositNative($deposit, $transaction);

                            Log::info("Approved deposit for {$deposit->id} [pf_payment_id={$pfPaymentId}]");
                            $cleanUpWithStatus('approved');
                            break;
                        }

                        //If it is for an appointment, ensure you refund tha amount debited from wallet back and then cancel the appointment
                        case 'cancelled': {
                            $transactionController->rejectDepositNative($deposit, $transaction);

                            Log::info("Declined deposit for {$deposit->id} [pf_payment_id={$pfPaymentId}]");
                            $cleanUpWithStatus('declined');
                            break;
                        }

                        default: {
                            Log::warning("No handler specified for status \"{$status}\" for deposit {$deposit->id} [pf_payment_id={$pfPaymentId}]");
                            $cleanUpWithStatus('pending');
                            return;
                        }
                    }
                });
            } catch (Exception $e) {
                $cleanUpWithStatus('pending');
            }
        });
    }
}
