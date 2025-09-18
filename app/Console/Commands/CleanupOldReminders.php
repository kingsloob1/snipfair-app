<?php

namespace App\Console\Commands;

use App\Models\AppointmentReminder;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CleanupOldReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'appointments:cleanup-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up old appointment reminder records older than 30 days';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Cleaning up old appointment reminder records...');

        // Delete reminder records older than 30 days
        $deleted = AppointmentReminder::where('created_at', '<', Carbon::now()->subDays(30))->delete();

        $this->info("Deleted {$deleted} old reminder records.");
        $this->info('Cleanup completed.');

        return 0;
    }
}
