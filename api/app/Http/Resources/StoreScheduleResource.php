<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\StoreSchedule;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin StoreSchedule
 */
class StoreScheduleResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'day' => $this->day,
            'open_time' => $this->open_time,
            'close_time' => $this->close_time,
            'is_off' => $this->is_off,
        ];
    }
}
