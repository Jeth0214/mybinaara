import { Store } from './store.model';

export interface ProductListing {
  id: number;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number;
  sku: string | null;
  store: Store;
  distance_km: number | null;
}

export interface ProductListingsResponse {
  data: ProductListing[];
}
