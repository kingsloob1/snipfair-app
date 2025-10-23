<?php

namespace App\Console\Commands;

use App\Http\Controllers\PaymentController;
use App\Models\User;
use App\Models\Withdrawal;
use Illuminate\Console\Command;
use Illuminate\Contracts\Console\Isolatable;
use Illuminate\Database\Eloquent\Collection;

class processPendingPeachPaymentWithdrawals extends Command implements Isolatable
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payment:process-pending-peachpayment-withdrawals {withdrawal?* : The withdrawl id}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process peach payments pending withdrawals';

    /**
     * Execute the console command.
     */
    public function handle(PaymentController $paymentController)
    {
        $command = $this;
        $this->info('Start processing pending peach payment withdrawals');
        $withdrawalIds = $this->argument('withdrawal');

        $qb = Withdrawal::query()
            ->with(['payment_method', 'user'])
            ->where('status', '=', 'processing')
            ->where('processor', '=', 'peachpayments')
            ->whereNotNull('processor_id');

        if ($withdrawalIds && is_array($withdrawalIds) && (count($withdrawalIds) > 0)) {
            $qb = $qb->whereIn('id', $withdrawalIds);
        }

        $processedIds = [];

        $qb->orderBy('updated_at', 'asc')
            ->chunk(20, function (Collection $withdrawals) use ($paymentController, $command, &$processedIds) {
                foreach ($withdrawals as $withdrawal) {
                    $command->info("Start processing withdrawal for id =====> {$withdrawal->id}");
                    $paymentController->processPeachPaymentPayout($withdrawal);

                    $processedIds[] = $withdrawal->id;
                    $command->info("Stop processing withdrawal for id =====> {$withdrawal->id}");
                }
            });

        $totalProcessed = count($processedIds);
        $withdrawalIdsProcessedStr = implode(', ', $processedIds);
        $this->info("Done processing pending peach payment withdrawals ===> {$withdrawalIdsProcessedStr}");
    }
}
