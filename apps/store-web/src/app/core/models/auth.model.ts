import { StoreLocation } from './store-location.model';

export interface DaySchedule {
  openTime: string;
  closeTime: string;
  isOff: boolean;
}

export interface StoreSchedule {
  sat: DaySchedule;
  sun: DaySchedule;
  mon: DaySchedule;
  tue: DaySchedule;
  wed: DaySchedule;
  thu: DaySchedule;
  fri: DaySchedule;
}

export interface StoreUser {
  id: string;
  storeId: number;
  email: string;
  phone: string;
  storeName: string;
  isActivated: boolean; // Distinguishes if they completed setup / password update
  logoUrl?: string;
  city?: string;
  whatsapp?: string;
  workingHours?: StoreSchedule;
  businessId?: string;
  certificateId?: string;
  permissions?: string[];
  role?: string | null;
  userType?: string;
  location?: StoreLocation;
}

export interface AuthStateModel {
  user: StoreUser | null;
  loading: boolean;
  error: string | null;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    whatsapp?: string | null;
    user_type: string;
    status: string;
    role: string | null;
    is_administrator: boolean;
    permissions: string[];
  };
}

export interface StoreScheduleEntry {
  day: 'sat' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri';
  open_time: string | null;
  close_time: string | null;
  is_off: boolean;
}

export interface StoreMeResponse {
  data: {
    id: number;
    name: string;
    logo_url?: string | null;
    cr_number?: string | null;
    vat_number?: string | null;
    is_activated: boolean;
    location?: {
      latitude: number | null;
      longitude: number | null;
      city: string | null;
      formatted_address: string | null;
    };
    schedule?: StoreScheduleEntry[];
  };
}

export interface ActivateStoreResponse {
  store: {
    id: number;
    name: string;
    status: string;
    is_activated: boolean;
    logo_url?: string | null;
    cr_number?: string | null;
    vat_number?: string | null;
    location?: {
      latitude: number | null;
      longitude: number | null;
      city: string | null;
      formatted_address: string | null;
    };
  };
  user: {
    id: string;
    email: string;
    phone: string;
    whatsapp?: string | null;
  };
  token: string;
}
