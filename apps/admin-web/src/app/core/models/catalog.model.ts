export interface Product {
  id: string;
  name: string;
  storeId: string;
  storeName: string;
  category: string;
  brand: string;
  price: number;
  sku: string;
  isSuspended: boolean;
  description: string;
  image: string;
  createdAt: string;
  suspensionReason?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
  isActive: boolean;
  image: string;
}
