import { CatalogProduct } from './catalog-product.model';

export type ProductStatus = 'active' | 'inactive' | 'suspended';

export interface ProductStoreRef {
  id: number;
  name: string;
}

export interface ProductActorRef {
  id: number;
  name: string;
}

/**
 * Mirrors ProductResource exactly — a store's listing (price/stock/sku) of a
 * shared catalog_product. Product identity (name, category, unit, image,
 * description) lives on catalog_product, not here — it's the same for every
 * store listing the same item.
 */
export interface Product {
  id: number;
  sku: string | null;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number;
  status: ProductStatus;
  suspension_reason: string | null;
  catalog_product: CatalogProduct;
  store: ProductStoreRef;
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

/** Matches the backend's ProductService::MAX_PRODUCTS_PER_STORE constant. */
export const MAX_PRODUCTS_PER_STORE = 100;
