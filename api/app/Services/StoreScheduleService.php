<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Store;
use App\Models\StoreSchedule;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class StoreScheduleService
{
    /**
     * @param  array<int, array{day: string, open_time: ?string, close_time: ?string, is_off: bool}>  $entries
     */
    public function replace(Store $store, array $entries): Collection
    {
        return DB::transaction(function () use ($store, $entries) {
            foreach ($entries as $entry) {
                $isOff = filter_var($entry['is_off'], FILTER_VALIDATE_BOOLEAN);

                StoreSchedule::query()->updateOrCreate(
                    ['store_id' => $store->id, 'day' => $entry['day']],
                    [
                        'open_time' => $isOff ? null : ($entry['open_time'] ?? null),
                        'close_time' => $isOff ? null : ($entry['close_time'] ?? null),
                        'is_off' => $isOff,
                    ],
                );
            }

            return $store->schedules()->get();
        });
    }
}
