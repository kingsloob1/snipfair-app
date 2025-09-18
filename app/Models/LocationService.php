<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LocationService extends Model
{
    protected $fillable = [
        'user_id',
        'latitude',
        'longitude',
        'location_accuracy',
        'location_updated_at',
        'location_permission_granted',
        'location_consent_given',
        'location_consent_date',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'location_updated_at' => 'datetime',
        'location_consent_date' => 'datetime',
        'location_permission_granted' => 'boolean',
        'location_consent_given' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Record user's location consent
     */
    public function recordLocationConsent($consentGiven)
    {
        $this->update([
            'location_consent_given' => $consentGiven,
            'location_consent_date' => now(),
        ]);
    }

    /**
     * Update user's location
     */
    public function updateLocation($latitude, $longitude, $accuracy = null)
    {
        $this->update([
            'latitude' => $latitude,
            'longitude' => $longitude,
            'location_accuracy' => $accuracy,
            'location_updated_at' => now(),
            'location_permission_granted' => true,
        ]);
    }

    /**
     * Calculate distance to another user using Haversine formula
     * Returns distance in kilometers
     */
    public function distanceTo(LocationService $otherUser)
    {
        if (!$this->hasLocation() || !$otherUser->hasLocation()) {
            return null;
        }

        return $this->calculateDistance(
            $this->latitude,
            $this->longitude,
            $otherUser->latitude,
            $otherUser->longitude
        );
    }

    /**
     * Check if user has location data
     */
    public function hasLocation()
    {
        return !is_null($this->latitude) && !is_null($this->longitude);
    }

    /**
     * Haversine formula to calculate distance between two points
     */
    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371; // Earth's radius in kilometers

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat/2) * sin($dLat/2) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon/2) * sin($dLon/2);
        $c = 2 * atan2(sqrt($a), sqrt(1-$a));

        return $earthRadius * $c;
    }

    /**
     * Find users within a certain radius (in kilometers)
     */
    public static function withinRadius($latitude, $longitude, $radiusKm)
    {
        return self::whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->whereRaw("
                (6371 * acos(
                    cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) +
                    sin(radians(?)) * sin(radians(latitude))
                )) <= ?
            ", [$latitude, $longitude, $latitude, $radiusKm]);
    }

    /**
     * Scope to get users ordered by distance from a point
     */
    public function scopeOrderByDistance($query, $latitude, $longitude)
    {
        return $query->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->selectRaw("
                *,
                (6371 * acos(
                    cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) +
                    sin(radians(?)) * sin(radians(latitude))
                )) AS distance
            ", [$latitude, $longitude, $latitude])
            ->orderBy('distance');
    }
}
