<?php

namespace App\Jobs;

use App\Http\Controllers\Admin\TransactionController;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use App\Models\Deposit;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ProcessPeachPaymentDeposit implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        protected Deposit $deposit,
        protected array $depositData
    ) {
    }

    public static function getPaymentStatusFromResultCode(string $resultCode)
    {
        // Normalize (just in case)
        $code = trim($resultCode);

        // Success patterns (approved / processed successfully)
        $successPatterns = [
            '/^(000.000.|000.100.1|000.[36]|000.400.[1][12]0)/'
        ];

        // Pending / waiting for confirmation / async
        $pendingPatterns = [
            '/^(000.400.0[^3]|000.400.100)/', // success but flagged
            '/^(000\.200)/', // pending processing
            '/^(800\.400\.5|100\.400\.500)/', // waiting for consumer input
        ];

        // Explicitly cancelled / user aborted
        $cancelledPatterns = [
            '/^(000\.400\.[1][0-9][1-9]|000\.400\.2)/', // 3-D secure and intercard risk checks
            '/^(800\.[17]00|800\.800\.[123])/', // Failed by issuer or provider. Use another payment method
            '/^(900\.[1234]00|000\.400\.030)/', // Failed due to connectivity or protocol issues. Could be retried
            '/^(800\.[56]|999\.|600\.1|800\.800\.[84])/', // System level error. Can be retried or reach support if the issue persists
            '/^(100\.39[765])/', // Transaction failed during a background process. Can be retried or reach support if the issue persists
            '/^(300\.100\.100)/', // Transaction declineed. Additional customer authentication may be required. Can be retried or reach support if the issue persists
            '/^(100\.400\.[0-3]|100\.380\.100|100\.380\.11|100\.380\.4|100\.380\.5)/', // Transaction blocked due to external risk system checks.
            '/^(800\.400\.1)/', // Transaction failed due to invalid address data. Retry if address is corrected
            '/^(800\.400\.2|100\.390)/', // Transaction failed due to 3-D secure validation issues.
            '/^(800\.[32])/', // Transaction matched a blocklist rule.
            '/^(800\.1[123456]0)/', // Transaction rejected by internal risk logic.
            '/^(600\.[23]|500\.[12]|800\.121)/', // Transaction failed due to misconfigured merchant settings.
            '/^(100\.[13]50)/', // Transaction failed due to invalid registration data.
            '/^(100\.250|100\.360)/', // Transaction failed due to job related parameters
            '/^(700\.[1345][05]0)/', // Transaction failed due to inavlid reference fields.
            '/^(700\.600|700\.601)/', // Transaction was blocked based on issuer advice. Merchants should respect this guidance and avoid retrying unless explicitly permitted by MAC control logic
            '/^(200\.[123]|100\.[53][07]|800\.900|100\.[69]00\.500)/', // Transaction failed due to incorrect field formatting or invalid data. This includes invalid card number, expiry date, CVV, or other required fields. Retry only if the underlying issue is corrected (e.g. user corrects card number or CVV)
            '/^(100\.800)/', // Transaction failed due to address field issues
            '/^(100\.700|100\.900\.[123467890][00-99])/', // Transaction failed due to invalid contact details
            '/^(100\.100|100.2[01])/', // Transaction failed due to invalid account data
            '/^(100\.55)/', // Transaction failed due to amount constraints.
            '/^(100\.380\.[23]|100\.380\.101)/', // Transaction blocked by internal risk scoring
        ];

        // ──────────────────────────────────────────────
        // Check in priority order
        // ──────────────────────────────────────────────

        foreach ($successPatterns as $pattern) {
            if (preg_match($pattern, $code)) {
                return 'success';
            }
        }

        foreach ($pendingPatterns as $pattern) {
            if (preg_match($pattern, $code)) {
                return 'pending';
            }
        }

        foreach ($cancelledPatterns as $pattern) {
            if (preg_match($pattern, $code)) {
                return 'failed';
            }
        }

        return 'pending';
    }

    /**
     * Execute the job.
     */
    public function handle(TransactionController $transactionController)
    {
        $deposit = $this->deposit->fresh();
        $depositData = $this->depositData;
        $lockKey = "peachpayment:deposit:payment:handler:{$deposit->processor_id}";

        $cleanUpWithStatus = function (string $status) use ($deposit, $lockKey) {
            $deposit->update([
                'status' => $status
            ]);
            Cache::lock($lockKey)->forceRelease();
        };

        //Hold the lock for a day.. This ensures only one process can process this deposit
        Cache::lock($lockKey, 60 * 60 * 24)->block(20, function () use ($deposit, $depositData, $cleanUpWithStatus, $transactionController) {
            $deposit = $this->deposit;
            //Only process pending deposit
            if ($deposit->status !== 'pending') {
                Log::warning("PeachPayment deposit has already been processed for deposit {$deposit->id} [processor_id={$deposit->processor_id}]");
                return;
            }

            try {
                $depositResultCode = Arr::get($depositData, 'result.code');

                if (!$depositResultCode) {
                    $cleanUpWithStatus('pending');
                    return;
                }

                $status = self::getPaymentStatusFromResultCode($depositResultCode); //success, pending, failed

                DB::transaction(function () use ($deposit, $status, $cleanUpWithStatus, $transactionController, $depositData) {
                    $deposit = Deposit::query()->where('id', $deposit->id)->lockForUpdate()->with(['transaction', 'appointment'])->first();

                    $transaction = $deposit->transaction;
                    $appointment = $deposit->appointment;


                    $deposit->update([
                        'status' => 'processing'
                    ]);

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

                    switch ($status) {
                        case 'success': {
                            //Appointment has not been created for deposit. Wait until appointment is available
                            if ($deposit->portfolio_id && !$deposit->appointment_id) {
                                Log::info("Appointment not ready for deposit {$deposit->id}, retrying...");

                                $cleanUpWithStatus('pending');
                                self::dispatch($deposit, $depositData)->delay(now()->addSeconds(10));
                                return;
                            }

                            $transactionController->approveDepositNative($deposit, $transaction);

                            Log::info("Approved deposit from peach payment with deposit id {$deposit->id} and [peach_payment_id={$deposit->processor_id}]");
                            $cleanUpWithStatus('approved');
                            break;
                        }

                        //If it is for an appointment, ensure you refund tha amount debited from wallet back and then cancel the appointment
                        case 'failed': {
                            $transactionController->rejectDepositNative($deposit, $transaction);

                            Log::info("Declined deposit for peach payment with deposit id {$deposit->id} and [peach_payment_id={$deposit->processor_id}]");
                            $cleanUpWithStatus('declined');
                            break;
                        }

                        // Depsoit is still pending. This can be due to various reasons such as 3DS authentication pending, AVS checks pending, or the payment is flagged for review. We will keep the deposit in pending state and wait for further updates from peach payment webhook to update the status of this deposit
                        case 'pending': {
                            Log::info("Peach payment deposit with deposit id {$deposit->id} and [peach_payment_id={$deposit->processor_id}] is in uncertain state, awaiting further updates...");
                            $cleanUpWithStatus('pending');
                            break;
                        }

                        default: {
                            Log::warning("No handler specified for status \"{$status}\" for deposit {$deposit->id} [peach_payment_id={$deposit->processor_id}]");
                            $cleanUpWithStatus('pending');
                            return;
                        }
                    }
                });
            } catch (Exception $e) {
                Log::error('Peach payment deposit failed with error');
                Log::error($e);
                $cleanUpWithStatus('pending');
            }
        });
    }
}
