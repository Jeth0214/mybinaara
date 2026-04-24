export interface StoreInfo {
  id: string;
  name: string;
  storeCount?: number; // e.g., '12 stores'
}

export interface Product {
  id: string;
  title: string;
  category: string;
  sku: string;
  price: number;
  imageUrl?: string;
  storeInfo: StoreInfo;
}
