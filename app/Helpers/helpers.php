<?php

use App\Helpers\NotificationHelper;
use App\Models\User;
use Carbon\Carbon;
use App\Models\WebsiteConfiguration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\URL;

if (!function_exists('getSlug')) {
    function getSlug($userId)
    {
        $transformed = ($userId * 7919) + 1000001;

        // Convert to base36 for shorter, URL-friendly string
        $code = base_convert($transformed, 10, 36);

        return strtolower($code);
    }
}

if (!function_exists('decodeSlug')) {
    function decodeSlug($slug)
    {
        $transformed = base_convert($slug, 36, 10);
        $originalId = ($transformed - 1000001) / 7919;

        return is_numeric($originalId) && $originalId > 0 ? (int) $originalId : false;
    }
}

if (!function_exists('getAvatar')) {
    function getAvatar($user)
    {
        if (!$user) {
            return 'NA';
        }

        if (!empty($user->avatar)) {
            return asset('storage/' . $user->avatar);
        }

        $words = explode(' ', $user->name);
        $initials = strtoupper(
            count($words) >= 2
            ? substr($words[0], 0, 1) . substr($words[1], 0, 1)
            : substr($user->name, 0, 2)
        );

        return $initials;
    }
}

if (!function_exists('friendly_date_label')) {
    function friendly_date_label(string $date): string
    {
        $date = Carbon::createFromFormat('Y-m-d', $date)->startOfDay();
        $today = Carbon::today();

        if ($date->isToday()) {
            return 'Today';
        } elseif ($date->isTomorrow()) {
            return 'Tomorrow';
        } elseif ($date->isYesterday()) {
            return 'Yesterday';
        }

        // Week checks
        if ($date->isSameWeek($today->copy()->subWeek())) {
            return 'Last week';
        } elseif ($date->isSameWeek($today->copy()->addWeek())) {
            return 'Next week';
        }

        // Month checks
        if ($date->isSameMonth($today->copy()->subMonth())) {
            return 'Last month';
        } elseif ($date->isSameMonth($today->copy()->addMonth())) {
            return 'Next month';
        }

        // Year checks
        if ($date->isSameYear($today->copy()->subYear())) {
            return 'Last year';
        } elseif ($date->isSameYear($today->copy()->addYear())) {
            return 'Next year';
        }

        // If within 7 days and same week, show day name
        if ($date->isSameWeek($today)) {
            return $date->format('l'); // "Sunday", "Monday", etc.
        }

        // Default fallback
        return $date->format('M j, Y'); // "Jun 11, 2025"
    }
}

if (!function_exists('getAdminConfig')) {
    /**
     * Get a configuration value from the AdminConfiguration model.
     *
     * @param string|null $key
     * @return mixed
     */
    function getAdminConfig($key = null)
    {
        // Use static variable to cache the result
        static $adminConfig = null;

        // Fetch the configuration from the database only once
        if ($adminConfig === null) {
            $adminConfig = WebsiteConfiguration::first();
        }

        // If a specific key is requested, return that value
        if ($key) {
            return $adminConfig->$key ?? null;
        }

        // Otherwise, return the full configuration object
        return $adminConfig;
    }
}

if (!function_exists('calculateStylistAvailability')) {
    /**
     * Get the availability status of a stylist.
     *
     * @param \App\Models\User $stylist
     * @return array
     */
    function calculateStylistAvailability(User $stylist)
    {
        // Calculate availability based on online status
        $availability = 'Available Later';
        if ($stylist->isOnline()) {
            $availability = 'Online Now';
        } elseif ($stylist->last_login_at && $stylist->last_login_at->diffInHours(now()) < 24) {
            $availability = 'Today';
        } elseif ($stylist->last_login_at && $stylist->last_login_at->diffInDays(now()) < 2) {
            $availability = 'Tomorrow';
        } elseif ($stylist->last_login_at && $stylist->last_login_at->diffInDays(now()) < 7) {
            $availability = 'This Week';
        }

        // Calculate response time based on online status and recent activity
        $response_time = '3+ hours';
        if ($stylist->isOnline()) {
            $response_time = '5-10 mins';
        } elseif ($stylist->last_login_at && $stylist->last_login_at->diffInHours(now()) < 6) {
            $response_time = '15-30 mins';
        } elseif ($stylist->last_login_at && $stylist->last_login_at->diffInHours(now()) < 24) {
            $response_time = '1-2 hours';
        }

        // Calculate next available time slot
        $next_available = getNextAvailableSlot($stylist);

        return [
            'availability' => $availability,
            'response_time' => $response_time,
            'next_available' => $next_available,
        ];
    }
}

