<?php

namespace App\Http\Controllers;

use App\Models\Like;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Helpers\NotificationHelper;
use App\Models\Conversation;
use Inertia\Inertia;

class LikeController extends Controller
{
    /**
     * Toggle like/unlike for an item (stylist_profile, portfolio, tutorial)
     */
    public function toggle(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|in:profile,portfolio,tutorial,stylist,user',
            'type_id' => 'required|numeric|exists:' . $this->getTableName($request->type) . ',id',
        ]);

        $user = $request->user();
        $type = $this->getDbType($request->type);
        $typeId = $request->type_id;

        // Check if the user has already liked this item
        $existingLike = Like::where([
            'user_id' => $user->id,
            'type' => $type,
            'type_id' => $typeId,
        ])->first();

        if ($existingLike) {
            // If already liked, toggle the status
            $existingLike->status = !$existingLike->status;
            $existingLike->save();

            $isLiked = $existingLike->status;
        } else {
            // Create new like record
            Like::create([
                'user_id' => $user->id,
                'type' => $type,
                'type_id' => $typeId,
                'status' => true,
            ]);

            $isLiked = true;
        }

        // Get updated like count
        $likeCount = Like::where([
            'type' => $type,
            'type_id' => $typeId,
            'status' => true,
        ])->count();

        return response()->json([
            'success' => true,
            'is_liked' => $isLiked,
            'likes_count' => $likeCount,
            'message' => $isLiked ? 'Item liked successfully' : 'Item unliked successfully',
        ]);
    }

    /**
     * Get the table name based on the type
     */
    private function getTableName(string $type): string
    {
        return match ($type) {
            'profile' => 'stylists',
            'stylist' => 'stylists',
            'customer' => 'customers',
            'user' => 'users',
            'portfolio' => 'portfolios',
            'tutorial' => 'tutorials',
            default => throw new \InvalidArgumentException("Invalid type: {$type}"),
        };
    }

    private function getDbType(string $type): string
    {
        return match ($type) {
            'profile' => 'profile',
            'stylist' => 'profile',
            'portfolio' => 'portfolio',
            'tutorial' => 'tutorial',
            default => throw new \InvalidArgumentException("Invalid type: {$type}"),
        };
    }

    public function notifications(Request $request)
    {
        $customer = $request->user();
        $notifications = $customer->notifications()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type ?? 'update',
                    'title' => $notification->title,
                    'description' => $notification->description,
                    'time_ago' => $notification->created_at->diffForHumans(),
                    'time_string' => $notification->created_at->format('F j, Y \a\t g:i A'),
                    'priority' => NotificationHelper::formatPriority($notification->priority),
                    'is_read' => $notification->is_seen,
                ];
            });

        return Inertia::render('Notifications', [
            'notifications' => $notifications,
        ]);
    }

    public function markNotificationAsRead(Request $request, $id)
    {
        $customer = $request->user();

        $success = NotificationHelper::markAsRead($id, $customer->id);

        return back()->with('message', $success ? 'Notification marked as read' : 'Notification not found');
    }

    public function markAllNotificationsAsRead(Request $request)
    {
        $customer = $request->user();
        $count = NotificationHelper::markAllAsRead($customer->id);

        return back()->with('message', "$count Notifications marked as read");
    }

    public function userNotification(Request $request, $id)
    {
        $customer = $request->user();
        $role = $customer->role;
        $route = "$role.notifications";
        $notification = $customer->notifications()->where('id', $id)->first();

        if (!$notification && ($role != 'customer' || $role != 'stylist')) {
            return redirect()->route($route)->with('error', 'Something went wrong, please try again');
        }
        // NotificationHelper::markAsRead($id, $customer->id);
        return to_route($route, ['tab' => $id]); //->with('message', 'Notification marked as read');
    }
}
