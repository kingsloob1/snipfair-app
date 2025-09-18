<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\AdminNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Mail\AdminInvitation;
use App\Mail\AdminPasswordReset;

class AdministrationController extends Controller
{
    public function index()
    {
        $currentAdmin = Auth::guard('admin')->user();

        // Get admins based on current admin's role
        $adminsQuery = Admin::latest();

        // If current admin is not super-admin, they can only see lower-level admins
        if (!$currentAdmin->hasRole('super-admin')) {
            if ($currentAdmin->hasRole('moderator')) {
                $adminsQuery->whereIn('role', ['support-admin', 'editor']);
            } else {
                // Support admins and below can only see editors
                $adminsQuery->where('role', 'editor');
            }
        }

        $admins = $adminsQuery->paginate(10);

        return Inertia::render('Admin/Account/Admins/Index', [
            'auth' => $currentAdmin,
            'currentAdmin' => [
                'id' => $currentAdmin->id,
                'name' => $currentAdmin->name,
                'first_name' => $currentAdmin->first_name ?? explode(' ', $currentAdmin->name)[0] ?? '',
                'last_name' => $currentAdmin->last_name ?? (explode(' ', $currentAdmin->name)[1] ?? ''),
                'email' => $currentAdmin->email,
                'role' => $currentAdmin->role,
                'status' => $currentAdmin->is_active ? 'active' : 'inactive',
                'avatar' => $currentAdmin->avatar,
                'phone' => $currentAdmin->phone,
                'created_at' => $currentAdmin->created_at->toISOString(),
                'last_login' => $currentAdmin->last_login_at?->toISOString(),
                'email_verified_at' => $currentAdmin->email_verified_at?->toISOString(),
            ],
            'admins' => $admins->map(function ($admin) {
                return [
                    'id' => $admin->id,
                    'name' => $admin->name,
                    'email' => $admin->email,
                    'role' => $admin->role,
                    'status' => $admin->is_active ? 'active' : 'inactive',
                    'avatar' => $admin->avatar,
                    'created_at' => $admin->created_at->toISOString(),
                ];
            }),
        ]);
    }

    public function invite(Request $request)
    {
        $currentAdmin = Auth::guard('admin')->user();

        // Only super-admin can invite
        if (!$currentAdmin->hasRole('super-admin')) {
            return back()->with('error', 'You do not have permission to invite admins.');
        }

        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:admins',
            'role' => 'required|in:super-admin,moderator,support-admin,editor',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        // Create temporary password
        $tempPassword = Str::random(12);

        $admin = Admin::create([
            'name' => explode('@', $request->email)[0], // Temporary name
            'email' => $request->email,
            'password' => Hash::make($tempPassword),
            'role' => $request->role,
            'is_active' => true,
        ]);

        // Send invitation email with temporary password
        Mail::to($admin->email)->send(new AdminInvitation($admin, $tempPassword));

        return back()->with('success', 'Admin invitation sent successfully.');
    }

    public function updateProfile(Request $request)
    {
        $admin = Auth::guard('admin')->user();

        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:admins,email,' . $admin->id,
            'phone' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        $admin->update([
            'name' => $request->first_name . ' ' . $request->last_name,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'phone' => $request->phone,
        ]);

        return back()->with('success', 'Profile updated successfully.');
    }

    public function toggleStatus(Admin $admin)
    {
        $currentAdmin = Auth::guard('admin')->user();

        // Prevent self-toggle
        if ($currentAdmin->id == $admin->id) {
            return back()->with('error', 'You cannot change your own status.');
        }

        // Check permissions
        if (!$this->canManageAdmin($currentAdmin, $admin)) {
            return back()->with('error', 'You do not have permission to manage this admin.');
        }

        $admin->update([
            'is_active' => !$admin->is_active
        ]);

        $status = $admin->is_active ? 'enabled' : 'disabled';
        return back()->with('success', "Admin {$status} successfully.");
    }

    public function destroy(Admin $admin)
    {
        $currentAdmin = Auth::guard('admin')->user();

        // Prevent self-deletion
        if ($currentAdmin->id == $admin->id) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        // Check permissions
        if (!$this->canManageAdmin($currentAdmin, $admin)) {
            return back()->with('error', 'You do not have permission to delete this admin.');
        }

        $admin->delete();

        return back()->with('success', 'Admin deleted successfully.');
    }

    public function updateRole(Request $request, Admin $admin)
    {
        $currentAdmin = Auth::guard('admin')->user();

        // Only super-admin can update roles
        if (!$currentAdmin->hasRole('super-admin')) {
            return back()->with('error', 'You do not have permission to update admin roles.');
        }

        // Prevent self-role change
        if ($currentAdmin->id == $admin->id) {
            return back()->with('error', 'You cannot change your own role.');
        }

        $validator = Validator::make($request->all(), [
            'role' => 'required|in:super-admin,moderator,support-admin,editor',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        $admin->update([
            'role' => $request->role
        ]);

        return back()->with('success', 'Admin role updated successfully.');
    }

    public function sendMessage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'admin_id' => 'required|exists:admins,id',
            'message' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        $sender = Auth::guard('admin')->user();
        $recipient = Admin::findOrFail($request->admin_id);

        // Create notification
        AdminNotification::create([
            'user_id' => $recipient->id,
            'type' => 'message',
            'title' => 'Message from ' . $sender->name,
            'message' => $request->message,
            'sender_id' => $sender->id,
            'is_read' => false,
        ]);

        return back()->with('success', 'Message sent successfully.');
    }

    public function resetPassword(Request $request, Admin $admin)
    {
        $currentAdmin = Auth::guard('admin')->user();

        // Only super-admin can reset passwords
        if (!$currentAdmin->hasRole('super-admin')) {
            return back()->with('error', 'You do not have permission to reset admin passwords.');
        }

        // Prevent self-password reset
        if ($currentAdmin->id == $admin->id) {
            return back()->with('error', 'You cannot reset your own password.');
        }

        $validator = Validator::make($request->all(), [
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        // Update admin password
        $admin->update([
            'password' => Hash::make($request->password),
        ]);

        // Send password reset email
        Mail::to($admin->email)->send(new AdminPasswordReset($admin, $request->password));

        return back()->with('success', 'Password reset successfully and email sent.');
    }

    /**
     * Check if current admin can manage the target admin
     */
    private function canManageAdmin(Admin $currentAdmin, Admin $targetAdmin): bool
    {
        // Super admin can manage anyone except themselves
        if ($currentAdmin->hasRole('super-admin') && $currentAdmin->id != $targetAdmin->id) {
            return true;
        }

        // Moderator can manage support-admin and editor
        if ($currentAdmin->hasRole('moderator') &&
            in_array($targetAdmin->role, ['support-admin', 'editor'])) {
            return true;
        }

        // Support admin can manage editor
        if ($currentAdmin->hasRole('support-admin') &&
            $targetAdmin->hasRole('editor')) {
            return true;
        }

        return false;
    }
}
