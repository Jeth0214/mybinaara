export type ProductApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Product {
  id: string;
  name: string;
  storeId: string;
  storeName: string;
  category: string;
  brand: string;
  price: number;
  sku: string;
  status: ProductApprovalStatus;
  description: string;
  image: string;
  createdAt: string;
  rejectionReason?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
  isActive: boolean;
}

export interface Brand {
  id: string;
  name: string;
  productCount: number;
  isActive: boolean;
}
