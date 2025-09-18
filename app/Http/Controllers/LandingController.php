<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ContactMessage;
use App\Models\Admin;
use App\Helpers\AdminNotificationHelper;

class LandingController extends Controller {
    public function sendMessage(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['sometimes', 'string'],
            'country' => ['sometimes', 'string', 'max:255'],
            'message' => ['required', 'string', 'min:40', 'max:1000'],
        ]);

        // Save the contact message to database
        $contactMessage = ContactMessage::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'country' => $request->country,
            'message' => $request->message,
            'status' => 'new',
        ]);

        // Send notification to all super-admins
        $superAdmins = Admin::where('role', 'super-admin')
            ->where('is_active', true)
            ->get();

        foreach ($superAdmins as $admin) {
            AdminNotificationHelper::create(
                $admin->id,
                'contact_message',
                'New Contact Message from ' . $request->name,
                "Email: {$request->email}\nMessage: " . substr($request->message, 0, 100) . '...',
                'normal'
            );
        }

        return back()->with('success', 'Thank you for contacting us! We have received your message and will get back to you soon.');
    }
}
