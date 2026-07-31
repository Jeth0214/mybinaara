export type ProductStatus = 'active' | 'inactive' | 'suspended';

export interface ProductStoreRef {
  id: number;
  name: string;
}

export interface ProductCategoryRef {
  id: number;
  name: string;
  slug: string;
}

export interface ProductActorRef {
  id: number;
  name: string;
}

/** Mirrors ProductResource exactly — no client-side field mapping. */
export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sku: string | null;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number;
  image_url: string | null;
  status: ProductStatus;
  store: ProductStoreRef;
  category: ProductCategoryRef | null;
  created_by: ProductActorRef | null;
  updated_by: ProductActorRef | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export interface PaginatedProducts {
  data: Product[];
  meta: PaginationMeta;
}
