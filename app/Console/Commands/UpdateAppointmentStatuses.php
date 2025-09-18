<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use Illuminate\Console\Command;
use Carbon\Carbon;

class UpdateAppointmentStatuses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'appointments:update-statuses';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update appointment statuses based on business logic';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->updateProcessingToPending();
        $this->updatePendingToApproved();
        $this->updateApprovedToConfirmed();
        
        $this->info('Appointment statuses updated successfully.');
    }

    /**
     * Update processing appointments to pending after 2 minutes
     */
    private function updateProcessingToPending()
    {
        $appointments = Appointment::where('status', 'processing')
            ->where('created_at', '<=', Carbon::now()->subMinutes(2))
            ->get();

        foreach ($appointments as $appointment) {
            $appointment->update(['status' => 'pending']);
            $this->info("Appointment {$appointment->id} moved from processing to pending");
        }
    }

    /**
     * Update pending appointments to approved after 3 minutes
     */
    private function updatePendingToApproved()
    {
        $appointments = Appointment::where('status', 'pending')
            ->where('updated_at', '<=', Carbon::now()->subMinutes(3))
            ->get();

        foreach ($appointments as $appointment) {
            $appointment->update(['status' => 'approved']);
            $this->info("Appointment {$appointment->id} moved from pending to approved");
        }
    }

    /**
     * Update approved appointments to confirmed after 2 minutes
     */
    private function updateApprovedToConfirmed()
    {
        $appointments = Appointment::where('status', 'approved')
            ->where('updated_at', '<=', Carbon::now()->subMinutes(2))
            ->get();

        foreach ($appointments as $appointment) {
            $appointment->update(['status' => 'confirmed']);
            $this->info("Appointment {$appointment->id} moved from approved to confirmed");
        }
    }
}
