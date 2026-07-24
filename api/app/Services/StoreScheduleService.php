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
                StoreSchedule::query()->updateOrCreate(
                    ['store_id' => $store->id, 'day' => $entry['day']],
                    [
                        'open_time' => $entry['is_off'] ? null : $entry['open_time'],
                        'close_time' => $entry['is_off'] ? null : $entry['close_time'],
                        'is_off' => $entry['is_off'],
                    ],
                );
            }

            return $store->schedules()->get();
        });
    }
}
