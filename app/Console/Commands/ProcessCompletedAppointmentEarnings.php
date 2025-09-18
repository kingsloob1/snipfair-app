<?php

namespace App\Console\Commands;

use App\Models\AppointmentPouch;
use App\Models\Transaction;
use Illuminate\Console\Command;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessCompletedAppointmentEarnings extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'appointments:process-earnings';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process earnings for completed appointments after 24 hours hold period';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting to process completed appointment earnings...');

        try {
            DB::beginTransaction();

            // Get appointment pouches where status is 'holding',
            // appointment status is 'complete', and appointment was updated >= 24 hours ago
            $eligiblePouches = AppointmentPouch::whereHas('user')->with(['appointment', 'user'])
                ->where('status', 'holding')
                ->whereHas('appointment', function ($query) {
                    $query->where('status', 'completed')
                          ->where('updated_at', '<=', Carbon::now()->subHours(24));
                })
                ->get();

            $processedCount = 0;
            $totalAmount = 0;

            foreach ($eligiblePouches as $pouch) {
                try {
                    // Credit the stylist's balance
                    $pouch->user->increment('balance', $pouch->amount);

                    // Create earning transaction
                    Transaction::create([
                        'user_id' => $pouch->user_id,
                        'appointment_id' => $pouch->appointment_id,
                        'amount' => $pouch->amount,
                        'type' => 'earning',
                        'status' => 'completed',
                        'ref' => 'EARN-' . time() . '-' . $pouch->id,
                        'description' => 'Earnings from completed appointment #' . $pouch->appointment->booking_id,
                    ]);

                    // Update pouch status to 'disbursed'
                    $pouch->update(['status' => 'disbursed']);

                    $processedCount++;
                    $totalAmount += $pouch->amount;

                    $this->info("Processed earning for stylist {$pouch->user->name}: $" . number_format($pouch->amount, 2));

                } catch (\Exception $e) {
                    Log::error("Failed to process earning for pouch {$pouch->id}: " . $e->getMessage());
                    $this->error("Failed to process earning for pouch {$pouch->id}: " . $e->getMessage());
                }
            }

            DB::commit();

            $this->info("Successfully processed {$processedCount} earnings totaling R" . number_format($totalAmount, 2));

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to process appointment earnings: ' . $e->getMessage());
            $this->error('Failed to process appointment earnings: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }
}
