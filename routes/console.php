<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule commands to run every hour
Schedule::command('appointments:process-earnings')
    ->hourly()
    ->withoutOverlapping()
    ->runInBackground();

Schedule::command('stylists:disable-inactive')
    ->hourly()
    ->withoutOverlapping()
    ->runInBackground();

// Schedule appointment reminders to run every 30 minutes
Schedule::command('appointments:schedule-reminders')
    ->everyThirtyMinutes()
    ->withoutOverlapping()
    ->runInBackground();

// Clean up old reminder records daily
Schedule::command('appointments:cleanup-reminders')
    ->daily()
    ->withoutOverlapping()
    ->runInBackground();

// Generate SEO sitemap daily
Schedule::command('seo:generate-sitemap')
    ->daily()
    ->withoutOverlapping()
    ->runInBackground();

Schedule::command('sanctum:prune-expired --hours=24')->daily();

// Process pending peach payment withdrawals
Schedule::command('payment:process-pending-peachpayment-withdrawals')
    ->everyTenMinutes()
    ->withoutOverlapping()
    ->runInBackground();

$testSchedulerLogPath = __DIR__ . '/../storage/logs/test-scheduler.log';
Artisan::command('test:scheduler', function () use ($testSchedulerLogPath) {
    shell_exec('touch ' . $testSchedulerLogPath);
    $this->comment(Inspiring::quote());
})
    ->purpose('Display an inspiring quote')
    ->appendOutputTo($testSchedulerLogPath)
    ->runInBackground()
    ->withoutOverlapping()
    ->environments(['development'])
    ->everyFiveMinutes();
