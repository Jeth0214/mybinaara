<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Store;
use App\Models\User;

class ActivityLogService
{
    public function record(Store $store, string $type, string $action, ?User $causer = null): void
    {
        ActivityLog::query()->create([
            'loggable_type' => Store::class,
            'loggable_id' => $store->id,
            'type' => $type,
            'action' => $action,
            'causer_id' => $causer?->id,
        ]);
    }
}
