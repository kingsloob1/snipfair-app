<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Auth;
use App\Models\AdminNotification;
use Illuminate\Support\Str;

class AdminNotificationHelper
{
    public static function getRecentNotifications()
    {
        $user = Auth::guard('admin')->user();

        return AdminNotification::where('user_id', $user->id)
            ->latest()
            ->limit(3)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->priority,
                    'title' => $notification->title,
                    'description' => Str::limit($notification->description ?? '', 100),
                    'timestamp' => $notification->created_at->diffForHumans(),
                    'isUnread' => !$notification->is_seen,
                ];
            });
    }

    /**
     * Format priority level for frontend display
     *
     * @param string $priority
     * @return string
     */
    public static function formatPriority($priority)
    {
        switch (strtolower($priority)) {
            case 'low':
                return 'Low';
            case 'normal':
                return 'Medium';
            case 'moderate':
                return 'High';
            case 'critical':
                return 'Risky';
            default:
                return 'Medium';
        }
    }

    /**
     * Create notification for a user
     *
     * @param int $userId
     * @param string $type
     * @param string $title
     * @param string $description
     * @param string $priority
     * @return \App\Models\AdminNotification
     */
    public static function create($userId, $type, $title, $description = null, $priority = 'normal')
    {
        return AdminNotification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'description' => $description,
            'priority' => $priority,
            'is_seen' => false,
        ]);
    }

    /**
     * Mark notification as read
     *
     * @param int $notificationId
     * @param int $userId
     * @return bool
     */
    public static function markAsRead($notificationId, $userId)
    {
        return AdminNotification::where('id', $notificationId)
            ->where('user_id', $userId)
            ->update(['is_seen' => true]);
    }

    /**
     * Mark all notifications as read for a user
     *
     * @param int $userId
     * @return int
     */
    public static function markAllAsRead($userId)
    {
        return AdminNotification::where('user_id', $userId)
            ->update(['is_seen' => true]);
    }

    /**
     * Get unread notification count for a user
     *
     * @param int $userId
     * @return int
     */
    public static function getUnreadCount($userId)
    {
        return AdminNotification::where('user_id', $userId)
            ->where('is_seen', false)
            ->count();
    }
}
