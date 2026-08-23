export interface StoreScheduleDay {
  day: string;
  open_time: string | null;
  close_time: string | null;
  is_off: boolean;
}

export interface StoreContact {
  phone: string | null;
  whatsapp: string | null;
}

export interface Store {
  id: number;
  name: string;
  logo_url: string | null;
  location: {
    latitude: number | null;
    longitude: number | null;
    city: string | null;
    formatted_address: string | null;
  };
  status: string;
  distance_km: number | null;
  schedule?: StoreScheduleDay[];
  contact?: StoreContact | null;
}

export interface NearbyStoresResponse {
  data: Store[];
}

export interface StoreDetailResponse {
  data: Store;
}
