<?php

namespace App\Console\Commands;

use App\Models\AppointmentPouch;
use App\Models\Stylist;
use App\Models\Transaction;
use Illuminate\Console\Command;
use Carbon\Carbon;

class ScheduleMonitor extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'schedule:monitor {--show-details : Show detailed information about each item}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Monitor scheduled job status and show what data is available for processing';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $showDetails = $this->option('show-details');

        $this->info('=== SCHEDULE MONITORING REPORT ===');
        $this->info('Generated at: ' . Carbon::now()->format('Y-m-d H:i:s'));
        $this->newLine();

        // Check appointment pouches
        $this->checkAppointmentPouches($showDetails);
        $this->newLine();

        // Check stylist availability
        $this->checkStylistAvailability($showDetails);
        $this->newLine();

        // Check recent command executions from logs
        $this->checkRecentExecutions();
        $this->newLine();

        // Show schedule list
        $this->info('=== SCHEDULED COMMANDS ===');
        $this->call('schedule:list');

        return 0;
    }

    private function checkAppointmentPouches($showDetails = false)
    {
        $this->info('=== APPOINTMENT POUCHES STATUS ===');

        // Eligible for processing (holding status, completed appointment, 24+ hours old)
        $eligiblePouches = AppointmentPouch::whereHas('user')->with(['appointment', 'user'])
            ->where('status', 'holding')
            ->whereHas('appointment', function ($query) {
                $query->where('status', 'completed')
                      ->where('updated_at', '<=', Carbon::now()->subHours(24));
            })
            ->get();

        $this->info("✓ Ready for processing: {$eligiblePouches->count()} pouches");

        // Pending (still in 24-hour hold)
        $pendingPouches = AppointmentPouch::whereHas('user')->with(['appointment', 'user'])
            ->where('status', 'holding')
            ->whereHas('appointment', function ($query) {
                $query->where('status', 'completed')
                      ->where('updated_at', '>', Carbon::now()->subHours(24));
            })
            ->get();

        $this->info("⏳ In holding period: {$pendingPouches->count()} pouches");

        // All holding pouches (regardless of appointment status)
        $allHoldingPouches = AppointmentPouch::where('status', 'holding')->count();
        $this->info("📊 Total holding pouches: {$allHoldingPouches}");

        // Disbursed pouches
        $disbursedPouches = AppointmentPouch::where('status', 'disbursed')->count();
        $this->info("✅ Already disbursed: {$disbursedPouches}");

        if ($showDetails && $eligiblePouches->count() > 0) {
            $this->newLine();
            $this->info('--- ELIGIBLE POUCHES DETAILS ---');
            $this->table(
                ['ID', 'Amount', 'Stylist', 'Appointment', 'Hours Waiting'],
                $eligiblePouches->map(function ($pouch) {
                    $hoursWaiting = Carbon::parse($pouch->appointment->updated_at)->diffInHours(Carbon::now());
                    return [
                        $pouch->id,
                        'R' . number_format($pouch->amount, 2),
                        $pouch->user->name,
                        $pouch->appointment->booking_id,
                        $hoursWaiting . 'h'
                    ];
                })->toArray()
            );
        }

        if ($showDetails && $pendingPouches->count() > 0) {
            $this->newLine();
            $this->info('--- PENDING POUCHES DETAILS ---');
            $this->table(
                ['ID', 'Amount', 'Stylist', 'Hours Remaining'],
                $pendingPouches->map(function ($pouch) {
                    $hoursRemaining = 24 - Carbon::parse($pouch->appointment->updated_at)->diffInHours(Carbon::now());
                    return [
                        $pouch->id,
                        'R' . number_format($pouch->amount, 2),
                        $pouch->user->name,
                        max(0, $hoursRemaining) . 'h'
                    ];
                })->toArray()
            );
        }
    }

    private function checkStylistAvailability($showDetails = false)
    {
        $this->info('=== STYLIST AVAILABILITY STATUS ===');

        // Inactive stylists (available but not logged in for 30+ days)
        $inactiveStylists = Stylist::with('user')
            ->where('is_available', true)
            ->whereHas('user', function ($query) {
                $query->where('last_login_at', '<', Carbon::now()->subDays(30))
                      ->orWhereNull('last_login_at');
            })
            ->get();

        $this->info("⚠️ Ready for disabling: {$inactiveStylists->count()} stylists");

        // Active stylists (available and logged in within 30 days)
        $activeStylists = Stylist::with('user')
            ->where('is_available', true)
            ->whereHas('user', function ($query) {
                $query->where('last_login_at', '>=', Carbon::now()->subDays(30));
            })
            ->count();

        $this->info("✅ Currently active: {$activeStylists} stylists");

        // Disabled stylists
        $disabledStylists = Stylist::where('is_available', false)->count();
        $this->info("❌ Currently disabled: {$disabledStylists} stylists");

        if ($showDetails && $inactiveStylists->count() > 0) {
            $this->newLine();
            $this->info('--- INACTIVE STYLISTS DETAILS ---');
            $this->table(
                ['ID', 'Name', 'Last Login', 'Days Inactive'],
                $inactiveStylists->map(function ($stylist) {
                    $lastLogin = $stylist->user->last_login_at
                        ? $stylist->user->last_login_at->format('Y-m-d')
                        : 'Never';
                    $daysInactive = $stylist->user->last_login_at
                        ? Carbon::parse($stylist->user->last_login_at)->diffInDays(Carbon::now())
                        : 'N/A';
                    return [
                        $stylist->user->id,
                        $stylist->user->name,
                        $lastLogin,
                        $daysInactive
                    ];
                })->toArray()
            );
        }
    }

    private function checkRecentExecutions()
    {
        $this->info('=== RECENT COMMAND EXECUTIONS ===');

        // Check Laravel logs for recent command executions
        $logFile = storage_path('logs/laravel.log');

        if (!file_exists($logFile)) {
            $this->warn('Laravel log file not found at: ' . $logFile);
            return;
        }

        // Read last 50 lines of log file and look for our commands
        $lines = array_slice(file($logFile), -50);
        $commandLogs = array_filter($lines, function ($line) {
            return strpos($line, 'ProcessCompletedAppointmentEarnings') !== false ||
                   strpos($line, 'DisableInactiveStylists') !== false;
        });

        if (empty($commandLogs)) {
            $this->warn('No recent command execution logs found in the last 50 log entries');
            $this->info('Commands may not have run yet, or logging level may need adjustment');
        } else {
            $this->info('Recent command logs found:');
            foreach (array_slice($commandLogs, -5) as $log) {
                $this->line('  ' . trim($log));
            }
        }

        // Show transaction counts for verification
        $recentEarnings = Transaction::where('type', 'earning')
            ->where('created_at', '>=', Carbon::now()->subDays(1))
            ->count();

        $this->info("Recent earning transactions (last 24h): {$recentEarnings}");
    }
}
