<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\ActivityLog
 */
class StoreActivityResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'storeName' => $this->whenLoaded('loggable', fn () => $this->loggable?->name),
            'action' => $this->action,
            'timestamp' => $this->created_at?->toIso8601String(),
            'icon' => $this->icon(),
            'type' => $this->type,
        ];
    }

    private function icon(): string
    {
        return match ($this->type) {
            'registration' => 'bi-shop',
            'activation' => 'bi-check-circle',
            'verification' => 'bi-file-earmark-check',
            'suspension' => 'bi-pause-circle',
            default => 'bi-clock-history',
        };
    }
}
