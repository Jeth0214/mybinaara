<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Store
 */
class StoreResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'cr_number' => $this->cr_number,
            'vat_number' => $this->vat_number,
            'status' => $this->status,
            'is_activated' => $this->is_activated,
            'logo_url' => $this->logo_url,
            'rejection_reason' => $this->rejection_reason,
            'products_count' => $this->products_count ?? $this->products()->count(),
            'location' => [
                'full_address' => $this->full_address,
                'building_number' => $this->building_number,
                'street_name' => $this->street_name,
                'district' => $this->district,
                'district_id' => $this->district_id,
                'city' => $this->city,
                'city_id' => $this->city_id,
                'postal_code' => $this->postal_code,
                'additional_number' => $this->additional_number,
                'country' => $this->country,
                'latitude' => $this->latitude === null ? null : (float) $this->latitude,
                'longitude' => $this->longitude === null ? null : (float) $this->longitude,
                'plus_code' => $this->plus_code,
            ],
            'schedule' => StoreScheduleResource::collection($this->whenLoaded('schedules')),
            'owner' => $this->whenLoaded('owners', function () {
                $owner = $this->owners->first();

                return $owner === null ? null : [
                    'id' => $owner->id,
                    'name' => $owner->name,
                    'email' => $owner->email,
                    'phone' => $owner->phone,
                    'whatsapp' => $owner->whatsapp,
                ];
            }),
            'creator' => $this->whenLoaded('creator', fn () => $this->creator === null ? null : [
                'id' => $this->creator->id,
                'name' => $this->creator->name,
                'email' => $this->creator->email,
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