if (!function_exists('getNextAvailableSlot')) {
    /**
     * Get the next available time slot for a stylist.
     *
     * @param \App\Models\User $stylist
     * @return string
     */
    function getNextAvailableSlot($stylist)
    {
        $today = now();
        $daysToCheck = 7; // Check up to 7 days ahead

        // Get stylist's existing appointments
        $existingAppointments = $stylist->stylistAppointments()
            ->whereIn('status', ['approved', 'confirmed'])
            ->where('appointment_date', '>=', $today->format('Y-m-d'))
            ->get()
            ->groupBy('appointment_date');

        // Get stylist's schedule
        $schedules = $stylist->stylistSchedules()
            ->where('available', true)
            ->whereHas('slots')
            ->with('slots')
            ->get()
            ->keyBy(function ($schedule) {
                return strtolower($schedule->day);
            });

        // Check each day for availability
        for ($i = 0; $i < $daysToCheck; $i++) {
            $checkDate = $today->copy()->addDays($i);
            $dayName = strtolower($checkDate->format('l'));

            if (!isset($schedules[$dayName])) {
                continue; // No schedule for this day
            }

            $schedule = $schedules[$dayName];
            $dateString = $checkDate->format('Y-m-d');
            $dayAppointments = $existingAppointments->get($dateString, collect());

            // Get the earliest available slot for this day
            foreach ($schedule->slots as $slot) {
                $slotStart = Carbon::parse($checkDate->format('Y-m-d') . ' ' . $slot->from);

                // Skip past time slots for today
                if ($checkDate->isToday() && $slotStart->lt(now())) {
                    continue;
                }

                // Check if this slot is available (no conflicting appointments)
                $isAvailable = true;
                foreach ($dayAppointments as $appointment) {
                    $appointmentStart = Carbon::parse($appointment->appointment_date . ' ' . $appointment->appointment_time);
                    $durationHours = (float) str_replace(['h', 'hr', 'hrs'], '', strtolower($appointment->duration));
                    $appointmentEnd = $appointmentStart->copy()->addHours($durationHours);

                    if ($slotStart->between($appointmentStart, $appointmentEnd, false)) {
                        $isAvailable = false;
                        break;
                    }
                }

                if ($isAvailable) {
                    if ($checkDate->isToday()) {
                        return 'Today ' . $slotStart->format('g:i A');
                    } elseif ($checkDate->isTomorrow()) {
                        return 'Tomorrow ' . $slotStart->format('g:i A');
                    } else {
                        return $checkDate->format('M j') . ' ' . $slotStart->format('g:i A');
                    }
                }
            }
        }

        return 'Contact for availability';
    }
}

if (!function_exists('formatCount')) {
    function formatCount($number)
    {
        if ($number >= 1000000) {
            return [
                'count' => (int) ($number / 1000000),
                'unit' => 'M+'
            ];
        } elseif ($number >= 1000) {
            return [
                'count' => (int) ($number / 1000),
                'unit' => 'K+'
            ];
        } elseif ($number > 100) {
            return [
                'count' => $number,
                'unit' => '+'
            ];
        } else {
            return [
                'count' => $number,
                'unit' => ''
            ];
        }
    }
}

if (!function_exists('sendNotification')) {
    function sendNotification($userId, $type, $title, $message, $priority = 'normal')
    {
        NotificationHelper::create(
            $userId,
            $type,
            $title,
            $message,
            $priority
        );
    }
}

if (!function_exists('formatStoredFilePath')) {
    function formatStoredFilePath($filePathOrUrl)
    {
        if (!is_string($filePathOrUrl)) {
            return '';
        }

        $disk = Storage::disk('public');
        $validPath = '';

        if (!$validPath && Str::isUrl($filePathOrUrl, ['http', 'https'])) {
            $storageBaseUrl = Url::to('/storage');
            $filePathOrUrl = Str::replaceFirst($storageBaseUrl, '', $filePathOrUrl);
        }

        if ($disk->exists($filePathOrUrl)) {
            $validPath = $filePathOrUrl;
        }

        if (!$validPath && Str::startsWith($filePathOrUrl, '/storage')) {
            $replacedPath = Str::replaceFirst('/storage', '', $filePathOrUrl);

            if ($disk->exists($replacedPath)) {
                $validPath = $replacedPath;
            }
        }

        if (!$validPath && Str::startsWith($filePathOrUrl, 'storage/')) {
            $replacedPath = Str::replaceFirst('storage/', '', $filePathOrUrl);

            if ($disk->exists($replacedPath)) {
                $validPath = $replacedPath;
            }
        }

        $fileInfo = new SplFileInfo($filePathOrUrl);
        $filePath = $fileInfo->getRealPath();
        if (!$validPath && $fileInfo->isFile() && $filePath) {
            $storageBasePath = storage_path('app/public');
            $validPath = Str::replaceFirst($storageBasePath, '', $filePath);
        }

        if ($validPath && Str::startsWith($validPath, '/')) {
            //Remove prefixed back slash
            $validPath = substr($validPath, 1);
        }

        return $validPath;
    }
}

if (!function_exists('formatPerPage')) {
    function formatPerPage(Request $request)
    {
        $sentPerPage = $request->query('per_page', 20);
        $perPage = 20;
        if (!is_numeric($sentPerPage)) {
            $perPage = 20;
        } else {
            $perPage = (int) $sentPerPage;
        }

        if ($perPage > 50) {
            $perPage = 50;
        }

        if ($perPage < 5) {
            $perPage = 5;
        }

        return $perPage;
    }
}

if (!function_exists('getDateRanges')) {
    function getDateRanges(string $range)
    {
        switch ($range) {
            case 'weekly':
                return [now()->startOfWeek(Carbon::SUNDAY), now()->endOfWeek(Carbon::SATURDAY)];
            case 'monthly':
                return [now()->startOfMonth(), now()->endOfMonth()];
            case 'yearly':
                return [now()->startOfYear(), now()->endOfYear()];
            case 'daily':
            default:
                return [now()->startOfDay(), now()->endOfDay()];
        }
    }
}

if (!function_exists('formatRequestSort')) {
    function formatRequestSort(Request $request, array $fields, string $default = '')
    {
        return Str::of($request->query('sort') ?? $default)->squish()->split('/[\s,]+/')->map(function ($value) {
            $value = Str::squish($value);
            $startsWithMinus = Str::startsWith($value, '-');
            $startsWithPlus = Str::startsWith($value, '+');
            $isDescending = $startsWithMinus;
            $property = ($startsWithMinus || $startsWithPlus) ? substr($value, 1) : $value;

            return [
                'property' => $property,
                'direction' => $isDescending ? 'DESC' : 'ASC'
            ];
        })->where(function ($value) use ($fields) {
            return in_array($value['property'], $fields);
        })->all();
    }
}
