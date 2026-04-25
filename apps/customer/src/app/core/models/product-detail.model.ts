export interface ProductStoreAvailability {
  storeId: string;
  stock: number;
}

export interface ProductDetail {
  id: string;
  description: string;
  specs: string[];
  availableAt: ProductStoreAvailability[];
}
