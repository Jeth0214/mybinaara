<?php

declare(strict_types=1);

namespace App\Support\Seeding;

final class GeoPoint
{
    private const EARTH_RADIUS_KM = 6371.0;

    /**
     * Returns [latitude, longitude] at $distanceKm from ($lat, $lng) along $bearingDeg (0 = north, 90 = east).
     *
     * @return array{0: float, 1: float}
     */
    public static function destination(float $lat, float $lng, float $distanceKm, float $bearingDeg): array
    {
        $lat1 = deg2rad($lat);
        $lng1 = deg2rad($lng);
        $bearing = deg2rad($bearingDeg);
        $angularDistance = $distanceKm / self::EARTH_RADIUS_KM;

        $lat2 = asin(
            sin($lat1) * cos($angularDistance) + cos($lat1) * sin($angularDistance) * cos($bearing)
        );

        $lng2 = $lng1 + atan2(
            sin($bearing) * sin($angularDistance) * cos($lat1),
            cos($angularDistance) - sin($lat1) * sin($lat2)
        );

        return [round(rad2deg($lat2), 6), round(rad2deg($lng2), 6)];
    }

    public static function haversineKm(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $phi1 = deg2rad($lat1);
        $phi2 = deg2rad($lat2);
        $deltaPhi = deg2rad($lat2 - $lat1);
        $deltaLambda = deg2rad($lng2 - $lng1);

        $a = sin($deltaPhi / 2) ** 2 + cos($phi1) * cos($phi2) * sin($deltaLambda / 2) ** 2;

        return self::EARTH_RADIUS_KM * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }
}
