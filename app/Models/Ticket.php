<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ticket extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'ticket_id',
        'user_id',
        'subject',
        'description',
        'status',
        'priority',
        'assigned_to',
        'resolved_at',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Status constants
    public const STATUS_OPEN = 'open';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_CLOSED = 'closed';
    public const STATUS_PENDING = 'pending';

    // Priority constants
    public const PRIORITY_LOW = 'low';
    public const PRIORITY_MEDIUM = 'medium';
    public const PRIORITY_HIGH = 'high';
    public const PRIORITY_RISKY = 'risky';

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($ticket) {
            if (!$ticket->ticket_id) {
                $ticket->ticket_id = 'TIC-' . str_pad(
                    static::withTrashed()->count() + 1,
                    3,
                    '0',
                    STR_PAD_LEFT
                );
            }
        });
    }

    public function getRouteKeyName()
    {
        return 'ticket_id';
    }

    /**
     * Get the user who created the ticket
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the admin assigned to the ticket
     */
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'assigned_to');
    }

    /**
     * Get the ticket messages
     */
    public function messages(): HasMany
    {
        return $this->hasMany(TicketMessage::class);
    }

    /**
     * Get the latest message
     */
    public function latestMessage()
    {
        return $this->hasOne(TicketMessage::class)->latestOfMany();
    }

    /**
     * Scope for filtering by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for filtering by priority
     */
    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Get ticket stats
     */
    public static function getStats()
    {
        return [
            'total' => static::count(),
            'open' => static::where('status', static::STATUS_OPEN)->count(),
            'in_progress' => static::where('status', static::STATUS_IN_PROGRESS)->count(),
            'closed' => static::where('status', static::STATUS_CLOSED)->count(),
            'high_priority' => static::where('priority', static::PRIORITY_HIGH)->count(),
            'avg_response_time' => static::getAverageResponseTime(),
            'resolved_today' => static::where('status', static::STATUS_CLOSED)
                ->whereDate('resolved_at', today())
                ->count(),
            'satisfaction_rate' => static::getCustomerSatisfactionRate(),
        ];
    }

    /**
     * Calculate average response time
     */
    public static function getAverageResponseTime()
    {
        // This is a simplified calculation - in real implementation, 
        // you'd calculate based on first response time
        $closedTickets = static::where('status', static::STATUS_CLOSED)
            ->whereNotNull('resolved_at')
            ->get();

        if ($closedTickets->isEmpty()) {
            return '0hr';
        }

        $totalHours = $closedTickets->sum(function ($ticket) {
            return $ticket->created_at->diffInHours($ticket->resolved_at);
        });

        $avgHours = round($totalHours / $closedTickets->count(), 1);
        return $avgHours . 'hr';
    }

    /**
     * Calculate average response time for a specific period
     */
    public static function getAverageResponseTimeForPeriod($fromDate)
    {
        $closedTickets = static::where('status', static::STATUS_CLOSED)
            ->whereNotNull('resolved_at')
            ->where('created_at', '>=', $fromDate)
            ->get();

        if ($closedTickets->isEmpty()) {
            return '0hr';
        }

        $totalHours = $closedTickets->sum(function ($ticket) {
            return $ticket->created_at->diffInHours($ticket->resolved_at);
        });

        $avgHours = round($totalHours / $closedTickets->count(), 1);
        return $avgHours . 'hr';
    }

    /**
     * Calculate customer satisfaction rate
     */
    public static function getCustomerSatisfactionRate()
    {
        // This is a placeholder. In real implementation, you'd have a satisfaction survey table
        // For now, we'll calculate based on ticket resolution time and priority
        $totalTickets = static::where('status', static::STATUS_CLOSED)->count();
        
        if ($totalTickets == 0) {
            return 95; // Default high satisfaction
        }
        
        // Consider tickets resolved within reasonable time as satisfactory
        $quicklyResolvedTickets = static::where('status', static::STATUS_CLOSED)
            ->whereNotNull('resolved_at')
            ->get()
            ->filter(function ($ticket) {
                $resolutionTime = $ticket->created_at->diffInHours($ticket->resolved_at);
                // Consider quick resolution based on priority
                $threshold = match($ticket->priority) {
                    static::PRIORITY_HIGH, static::PRIORITY_RISKY => 4, // 4 hours
                    static::PRIORITY_MEDIUM => 12, // 12 hours
                    default => 24, // 24 hours
                };
                return $resolutionTime <= $threshold;
            })
            ->count();
        
        return round(($quicklyResolvedTickets / $totalTickets) * 100);
    }

    /**
     * Mark ticket as resolved
     */
    public function resolve()
    {
        $this->update([
            'status' => static::STATUS_CLOSED,
            'resolved_at' => now(),
        ]);
    }
}
