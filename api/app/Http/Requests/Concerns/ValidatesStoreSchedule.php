<?php

declare(strict_types=1);

namespace App\Http\Requests\Concerns;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\Rule;

trait ValidatesStoreSchedule
{
    private const SCHEDULE_DAYS = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];

    /**
     * @return array<string, mixed>
     */
    protected function scheduleRules(): array
    {
        return [
            'schedule' => ['required', 'array', 'size:7'],
            'schedule.*.day' => ['required', 'string', Rule::in(self::SCHEDULE_DAYS), 'distinct'],
            'schedule.*.is_off' => ['required', 'boolean'],
            'schedule.*.open_time' => ['nullable', 'date_format:h:i A'],
            'schedule.*.close_time' => ['nullable', 'date_format:h:i A'],
        ];
    }

    protected function validateScheduleCompleteness(Validator $validator): void
    {
        $entries = $this->input('schedule', []);

        foreach ($entries as $i => $entry) {
            if (($entry['is_off'] ?? false) === false) {
                if (empty($entry['open_time'])) {
                    $validator->errors()->add("schedule.$i.open_time", 'Open time is required when the store is not off.');
                }
                if (empty($entry['close_time'])) {
                    $validator->errors()->add("schedule.$i.close_time", 'Close time is required when the store is not off.');
                }
            }
        }

        $days = collect($entries)->pluck('day');
        if ($days->unique()->count() !== 7 || $days->diff(self::SCHEDULE_DAYS)->isNotEmpty()) {
            $validator->errors()->add('schedule', 'Schedule must contain exactly one entry for each day of the week.');
        }
    }
}
