<?php

namespace App\Console\Commands;

use App\Http\Controllers\PaymentController;
use App\Models\Deposit;
use App\Models\User;
use App\Models\Withdrawal;
use Illuminate\Console\Command;
use Illuminate\Contracts\Console\Isolatable;
use Illuminate\Database\Eloquent\Collection;

class processPendingPeachPaymentDeposits extends Command implements Isolatable
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payment:process-pending-peachpayment-deposits {deposit?* : The deposit id}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process peach payments pending deposits';

    /**
     * Execute the console command.
     */
    public function handle(PaymentController $paymentController)
    {
        $command = $this;
        $this->info('Start processing pending peach payment deposits');
        $depositIds = $this->argument('deposit');

        $qb = Deposit::query()
            ->whereIn('status', ['pending', 'processing'])
            ->where('processor', '=', 'peachpayment')
            ->whereNotNull('processor_id');

        if ($depositIds && is_array($depositIds) && (count($depositIds) > 0)) {
            $qb = $qb->whereIn('id', $depositIds);
        }

        $checkedDepositIds = [];

        $qb->orderBy('updated_at', 'asc')
            ->chunk(20, function (Collection $deposits) use ($paymentController, $command, &$checkedDepositIds) {
                foreach ($deposits as $deposit) {
                    $command->info("Start checking deposit for id =====> {$deposit->id}");
                    $paymentController->checkPeachPaymentDeposit($deposit, true);

                    $checkedDepositIds[] = $deposit->id;
                    $command->info("Stop checking deposit for id =====> {$deposit->id}");
                }
            });

        $totalProcessed = count($checkedDepositIds);
        $depositIdsProcessedStr = implode(', ', $checkedDepositIds);
        $this->info("Done checking pending peach payment deposits ===> {$depositIdsProcessedStr}");
    }
}
