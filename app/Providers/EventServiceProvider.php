<?php

namespace App\Providers;

use App\Events\AppointmentCreated;
use App\Events\AppointmentStatusUpdated;
use App\Listeners\ScheduleAppointmentReminderListener;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        AppointmentCreated::class => [
            ScheduleAppointmentReminderListener::class,
        ],
        AppointmentStatusUpdated::class => [
            ScheduleAppointmentReminderListener::class,
        ],
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        //
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
