<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\Like;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    public function toggleLike(Request $request)
    {
        $request->validate([
            'type' => 'required|in:portfolio,profile,tutorial',
            'type_id' => 'required|integer',
        ]);

        $userId = $request->user()->id;
        $type = $request->type;
        $typeId = $request->type_id;

        $like = Like::where([
            'user_id' => $userId,
            'type' => $type,
            'type_id' => $typeId,
        ])->first();

        if ($like) {
            $like->status = !$like->status;
            $like->save();

            return response()->json([
                'message' => $like->status ? 'Liked' : 'Unliked',
                'status' => $like->status,
            ]);
        }

        Like::create([
            'user_id' => $userId,
            'type' => $type,
            'type_id' => $typeId,
            'status' => true,
        ]);

        return response()->json([
            'message' => 'Liked',
            'status' => true,
        ]);
    }
}
