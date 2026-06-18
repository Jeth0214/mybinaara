export type StoreStatus = 'active' | 'suspended' | 'pending';

export type DocumentType = 'cr' | 'vat' | 'iban';
export type DocumentStatus = 'pending' | 'approved' | 'rejected';

export interface StoreDocument {
  type: DocumentType;
  fileName: string;
  fileUrl: string;
  status: DocumentStatus;
  uploadedAt: string;
  rejectionReason?: string;
}

export interface Store {
  id: string;
  name: string;
  crNumber: string; // 10 digits
  vatNumber: string; // 15 digits
  iban: string; // Starts with SA
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string; // Starts with +966 or 05
  ownerWhatsapp: string; // Starts with +966 or 05
  location: string; // Saudi Arabia City
  district: string;
  lat: number;
  lng: number;
  status: StoreStatus;
  isActivated: boolean;
  subscriptionHistory: SubscriptionHistory[];
  subscriptionPlanId: 'basic' | 'premium' | 'enterprise';
  activationLink?: string;
  tempPassword?: string;
  storeLogo?: string; // URL or Base64 of store image logo
  createdAt: string;
  documents: StoreDocument[];
  rejectionReason?: string;
  totalProducts: number;
}

export interface SubscriptionHistory {
  planId: 'basic' | 'premium' | 'enterprise';
  startDate: string;
  endDate?: string;
}

export interface CategoryOption {
  value: string;
  label: string;
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

export const STORE_CATEGORIES: CategoryOption[] = [
  { value: 'Building Materials', label: 'Building Materials (مواد البناء)' },
  { value: 'Cement & Blocks', label: 'Cement & Blocks (الإسمنت والبلك)' },
  { value: 'Steel & Metal', label: 'Steel & Metal (الحديد والمعادن)' },
  { value: 'Doors & Windows', label: 'Doors & Windows (الأبواب والنوافذ)' },
  { value: 'Paint & Finishes', label: 'Paint & Finishes (الدهانات والتشطيبات)' },
  { value: 'Electrical', label: 'Electrical (الكهرباء)' },
  { value: 'Plumbing', label: 'Plumbing (السباكة)' },
  { value: 'HVAC & Air Conditioning', label: 'HVAC & Air Conditioning (التكييف والتبريد)' },
  { value: 'Wood & Carpentry', label: 'Wood & Carpentry (الخشب والنجارة)' },
  { value: 'Roofing', label: 'Roofing (الأسقف)' },
  { value: 'Flooring & Tiles', label: 'Flooring & Tiles (البلاط والأرضيات)' },
  { value: 'Glass & Aluminum', label: 'Glass & Aluminum (الزجاج والألمنيوم)' },
  { value: 'Waterproofing', label: 'Waterproofing (عزل المياه)' },
  { value: 'Tools & Hardware', label: 'Tools & Hardware (الأدوات والمعدات)' },
  { value: 'Equipment & Machinery', label: 'Equipment & Machinery (المعدات والآلات)' },
  { value: 'Safety Supplies', label: 'Safety Supplies (أدوات السلامة)' },
  { value: 'Landscaping', label: 'Landscaping (تنسيق الحدائق)' },
  { value: 'Miscellaneous', label: 'Miscellaneous (أخرى ومتنوعة)' }
];
