import { DaySchedule, StoreSchedule, StoreScheduleEntry } from '../models/auth.model';
import { StoreLocation } from '../models/store-location.model';
import { StoreMeResponse } from '../models/auth.model';

/** Backend returns schedule as an array of per-day entries (snake_case);
 *  the frontend model keeps it as a day-keyed object (camelCase). */
export function mapScheduleEntries(entries?: StoreScheduleEntry[]): StoreSchedule | undefined {
  if (!entries || entries.length === 0) {
    return undefined;
  }

  const schedule = {} as StoreSchedule;
  for (const entry of entries) {
    schedule[entry.day] = {
      openTime: entry.open_time ?? '',
      closeTime: entry.close_time ?? '',
      isOff: entry.is_off,
    };
  }
  return schedule;
}

/** Inverse of mapScheduleEntries, for submitting to PUT /stores/{id}/schedule. */
export function buildScheduleEntries(schedule: StoreSchedule): StoreScheduleEntry[] {
  const days: StoreScheduleEntry['day'][] = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];

  return days.map((day) => {
    const daySchedule: DaySchedule = schedule[day];
    return {
      day,
      is_off: daySchedule.isOff,
      open_time: daySchedule.isOff ? null : daySchedule.openTime || null,
      close_time: daySchedule.isOff ? null : daySchedule.closeTime || null,
    };
  });
}

export function mapStoreLocation(location: StoreMeResponse['data']['location']): StoreLocation | undefined {
  if (!location || location.latitude === null || location.longitude === null) {
    return undefined;
  }

  return {
    latitude: location.latitude,
    longitude: location.longitude,
    city: location.city ?? '',
    formattedAddress: location.formatted_address ?? '',
  };
}
