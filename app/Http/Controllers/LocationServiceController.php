<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\LocationService;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

class LocationServiceController extends Controller
{
    /**
     * Record user's location consent
     */
    public function recordLocationConsent(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'consent_given' => 'required|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        $locationService = $user->location_service ?? new LocationService(['user_id' => $user->id]);
        $locationService->recordLocationConsent($request->consent_given);
        $locationService->user()->associate($user);
        $locationService->save();

        return response()->json([
            'success' => true,
            'message' => 'Location consent recorded',
            'consent_given' => $request->consent_given,
            'consent_date' => $locationService->location_consent_date
        ]);
    }

    /**
     * Check user's location consent status
     */
    public function getLocationConsentStatus(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }
        $locationService = $user->location_service ?? new LocationService();

        return response()->json([
            'consent_given' => $locationService->location_consent_given ?? false,
            'consent_date' => $locationService->location_consent_date,
            'has_location' => $locationService->hasLocation(),
            'location_updated_at' => $locationService->location_updated_at
        ]);
    }

    /**
     * Update user's precise location from GPS
     */
    public function updateLocation(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'accuracy' => 'nullable|numeric|min:0|gt:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }
        $locationService = $user->location_service ?? new LocationService(['user_id' => $user->id]);

        $locationService->updateLocation(
            $request->latitude,
            $request->longitude,
            $request->accuracy
        );
        $locationService->user()->associate($user);
        $locationService->save();

        return response()->json([
            'success' => true,
            'message' => 'Location updated successfully',
            'location' => [
                'latitude' => $locationService->latitude,
                'longitude' => $locationService->longitude,
                'accuracy' => $locationService->location_accuracy,
                'updated_at' => $locationService->location_updated_at
            ]
        ]);
    }

    /**
     * Fallback to IP-based location
     */
    public function updateIPLocation(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }
        $ip = $request->ip();
        $locationService = $user->location_service ?? new LocationService(['user_id' => $user->id]);

        try {
            // Using a free IP geolocation service (you might want to use a paid one for production)
            $response = Http::get("http://ip-api.com/json/{$ip}");

            if ($response->successful()) {
                $data = $response->json();

                if ($data['status'] === 'success') {
                    $locationService->updateLocation(
                        $data['lat'],
                        $data['lon'],
                        50000 // IP location is less accurate
                    );
                    $locationService->location_permission_granted = false; // Mark as IP-based
                    $locationService->user()->associate($user);
                    $locationService->save();

                    return response()->json([
                        'success' => true,
                        'message' => 'Location updated from IP',
                        'location' => [
                            'latitude' => $data['lat'],
                            'longitude' => $data['lon'],
                            'city' => $data['city'],
                            'country' => $data['country']
                        ]
                    ]);
                }
            }

            throw new \Exception('Unable to determine location from IP');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get location from IP'
            ], 500);
        }
    }

    /**
     * Calculate distance between current user and another user
     */
    public function calculateDistance(Request $request, User $targetUser)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }
        $locationService = $user->location_service;

        if (!$locationService || !$locationService->hasLocation()) {
            return response()->json([
                'success' => false,
                'message' => 'Your location is not available'
            ], 400);
        }

        $targetLocationService = $targetUser->location_service;

        if (!$targetLocationService || !$targetLocationService->hasLocation()) {
            return response()->json([
                'success' => false,
                'message' => 'Target user location is not available'
            ], 400);
        }

        $distance = $locationService->distanceTo($targetLocationService);

        return response()->json([
            'success' => true,
            'distance_km' => round($distance, 2),
            'distance_miles' => round($distance * 0.621371, 2),
            'user_locations' => [
                'your_location' => [
                    'latitude' => $locationService->latitude,
                    'longitude' => $locationService->longitude,
                    'accuracy' => $locationService->location_accuracy
                ],
                'target_location' => [
                    'latitude' => $targetLocationService->latitude,
                    'longitude' => $targetLocationService->longitude,
                    'accuracy' => $targetLocationService->location_accuracy
                ]
            ]
        ]);
    }

    /**
     * Find nearby users for appointment booking, including users without location
     */
    public function findNearbyUsers(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }
        $locationService = $user->location_service;
        $radius = $request->input('radius', 10); // Default 10km radius

        // Fetch all users except the authenticated user, with their location_service relationship
        $users = User::with(['location_service'])
            ->where('id', '!=', $user->id)
            ->limit(20)
            ->get();

        $hasUserLocation = $locationService && $locationService->hasLocation();

        $nearbyUsers = $users->map(function ($nearbyUser) use ($locationService, $radius, $hasUserLocation) {
            $userLocationService = $nearbyUser->location_service;

            $distance = null;
            if ($hasUserLocation && $userLocationService && $userLocationService->hasLocation()) {
                $distanceCalc = $locationService->distanceTo($userLocationService);
                // Only include users within the radius for those with location
                if ($distanceCalc <= $radius) {
                    $distance = round($distanceCalc, 2);
                } else {
                    return null; // Exclude users outside radius if they have location
                }
            }

            return [
                'id' => $nearbyUser->id,
                'name' => $nearbyUser->name,
                'distance_km' => $distance,
                'location_accuracy' => $userLocationService ? $userLocationService->location_accuracy : null,
                'location_updated_at' => $userLocationService ? $userLocationService->location_updated_at : null,
                'has_location' => $userLocationService && $userLocationService->hasLocation()
            ];
        })->filter()->values(); // Remove null entries and reindex

        // Sort users: those with distance first (ascending), then those without location
        $nearbyUsers = $nearbyUsers->sortBy(function ($user) {
            return $user['distance_km'] === null ? PHP_INT_MAX : $user['distance_km'];
        })->values();

        return response()->json([
            'success' => true,
            'has_user_location' => $hasUserLocation,
            'nearby_users' => $nearbyUsers
        ]);
    }
}
