<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Customer-facing store representation — excludes internal/PII fields
 * (cr_number, vat_number, rejection/suspension reasons, owner email, creator)
 * present on the vendor-facing StoreResource.
 *
 * @mixin Store
 */
class PublicStoreResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'logo_url' => $this->logo_url,
            'status' => $this->status,
            'products_count' => $this->products_count ?? $this->products()->count(),
            'location' => [
                'latitude' => $this->latitude === null ? null : (float) $this->latitude,
                'longitude' => $this->longitude === null ? null : (float) $this->longitude,
                'city' => $this->city,
                'formatted_address' => $this->formatted_address,
            ],
            'distance_km' => $this->when(array_key_exists('distance_km', $this->getAttributes()), fn () => round((float) $this->getAttributes()['distance_km'], 1)),
            'schedule' => StoreScheduleResource::collection($this->whenLoaded('schedules')),
            'contact' => $this->whenLoaded('owners', function () {
                $owner = $this->owners->first();

                return $owner === null ? null : [
                    'phone' => $owner->phone,
                    'whatsapp' => $owner->whatsapp,
                ];
            }),
        ];
    }
}
