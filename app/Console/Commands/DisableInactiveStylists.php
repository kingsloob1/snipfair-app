<?php

namespace App\Console\Commands;

use App\Models\Stylist;
use Illuminate\Console\Command;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class DisableInactiveStylists extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'stylists:disable-inactive';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Disable stylists who have been inactive for more than 30 days';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting to check for inactive stylists...');

        try {
            // Find stylists who are currently available but haven't logged in for more than 30 days
            $inactiveStylists = Stylist::with('user')
                ->where('is_available', true)
                ->whereHas('user', function ($query) {
                    $query->where('status', 'active')->where('last_login_at', '<', Carbon::now()->subDays(30))
                          ->orWhereNull('last_login_at');
                })
                ->get();

            $disabledCount = 0;

            foreach ($inactiveStylists as $stylist) {
                try {
                    // Update stylist availability to false
                    $stylist->update(['is_available' => false]);

                    $disabledCount++;

                    $lastLogin = $stylist->user->last_login_at
                        ? $stylist->user->last_login_at->format('Y-m-d H:i:s')
                        : 'Never';

                    $this->info("Disabled stylist: {$stylist->user->name} (Last login: {$lastLogin})");

                    Log::info("Stylist {$stylist->user->name} (ID: {$stylist->user->id}) has been disabled due to inactivity. Last login: {$lastLogin}");

                } catch (\Exception $e) {
                    Log::error("Failed to disable stylist {$stylist->user->name} (ID: {$stylist->user->id}): " . $e->getMessage());
                    $this->error("Failed to disable stylist {$stylist->user->name}: " . $e->getMessage());
                }
            }

            $this->info("Successfully disabled {$disabledCount} inactive stylists.");

        } catch (\Exception $e) {
            Log::error('Failed to process inactive stylists: ' . $e->getMessage());
            $this->error('Failed to process inactive stylists: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }
}
