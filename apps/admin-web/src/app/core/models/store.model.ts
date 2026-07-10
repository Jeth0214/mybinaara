export type StoreStatus = 'active' | 'suspended' | 'pending';

export type DocumentType = 'cr' | 'vat';
export type DocumentStatus = 'pending' | 'approved' | 'rejected';

export interface StoreDocument {
  type: DocumentType;
  status: DocumentStatus;
  uploadedAt: string;
  rejectionReason?: string;
}

export interface StoreLocation {
  fullAddress: string;
  buildingNumber?: string;
  streetName?: string;
  district?: string;
  city?: string;
  postalCode?: string;
  additionalNumber?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  plusCode?: string;
}

export interface Store {
  id: string;
  name: string;
  crNumber: string; // 10 digits
  vatNumber: string; // 15 digits
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string; // Starts with +966 or 05
  ownerWhatsapp: string; // Starts with +966 or 05
  location: StoreLocation;
  status: StoreStatus;
  isActivated: boolean;
  activationLink?: string;
  tempPassword?: string;
  storeLogo?: string; // URL or Base64 of store image logo
  createdAt: string;
  documents: StoreDocument[];
  rejectionReason?: string;
  totalProducts: number;
  schedule?: StoreDaySchedule[];
}

export interface StoreDaySchedule {
  day: 'sat' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri';
  openTime: string;
  closeTime: string;
  isOff: boolean;
}


export interface CityOption {
  value: string;
  label: string;
}

export const SAUDI_CITIES: CityOption[] = [
  { value: 'Riyadh', label: 'Riyadh (الرياض)' },
  { value: 'Jeddah', label: 'Jeddah (جدة)' },
  { value: 'Dammam', label: 'Dammam (الدمام)' },
  { value: 'Mecca', label: 'Mecca (مكة المكرمة)' },
  { value: 'Medina', label: 'Medina (المدينة المنورة)' },
  { value: 'Khobar', label: 'Khobar (الخبر)' },
  { value: 'Jubail', label: 'Jubail (الجبيل)' },
  { value: 'Tabuk', label: 'Tabuk (تبوك)' },
  { value: 'Abha', label: 'Abha (أبها)' },
  { value: 'Buraidah', label: 'Buraidah (بريدة)' }
];
