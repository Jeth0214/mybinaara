export type StoreStatus = 'pending' | 'active' | 'suspended' | 'rejected';

export type ScheduleDay = 'sat' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri';

export const SCHEDULE_DAYS: ScheduleDay[] = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];

export interface StoreScheduleDay {
  day: ScheduleDay;
  is_off: boolean;
  open_time: string | null;
  close_time: string | null;
}

/** Mirrors StoreResource's `location` object exactly. */
export interface StoreLocation {
  full_address: string | null;
  building_number: string | null;
  street_name: string | null;
  district: string | null;
  district_id: number | null;
  city: string | null;
  city_id: number | null;
  postal_code: string | null;
  additional_number: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  plus_code: string | null;
}

export interface StoreOwner {
  id: number;
  name: string;
  email: string;
  phone: string;
  whatsapp: string | null;
}

export interface StoreCreator {
  id: number;
  name: string;
  email: string;
}

/** Mirrors StoreResource exactly — no client-side field mapping. */
export interface Store {
  id: number;
  name: string;
  cr_number: string;
  vat_number: string;
  status: StoreStatus;
  is_activated: boolean;
  logo_url: string | null;
  rejection_reason: string | null;
  products_count: number;
  location: StoreLocation | null;
  schedule: StoreScheduleDay[];
  owner: StoreOwner | null;
  creator: StoreCreator | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export interface PaginatedStores {
  data: Store[];
  meta: PaginationMeta;
}
