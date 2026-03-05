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

    public static $PEACH_PAYMENT_RESPONSE_CODES = [
        // ----------------------------------
        // SUCCESSFUL
        // ----------------------------------
        "000.000.000" => ["description" => "Transaction succeeded", "status" => "success"],
        "000.000.100" => ["description" => "successful request", "status" => "success"],
        "000.100.105" => ["description" => "Chargeback Representment is successful", "status" => "success"],
        "000.100.106" => ["description" => "Chargeback Representment cancellation is successful", "status" => "success"],
        "000.100.110" => ["description" => "Request successfully processed in 'Merchant in Integrator Test Mode'", "status" => "success"],
        "000.100.111" => ["description" => "Request successfully processed in 'Merchant in Validator Test Mode'", "status" => "success"],
        "000.100.112" => ["description" => "Request successfully processed in 'Merchant in Connector Test Mode'", "status" => "success"],
        "000.300.000" => ["description" => "Two-step transaction succeeded", "status" => "success"],
        "000.300.100" => ["description" => "Risk check successful", "status" => "success"],
        "000.300.101" => ["description" => "Risk bank account check successful", "status" => "success"],
        "000.300.102" => ["description" => "Risk report successful", "status" => "success"],
        "000.300.103" => ["description" => "Exemption check successful", "status" => "success"],
        "000.310.100" => ["description" => "Account updated", "status" => "success"],
        "000.310.101" => ["description" => "Account updated (Credit card expired)", "status" => "success"],
        "000.310.110" => ["description" => "No updates found, but account is valid", "status" => "success"],
        "000.400.110" => ["description" => "Authentication successful (frictionless flow)", "status" => "success"],
        "000.400.120" => ["description" => "Authentication successful (data only flow)", "status" => "success"],
        "000.600.000" => ["description" => "transaction succeeded due to external update", "status" => "success"],

        // ----------------------------------
        // UNCERTAIN / AWAITING EXTERNAL CONFIRMATION
        // ----------------------------------
        "100.400.500" => ["description" => "waiting for external risk", "status" => "uncertain"],
        "800.400.500" => ["description" => "Waiting for confirmation of non-instant payment. Denied for now.", "status" => "uncertain"],
        "800.400.501" => ["description" => "Waiting for confirmation of non-instant debit. Denied for now.", "status" => "uncertain"],
        "800.400.502" => ["description" => "Waiting for confirmation of non-instant refund. Denied for now.", "status" => "uncertain"],

        // ----------------------------------
        // CANCELLED / USER ACTION
        // ----------------------------------
        "100.396.101" => ["description" => "Cancelled by user due to external update", "status" => "cancelled"],
        "100.396.102" => ["description" => "Not confirmed by user", "status" => "cancelled"],
        "100.396.104" => ["description" => "Uncertain status - probably cancelled by user", "status" => "cancelled"],
        "100.396.106" => ["description" => "User did not agree to payment method terms", "status" => "cancelled"],
        "100.396.201" => ["description" => "Cancelled by merchant", "status" => "cancelled"],
        "100.397.101" => ["description" => "Cancelled by user due to external update", "status" => "cancelled"],

        // ----------------------------------
        // FAILED (REJECTIONS, ERRORS, ALL OTHERS)
        // ----------------------------------
        "000.400.106" => ["description" => "invalid payer authentication response (PARes) in 3DSecure Transaction", "status" => "failed"],
        "000.400.107" => ["description" => "Communication Error to Scheme Directory Server", "status" => "failed"],
        "000.400.108" => ["description" => "Cardholder Not Found", "status" => "failed"],
        "000.400.109" => ["description" => "Card is not enrolled for 3DS version 2", "status" => "failed"],
        "000.400.111" => ["description" => "Data Only request failed", "status" => "failed"],
        "000.400.112" => ["description" => "3RI transaction not permitted", "status" => "failed"],
        "000.400.113" => ["description" => "Protocol version not supported by the issuer ACS", "status" => "failed"],
        "000.400.200" => ["description" => "risk management check communication error", "status" => "failed"],
        "800.100.100" => ["description" => "transaction declined for unknown reason", "status" => "failed"],
        "800.100.153" => ["description" => "transaction declined (invalid CVV)", "status" => "failed"],
        "000.400.030" => ["description" => "Transaction partially failed (manual reversal needed)", "status" => "failed"],
        "900.100.100" => ["description" => "unexpected communication error with connector/acquirer", "status" => "failed"],
        "300.100.100" => ["description" => "Transaction declined (additional customer authentication required)", "status" => "failed"],
        "100.380.401" => ["description" => "User Authentication Failed", "status" => "failed"],
        "100.380.501" => ["description" => "Risk management transaction timeout", "status" => "failed"],
        // (…you can expand this pattern for other reject & validation entries)
    ];

    /**
     * Create a new job instance.
     */
    public function __construct(
        protected Deposit $deposit,
        protected array $depositData
    ) {
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
                $peachResultCodeObj = Arr::get(self::$PEACH_PAYMENT_RESPONSE_CODES, $depositResultCode);

                if (!$peachResultCodeObj) {
                    Log::warning("No handler specified for PeachPayment result code \"" . $depositResultCode . "\" for deposit {$deposit->id} [processor_id={$deposit->processor_id}]");
                    $cleanUpWithStatus('pending');
                    return;
                }

                $status = $peachResultCodeObj['status']; //success, uncertain, cancelled, failed

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
                        case 'failed':
                        case 'cancelled': {
                            $transactionController->rejectDepositNative($deposit, $transaction);

                            Log::info("Declined deposit for peach payment with deposit id {$deposit->id} and [peach_payment_id={$deposit->processor_id}]");
                            $cleanUpWithStatus('declined');
                            break;
                        }

                        //If the transaction is uncertain, remain at pedning and rely on webhook updates for the final status
                        case 'uncertain': {
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
