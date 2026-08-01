<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Store
 */
class RecentStoreResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'businessName' => $this->name,
            'ownerName' => $this->whenLoaded('owners', fn () => $this->owners->first()?->name),
            'city' => $this->city,
            'status' => $this->status instanceof \BackedEnum ? $this->status->value : $this->status,
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
