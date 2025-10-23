<?php

namespace App\Http\Controllers\Stylist;

use App\Http\Controllers\Controller;
use App\Http\Controllers\StylistController;
use App\Models\Appointment;
use App\Events\AppointmentStatusUpdated;
use App\Helpers\AdminNotificationHelper;
use App\Helpers\NotificationHelper;
use App\Mail\AppointmentDisputeEmail;
use App\Mail\BookingSuccessfulCustomerEmail;
use App\Models\Admin;
use App\Models\AppointmentDispute;
use App\Models\AppointmentPouch;
use App\Models\AppointmentProof;
use App\Models\Transaction;
use App\Models\User;
use App\Models\WebsiteConfiguration;
use Carbon\Carbon;
use DateTime;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class AppointmentController extends Controller
{
    private $stylistController;

    public function __construct(StylistController $stylistController)
    {
        $this->stylistController = $stylistController;
    }

    public function index(Request $request)
    {
        $appointments = Appointment::where('stylist_id', $request->user()->id)
            ->whereIn('status', ['processing', 'pending', 'approved'])
            ->with([
                'customer' => function ($qb) {
                    return $qb->withTrashed();
                },
                'portfolio' => function ($qb) {
                    return $qb->withTrashed();
                },
                'portfolio.category'
            ])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($appointment) {
                return [
                    'appointment' => $appointment->id,
                    'name' => $appointment->customer->name,
                    'stylist_id' => $appointment->stylist_id,
                    'customer_id' => $appointment->customer_id,
                    'service' => $appointment->portfolio?->category?->name ?? 'None',
                    'amount' => (float) $appointment->amount,
                    'status' => $appointment->status,
                    'date' => $appointment->created_at->format('M j, Y'),
                    'time' => $appointment->created_at->format('g:i A') . ' (' . $appointment->created_at->diffForHumans() . ')',
                    'imageUrl' => $appointment->customer->avatar ?? null,
                ];
            });

        $todayEarnings = $request->user()->transactions()
            ->whereBetween('created_at', $this->getRanges('daily'))
            ->where('type', 'earning')
            ->where('status', 'completed')
            ->sum('amount') ?? 0;
        $appointmentsCount = $request->user()->stylistAppointments()
            ->whereBetween('created_at', $this->getRanges('daily'))
            ->where('status', 'confirmed')
            ->count();
        $appointmentsPending = $request->user()->stylistAppointments()
            ->whereBetween('created_at', $this->getRanges('daily'))
            ->where('status', 'pending')
            ->count();

        return Inertia::render('Stylist/Appointments/Index', [
            'appointments' => $appointments,
            'statistics' => [
                'today_earnings' => $todayEarnings,
                'today_appointments' => $appointmentsCount,
                'total_requests' => $appointmentsPending,
            ],
        ]);
    }

    public function fullSchedules(Request $request)
    {
        $appointments = Appointment::where('stylist_id', $request->user()->id)->with([
            'customer' => function ($qb) {
                return $qb->withTrashed();
            },
            'portfolio' => function ($qb) {
                return $qb->withTrashed();
            },
            'portfolio.category'
        ])->orderBy('created_at', 'desc')->get()->map(function ($appointment) {
            return [
                'name' => $appointment->customer->name,
                'service' => $appointment->portfolio?->category?->name ?? 'None',
                'amount' => (float) $appointment->amount,
                'status' => $appointment->status,
                'date' => $appointment->created_at->format('M j, Y'),
                'time' => $appointment->created_at->format('g:i A') . ' (' . $appointment->created_at->diffForHumans() . ')',
                'imageUrl' => $appointment->customer->avatar ?? null,
                'appointment' => $appointment->id,
                'stylist_id' => $appointment->stylist_id,
                'customer_id' => $appointment->customer_id,
            ];
        });
        return Inertia::render('Stylist/Schedules/FullSchedules', [
            'appointments' => $appointments,
        ]);
    }

    public function getSchedules(Request $request)
    {
        $user = $request->user();

        $schedules = $user->stylistSchedules()
            ->with('slots')
            ->get()
            ->map(function ($schedule) {
                return [
                    'day' => ucfirst($schedule->day),
                    'available' => $schedule->available,
                    'timeSlots' => $schedule->slots->map(function ($slot) {
                        return [
                            'id' => $slot->id,
                            'from' => Carbon::parse($slot->from)->format('H:i'),
                            'to' => Carbon::parse($slot->to)->format('H:i'),
                        ];
                    }),
                ];
            });

        return Inertia::render('Stylist/Appointments/Availability', [
            'stylist_schedules' => $schedules,
            'settings' => [
                'use_location' => $user->use_location ?? false,
                'country' => $user->country ?? '',
            ],
        ]);
    }

    public function updateSchedules(Request $request)
    {
        $user = $request->user();
        $messages = [
            'schedules.*.timeSlots.*.id.required' => 'Each time slot must have a valid ID.',
            'schedules.*.timeSlots.*.from.required' => 'Each time slot must have a start time.',
            'schedules.*.timeSlots.*.to.after' => 'The end time must be after the start time.',
        ];

        $data = $request->validate([
            'schedules' => 'required|array',
            'schedules.*.day' => [
                'required',
                'string',
                Rule::in(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
            ],
            'schedules.*.available' => 'required|boolean',
            'schedules.*.timeSlots' => 'nullable|array',
            'schedules.*.timeSlots.*.id' => 'required',
            'schedules.*.timeSlots.*.from' => 'required|date_format:H:i',
            'schedules.*.timeSlots.*.to' => 'required|date_format:H:i|after:schedules.*.timeSlots.*.from',
        ], $messages);

        foreach ($data['schedules'] as $dayData) {
            $schedule = $user->stylistSchedules()->where('day', strtolower($dayData['day']))->first();
            if ($schedule) {
                $schedule->update(['available' => $dayData['available']]);
                $schedule->slots()->delete();
                if (isset($dayData['timeSlots']) && is_array($dayData['timeSlots']) && !empty($dayData['timeSlots'])) {
                    foreach ($dayData['timeSlots'] as $slot) {
                        try {
                            $schedule->slots()->create([
                                'from' => $slot['from'] . ':00', // Add seconds if needed
                                'to' => $slot['to'] . ':00',     // Add seconds if needed
                            ]);
                        } catch (\Exception $e) {
                            Log::error('Failed to create slot', [
                                'error' => $e->getMessage(),
                                'slot' => $slot,
                                'schedule_id' => $schedule->id
                            ]);
                        }
                    }
                } else {
                    Log::info('No timeSlots to process for day: ' . $dayData['day']);
                }
            } else {
                Log::warning('Schedule not found for day: ' . $dayData['day']);
            }
        }

        return back()->with('success', 'Schedule updated successfully.');
    }

    public function getCalendar(Request $request)
    {
        $user = $request->user();
        $appointments = $user->stylistAppointments()->with([
            'customer' => function ($qb) {
                return $qb->withTrashed();
            },
            'portfolio' => function ($qb) {
                return $qb->withTrashed();
            },
            'portfolio.category'
        ])
            ->get();

        $formatted = [];

        foreach ($appointments as $appointment) {
            // $startTime = Carbon::parse($appointment->created_at);
            $startTime = Carbon::parse(
                $appointment->appointment_date . ' ' . $appointment->appointment_time
            );
            $durationInHours = (float) str_replace(['h', 'hr', 'hrs'], '', strtolower($appointment->duration));
            $endTime = (clone $startTime)->addHours((int) $durationInHours);

            // Determine color
            $color = in_array($appointment->status, ['completed', 'canceled', 'escalated']) ? 'purple' : 'orange';

            // Format record
            $dateKey = $startTime->format('Y-m-d');

            $formatted[$dateKey][] = [
                'id' => (string) $appointment->id,
                'title' => $appointment->portfolio?->category?->name ?? 'None',
                'startTime' => $startTime->format('h:i A'),
                'endTime' => $endTime->format('h:i A'),
                'color' => $color,
                'date' => $dateKey,
                'recipient' => optional($appointment->customer)->name,
            ];
        }

        return Inertia::render('Stylist/Appointments/Calendar', [
            'events' => $formatted,
        ]);
    }


    private function getRanges($range)
    {
        switch ($range) {
            case 'daily':
                return [now()->startOfDay(), now()->endOfDay()];
            case 'weekly':
                return [now()->startOfWeek(Carbon::SUNDAY), now()->endOfWeek(Carbon::SATURDAY)];
            case 'monthly':
                return [now()->startOfMonth(), now()->endOfMonth()];
            case 'yearly':
                return [now()->startOfYear(), now()->endOfYear()];
            default:
                return null;
        }
    }

    public function appointment(Request $request, $id)
    {
        $appointment = Appointment::with([
            'customer' => function ($qb) {
                return $qb->withTrashed();
            },
            'stylist' => function ($qb) {
                return $qb->withTrashed();
            },
            'stylist.stylist_profile',
            'portfolio' => function ($qb) {
                return $qb->withTrashed();
            },
            'portfolio.category',
            'customer.location_service'
        ])
            ->where('id', $id)
            ->firstOrFail();

        if ($appointment->status === 'processing') {
            return back()->with('warning', 'Appointment details are still being confirmed, try again in a few seconds.');
        }

        $locationService = $appointment->customer->location_service;
        $targetLocationService = $appointment->stylist->location_service;
        if (!$locationService || !$locationService->hasLocation() || !$targetLocationService || !$targetLocationService->hasLocation()) {
            $distance = null;
        } else {
            $distance = $locationService->distanceTo($targetLocationService);
            $distance = $distance !== null ? round($distance, 2) . 'km away' : null;
        }

        $appointment_details = [
            'orderTime' => $appointment->created_at->format('M j, Y'),
            'bookingId' => $appointment->booking_id,
            'beautician' => [
                'id' => $appointment->stylist->id,
                'name' => $appointment->stylist->name,
                'avatar' => $appointment->stylist->avatar ?? null,
            ],
            'customer' => [
                'id' => $appointment->customer->id,
                'name' => $appointment->customer->name,
                'avatar' => $appointment->customer->avatar ?? null,
            ],
            'date' => friendly_date_label($appointment->appointment_date),
            'day' => (new DateTime($appointment->appointment_date))->format('M j'),
            'distance' => $distance,
            'time' => Carbon::createFromFormat('H:i:s', $appointment->appointment_time)->format('g:i A'),
            'duration' => $appointment->duration,
            'location' => $appointment->customer->country ?? 'Not specified',
            'phone' => $appointment->customer->phone ?? 'Not provided',
            'total_appointments' => $appointment->customer->customerAppointments()->count() ?? 0,
            'total_cancellations' => $appointment->customer->customerAppointments()->where('status', 'canceled')->count() ?? 0,
            'total_no_show_rate' => $appointment->customer->customerAppointments()->where('status', 'escalated')->count() ?? 0,
        ];

        return Inertia::render('Stylist/Appointments/Appointment', [
            'appointment' => $appointment,
            'appointment_details' => $appointment_details,
        ]);
    }

    public function getAppointment(Request $request, $appointmentId)
    {
        $appointment = Appointment::with([
            'customer' => function ($qb) {
                return $qb->withTrashed();
            },
            'stylist' => function ($qb) {
                return $qb->withTrashed();
            },
            'stylist.stylist_profile',
            'portfolio' => function ($qb) {
                return $qb->withTrashed();
            },
            'portfolio.category',
            'customer.location_service',
            'proof',
            'disputes'
        ])
            ->where('id', $appointmentId)
            ->firstOrFail();

        $appointment->first_dispute = $appointment->disputes()->exists() ? $appointment->disputes()->first() : null;

        return response()->json([
            'success' => true,
            'appointment' => $appointment,
        ]);
    }

    public function forms(Request $request, $appointmentId)
    {
        $validated = $request->validate([
            'variant' => 'required|string|in:dispute,proof',
            'customer' => 'required|string|max:255',
            'comment' => 'required|string',
            'images' => 'required|array|max:10',
            'images.*' => 'file|mimes:jpg,jpeg,png|max:5120',
        ]);

        $imagePaths = [];

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $imagePaths[] = $file->store('works/' . $request->variant, 'public');
            }
        }

        if ($request->variant === 'dispute') {
            $appointment = Appointment::findOrFail($appointmentId);
            $task = AppointmentDispute::create([
                'appointment_id' => $appointment->id,
                'customer_id' => $appointment->customer_id,
                'stylist_id' => $appointment->stylist_id,
                'from' => 'stylist',
                'comment' => $validated['comment'],
                'image_urls' => $imagePaths,
                'status' => 'open',
                'priority' => 'low',
                'ref_id' => $appointment->id,
                'resolution_amount' => $appointment->amount,
            ]);
            $appointment->update(['status' => 'escalated']);
            Mail::to('admin@snipfair.com')->send(new AppointmentDisputeEmail(
                dispute: $task,
                appointment: $appointment,
                recipient: null, // admin doesn't need recipient object
                recipientType: 'admin'
            ));
            $superAdmins = Admin::where('role', 'super-admin')
                ->where('is_active', true)
                ->get();

            foreach ($superAdmins as $admin) {
                AdminNotificationHelper::create(
                    $admin->id,
                    route('admin.disputes.show', $task->id),
                    'New Dispute from ' . $appointment->stylist->name,
                    "Email: {$appointment->stylist->email}\nMessage: " . substr($validated['comment'], 0, 100) . '...',
                    'normal'
                );
            }

        } else if ($request->variant === 'proof') {
            $task = AppointmentProof::create([
                'appointment_id' => $appointmentId,
                'user_id' => $request->user()->id,
                'comment' => $validated['comment'],
                'media_urls' => $imagePaths,
            ]);
        }

        if ($task)
            return redirect()->route('stylist.dashboard')->with('message', 'Request created successfully!');
        else
            return back()->with('message', 'Something went wrong');
    }

    public function approveAppointment(Request $request)
    {
        $request->validate([
            'appointment_id' => 'required|exists:appointments,id',
            'status' => 'required|in:approved,rejected',
            'stylist_note' => 'nullable|string',
        ]);

        $stylist = $request->user();
        $appointment = Appointment::with([
            'customer' => function ($qb) {
                return $qb->withTrashed();
            },
            'stylist' => function ($qb) {
                return $qb->withTrashed();
            },
            'stylist.stylist_profile',
            'portfolio' => function ($qb) {
                return $qb->withTrashed();
            }
        ])
            ->where('stylist_id', $stylist->id)
            ->where('status', 'pending')
            ->findOrFail($request->appointment_id);

        $previousStatus = $appointment->status;

        if ($request->status === 'approved') {
            $appointment->update([
                'status' => 'approved',
                'stylist_note' => $request->stylist_note,
            ]);

            broadcast(new AppointmentStatusUpdated($appointment, $previousStatus));

            return response()->json([
                'success' => true,
                'message' => 'Appointment approved successfully.',
            ]);
        } else {
            $appointment->update([
                'status' => 'canceled',
                'stylist_note' => $request->stylist_note,
            ]);

            // Refund customer
            $appointment->customer->update([
                'balance' => $appointment->customer->balance + $appointment->amount
            ]);

            // Create refund transaction
            \App\Models\Transaction::create([
                'user_id' => $appointment->customer_id,
                'appointment_id' => $appointment->id,
                'amount' => $appointment->amount,
                'type' => 'refund',
                'status' => 'completed',
                'reference' => 'REF-' . time(),
            ]);

            broadcast(new AppointmentStatusUpdated($appointment, $previousStatus));

            return response()->json([
                'success' => true,
                'message' => 'Appointment rejected. Customer has been refunded.',
            ]);
        }
    }

    public function confirmMeetup(Request $request)
    {
        $request->validate([
            'appointment_id' => 'required|exists:appointments,id',
            'appointment_code' => 'required|string',
        ]);

        $stylist = $request->user();
        $appointment = Appointment::with([
            'customer' => function ($qb) {
                return $qb->withTrashed();
            },
            'stylist' => function ($qb) {
                return $qb->withTrashed();
            },
            'stylist.stylist_profile',
            'portfolio' => function ($qb) {
                return $qb->withTrashed();
            },
        ])
            ->where('stylist_id', $stylist->id)
            ->where('status', 'approved')
            ->findOrFail($request->appointment_id);

        if ($appointment->appointment_code !== $request->appointment_code) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid appointment code.',
            ], 400);
        }

        $previousStatus = $appointment->status;
        $appointment->update(['status' => 'confirmed']);

        broadcast(new AppointmentStatusUpdated($appointment, $previousStatus));

        return response()->json([
            'success' => true,
            'message' => 'Appointment confirmed. Service can begin.',
            'completion_code' => $appointment->completion_code,
        ]);
    }

    public function completeAppointment(Request $request)
    {
        $request->validate([
            'appointment_id' => 'required|exists:appointments,id',
            'completion_code' => 'required|string',
            'service_notes' => 'nullable|string',
        ]);

        $stylist = $request->user();
        $appointment = Appointment::with([
            'customer' => function ($qb) {
                return $qb->withTrashed();
            },
            'stylist' => function ($qb) {
                return $qb->withTrashed();
            },
            'stylist.stylist_profile',
            'portfolio' => function ($qb) {
                return $qb->withTrashed();
            },
        ])
            ->where('stylist_id', $stylist->id)
            ->where('status', 'confirmed')
            ->findOrFail($request->appointment_id);

        if ($appointment->completion_code !== $request->completion_code) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid completion code.',
            ], 400);
        }

        $previousStatus = $appointment->status;
        $appointment->update([
            'status' => 'completed',
            'service_notes' => $request->service_notes,
            'completed_at' => now(),
        ]);

        // Create earning transaction for stylist
        \App\Models\Transaction::create([
            'user_id' => $stylist->id,
            'appointment_id' => $appointment->id,
            'amount' => $appointment->amount * 0.85, // 85% goes to stylist
            'type' => 'earning',
            'status' => 'completed',
            'reference' => 'EARN-' . time(),
        ]);

        // Update stylist balance
        $stylist->update([
            'balance' => $stylist->balance + ($appointment->amount * 0.85)
        ]);

        broadcast(new AppointmentStatusUpdated($appointment, $previousStatus));

        return response()->json([
            'success' => true,
            'message' => 'Appointment completed successfully.',
        ]);
    }

    public function getPendingAppointments(Request $request)
    {
        $stylist = $request->user();
        $appointments = Appointment::with([
            'customer' => function ($qb) {
                return $qb->withTrashed();
            },
            'stylist' => function ($qb) {
                return $qb->withTrashed();
            },
            'stylist.stylist_profile',
            'portfolio' => function ($qb) {
                return $qb->withTrashed();
            },
        ])
            ->where('stylist_id', $stylist->id)
            ->where('status', 'pending')
            ->latest()
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'booking_id' => $appointment->booking_id,
                    'customer_name' => $appointment->customer->name,
                    'customer_email' => $appointment->customer->email,
                    'portfolio_title' => $appointment->portfolio?->title ?? '',
                    'amount' => $appointment->amount,
                    'appointment_date' => $appointment->appointment_date,
                    'appointment_time' => $appointment->appointment_time,
                    'created_at' => $appointment->created_at->diffForHumans(),
                ];
            });

        return response()->json([
            'success' => true,
            'appointments' => $appointments,
        ]);
    }

    public function updateLocation(Request $request)
    {
        $request->validate([
            'use_location' => 'required|boolean',
            'country' => 'nullable|string|max:200',
        ]);

        $user = $request->user();
        $user->update([
            'use_location' => $request->use_location,
            'country' => $request->country,
        ]);

        if (!$user->location_service) {
            $user->location_service()->create();
        }

        return redirect()->back()->with('success', 'Location settings updated successfully.');
    }

    public function updateAppointmentAvailability(Request $request)
    {
        $user = $request->user();
        $stylist = $user->stylist_profile;

        if (!$user || !$stylist) {
            abort(403, 'Access Denied');
        }

        $validatorMessages = [
            'schedules.*.timeSlots.*.id.required' => 'Each time slot must have a valid ID.',
            'schedules.*.timeSlots.*.from.required' => 'Each time slot must have a start time.',
            'schedules.*.timeSlots.*.to.after' => 'The end time must be after the start time.',
        ];

        $validated = $request->validate([
            'is_available' => 'sometimes|boolean',
            'schedules' => 'sometimes|array',
            'schedules.*.day' => [
                'required',
                'string',
                Rule::in(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
            ],
            'schedules.*.available' => 'required|boolean',
            'schedules.*.timeSlots' => 'nullable|array',
            'schedules.*.timeSlots.*.from' => 'required|date_format:H:i',
            'schedules.*.timeSlots.*.to' => 'required|date_format:H:i|after:schedules.*.timeSlots.*.from',
        ], $validatorMessages);

        $user = $request->user();
        $stylist = $user->stylist_profile;

        if (Arr::has($validated, 'is_available')) {
            $isAvailable = Arr::get($validated, 'is_available', false);

            //Ensure stylist can only be available when fully approved
            if ($isAvailable) {
                $profileCompleteNess = $this->stylistController->checkProfileCompleteness($user, true);

                if (!collect($profileCompleteNess)->every($profileCompleteNess, fn($val) => !!$val)) {
                    throw ValidationException::withMessages([
                        'profile' => 'Kindly complete your stylist profile to be available for jobs'
                    ]);
                }

                if ($stylist->status !== 'approved') {
                    throw ValidationException::withMessages([
                        'profile' => 'Kindly ensure your stylist profile is approved to continue'
                    ]);
                }
            }


            $stylist->is_available = $isAvailable;
            $stylist->save();
        }

        foreach ($validated['schedules'] as $dayData) {
            $schedule = $user->stylistSchedules()->where('day', strtolower($dayData['day']))->first();

            if ($schedule) {
                $schedule->update(['available' => $dayData['available']]);
                $schedule->slots()->delete();
                if (isset($dayData['timeSlots']) && is_array($dayData['timeSlots']) && !empty($dayData['timeSlots'])) {
                    foreach ($dayData['timeSlots'] as $slot) {
                        try {
                            $schedule->slots()->create([
                                'from' => $slot['from'] . ':00', // Add seconds if needed
                                'to' => $slot['to'] . ':00',     // Add seconds if needed
                            ]);
                        } catch (\Exception $e) {
                            Log::error('Failed to create slot', [
                                'error' => $e->getMessage(),
                                'slot' => $slot,
                                'schedule_id' => $schedule->id
                            ]);
                        }
                    }
                } else {
                    Log::info('No timeSlots to process for day: ' . $dayData['day']);
                }
            } else {
                Log::warning('Schedule not found for day: ' . $dayData['day']);
            }
        }

        return response()->noContent();
    }

    public function getAppointmentAvailability(Request $request)
    {
        $user = $request->user();
        $stylist = $user->stylist_profile;

        if (!$user || !$stylist) {
            abort(403, 'Access Denied');
        }

        $schedules = $user->stylistSchedules()->with(['slots'])->get()->all();

        return [
            'is_available' => $stylist->is_available,
            'schedules' => $schedules
        ];
    }

    public function getAppointmentList(Request $request)
    {
        $user = $request->user();
        $stylist = $user->stylist_profile;

        if (!$user || !$stylist) {
            abort(403, 'Access Denied');
        }

        $perPage = formatPerPage($request);

        $query = $request->query('query');
        $categoryId = $request->query('category_id');
        $customerId = $request->query('customer_id');
        $portfolio = $request->query('portfolio_id');
        $status = $request->query('status');
        $sortGroups = formatRequestSort($request, ['booking_id', 'amount', 'duration', 'status', 'id', 'created_at', 'appointment_date'], '-id');

        $queryBuilder = Appointment::where('stylist_id', '=', $user->id);

        if ($categoryId) {
            $queryBuilder = $queryBuilder->whereRelation('portfolio', 'category_id', '=', $categoryId);
        }

        if ($customerId) {
            $queryBuilder = $queryBuilder->where('customer_id', '=', $customerId);
        }

        if ($portfolio) {
            $queryBuilder = $queryBuilder->where('portfolio_id', '=', $portfolio);
        }

        if ($status) {
            $queryBuilder = $queryBuilder->where('status', '=', $status);
        }

        if ($query) {
            $queryBuilder = $queryBuilder->whereLike('booking_id', '%' . $query . '%', false);
        }

        foreach ($sortGroups as $sortGroup) {
            $queryBuilder = $queryBuilder->orderBy($sortGroup['property'], $sortGroup['direction']);
        }

        $list = $queryBuilder->with([
            'customer' => function ($qb) {
                return $qb->withTrashed();
            },
            'stylist' => function ($qb) {
                return $qb->withTrashed();
            },
            'portfolio' => function ($qb) {
                return $qb->withTrashed();
            },
            'portfolio.category',
        ])->cursorPaginate($perPage, ['*'], 'page');

        return $list;
    }

    public function getSpecificAppointment(Request $request, $appointmentId)
    {
        $user = $request->user();
        $stylist = $user->stylist_profile;

        if (!$user || !$stylist) {
            abort(403, 'Access Denied');
        }

        $appointment = Appointment::with([
            'customer' => function ($qb) {
                return $qb->withTrashed();
            },
            'stylist' => function ($qb) {
                return $qb->withTrashed();
            },
            'stylist.stylist_profile',
            'portfolio' => function ($qb) {
                return $qb->withTrashed();
            },
            'portfolio.category',
            'customer.location_service',
            'proof',
            'disputes'
        ])
            ->where('id', '=', $appointmentId)
            // ->where('stylist_id','=', $user->id)
            ->firstOrFail();

        return $appointment;
    }

    public function updateAppointment(Request $request)
    {
        $request->validate([
            'appointment_id' => 'required|exists:appointments,id',
            'verdict' => 'required|in:processing,pending,approved,rescheduled,confirmed,completed,canceled,escalated',
        ]);
        $user = $request->user();

        //approved,canceled
        $appointment = $user->stylistAppointments()->where('id', '=', $request->appointment_id)->firstOrFail();

        $config = WebsiteConfiguration::first();
        $comissionRate = $config->commission_rate ? ((float) $config->commission_rate) : 0;

        if ($request->verdict === 'approved') {
            if ($appointment->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Ooops.. You can only approve a pending appointment.',
                ], 400);
            }

            $totalAmountToStylist = (float) $appointment->amount;

            //Platform comission from the amount stylist made
            $platformComissionFromTotalAmountToStylist = $totalAmountToStylist * ($comissionRate / 100);

            //Actual amount to fund stylist
            $amountToFundStylist = $totalAmountToStylist - $platformComissionFromTotalAmountToStylist;

            AppointmentPouch::create([
                'appointment_id' => $appointment->id,
                'amount' => $amountToFundStylist,
                'status' => 'holding',
                'user_id' => $appointment->stylist_id,
            ]);

            Transaction::create([
                'user_id' => $appointment->stylist_id,
                'appointment_id' => $appointment->id,
                'amount' => $platformComissionFromTotalAmountToStylist,
                'type' => 'other',
                'status' => 'completed',
                'ref' => 'AdminApprovalCommission-' . time(),
                'description' => 'Commission for appointment approval',
            ]);

            $previousStatus = $appointment->status;
            $appointment->status = 'approved';
            $appointment->save();

            defer(function () use ($appointment, $previousStatus) {
                broadcast(new AppointmentStatusUpdated($appointment, $previousStatus));

                sendNotification(
                    $appointment->customer_id,
                    route('customer.appointment.show', $appointment->id),
                    'Appointment Approved',
                    'Your appointment with ' . $appointment->stylist->name . ' has been accepted.',
                    'normal',
                );

                Mail::to($appointment->customer->email)->send(new BookingSuccessfulCustomerEmail(
                    appointment: $appointment,
                    customer: $appointment->customer,
                    stylist: $appointment->stylist
                ));
            });
        } else if ($request->verdict === 'canceled') {
            if ($appointment->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Ooops.. You can only reject a pending appointment.',
                ], 400);
            }

            $previousStatus = $appointment->status;
            $appointment->status = 'canceled';
            $appointment->save();

            defer(function () use ($appointment, $previousStatus) {
                broadcast(new AppointmentStatusUpdated($appointment, $previousStatus));
            });

            // refund appoitment amount to customer
            User::query()
                ->where('id', '=', $appointment->customer_id)
                ->update(['balance' => DB::raw("balance + {$appointment->amount}")]);
        }

        return response()->json([
            'success' => true,
            'appointment' => $appointment,
            'message' => 'Appointment updated successfully.',
        ]);
    }

    public function update(Request $request, $appointmentId)
    {
        $request->validate([
            'variant' => 'required|in:confirmed,completed',
            'name' => 'required|exists:users,name',
            'code' => 'required|string',
        ]);

        $user = $request->user();
        $appointment = $user->stylistAppointments()->where('id', '=', $appointmentId)->firstOrFail();

        if ($request->variant === 'confirmed') {
            if ($appointment->status !== 'approved') {
                return back()->withErrors(['variant' => 'Ooops.. You can only confirm an approved appointment']);
            }

            if ($appointment->appointment_code != $request->code) {
                return back()->withErrors(['code' => 'Appointment confirmation code is invalid']);
            }

            $previousStatus = $appointment->status;
            $appointment->status = 'confirmed';
            $appointment->save();

            defer(function () use ($appointment, $previousStatus) {
                broadcast(new AppointmentStatusUpdated($appointment, $previousStatus));
            });
        } else if ($request->variant === 'completed') {
            if ($appointment->status !== 'confirmed') {
                return back()->withErrors(['variant' => 'Ooops.. You can only complete a confirmed appointment']);
            }

            if ($appointment->completion_code != $request->code) {
                return back()->withErrors(['code' => 'Appointment completion code is invalid']);
            }

            $appointment->transactions()->update(['status' => 'completed']);
            $previousStatus = $appointment->status;
            $appointment->status = 'completed';
            $appointment->save();

            defer(function () use ($appointment, $previousStatus) {
                broadcast(new AppointmentStatusUpdated($appointment, $previousStatus));
            });
        }

        return back()->with('success', 'Appointment updated successfully.');
    }

    public function updateSpecificAppointment(Request $request, $appointmentId)
    {
        $user = $request->user();
        $stylist = $user->stylist_profile;

        if (!$user || !$stylist) {
            abort(403, 'Access Denied');
        }

        $request->validate([
            'verdict' => 'required|in:confirm,approve,complete,reject',
            'code' => [
                Rule::requiredIf(in_array($request->verdict, ['confirm', 'complete'])),
                'string'
            ],
        ]);

        $appointment = $user->stylistAppointments()->where('id', '=', $appointmentId)->firstOrFail();

        $validator = Validator::make([], []);
        $config = WebsiteConfiguration::first();
        $comissionRate = $config->commission_rate ? ((float) $config->commission_rate) : 0;

        switch ($request->verdict) {
            case 'approve': {
                if ($appointment->status !== 'pending') {
                    $validator->errors()->add('verdict', 'Ooops.. You can only approve a pending appointment');
                    throw new ValidationException($validator);
                }

                $totalAmountToStylist = (float) $appointment->amount;

                //Platform comission from the amount stylist made
                $platformComissionFromTotalAmountToStylist = $totalAmountToStylist * ($comissionRate / 100);

                //Actual amount to fund stylist
                $amountToFundStylist = $totalAmountToStylist - $platformComissionFromTotalAmountToStylist;

                AppointmentPouch::create([
                    'appointment_id' => $appointment->id,
                    'amount' => $amountToFundStylist,
                    'status' => 'holding',
                    'user_id' => $appointment->stylist_id,
                ]);

                Transaction::create([
                    'user_id' => $appointment->stylist_id,
                    'appointment_id' => $appointment->id,
                    'amount' => $platformComissionFromTotalAmountToStylist,
                    'type' => 'other',
                    'status' => 'completed',
                    'ref' => 'AdminApprovalCommission-' . time(),
                    'description' => 'Commission for appointment approval',
                ]);

                $previousStatus = $appointment->status;
                $appointment->status = 'approved';
                $appointment->save();

                defer(function () use ($appointment, $previousStatus) {
                    broadcast(new AppointmentStatusUpdated($appointment, $previousStatus));

                    sendNotification(
                        $appointment->customer_id,
                        route('customer.appointment.show', $appointment->id),
                        'Appointment Approved',
                        'Your appointment with ' . $appointment->stylist->name . ' has been accepted.',
                        'normal',
                    );

                    Mail::to($appointment->customer->email)->send(new BookingSuccessfulCustomerEmail(
                        appointment: $appointment,
                        customer: $appointment->customer,
                        stylist: $appointment->stylist
                    ));
                });
                break;
            }

            case 'confirm': {
                if ($appointment->status !== 'approved') {
                    $validator->errors()->add('verdict', 'Ooops.. You can only confirm an approved appointment');
                    throw new ValidationException($validator);
                }

                if ($appointment->appointment_code != $request->code) {
                    $validator->errors()->add('code', 'Appointment confirmation code is invalid');
                    throw new ValidationException($validator);
                }


                $previousStatus = $appointment->status;
                $appointment->status = 'confirmed';
                $appointment->save();

                defer(function () use ($appointment, $previousStatus) {
                    broadcast(new AppointmentStatusUpdated($appointment, $previousStatus));
                });
                break;
            }

            case 'complete': {
                if ($appointment->status !== 'confirmed') {
                    $validator->errors()->add('verdict', 'Ooops.. You can only complete a confirmed appointment');
                    throw new ValidationException($validator);
                }

                if ($appointment->completion_code != $request->code) {
                    $validator->errors()->add('code', 'Appointment completion code is invalid');
                    throw new ValidationException($validator);
                }

                $appointment->transactions()->update(['status' => 'completed']);
                $previousStatus = $appointment->status;
                $appointment->status = 'completed';
                $appointment->save();

                defer(function () use ($appointment, $previousStatus) {
                    broadcast(new AppointmentStatusUpdated($appointment, $previousStatus));
                });
                break;
            }

            case 'reject': {
                if ($appointment->status !== 'pending') {
                    $validator->errors()->add('verdict', 'Ooops.. You can only reject a pending appointment');
                    throw new ValidationException($validator);
                }

                $previousStatus = $appointment->status;
                $appointment->status = 'canceled';
                $appointment->save();

                defer(function () use ($appointment, $previousStatus) {
                    broadcast(new AppointmentStatusUpdated($appointment, $previousStatus));
                });

                // refund appoitment amount to customer
                User::query()
                    ->where('id', '=', $appointment->customer_id)
                    ->update(['balance' => DB::raw("balance + {$appointment->amount}")]);
                break;
            }
        }

        return response()->noContent();
    }
}
