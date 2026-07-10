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
}

export interface AuthStateModel {
  user: StoreUser | null;
  tempSession: {
    email: string;
    tempPasswordVerified: boolean;
    newPasswordEntered: boolean;
  } | null;
  loading: boolean;
  error: string | null;
}
