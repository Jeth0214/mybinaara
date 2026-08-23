export interface CatalogProductCategory {
  id: number;
  name: string;
  slug: string;
}

export interface CatalogProductUnit {
  id: number;
  name: string;
  abbreviation: string | null;
}

export interface CatalogProduct {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  category: CatalogProductCategory | null;
  unit: CatalogProductUnit | null;
  min_price: number | null;
  max_price: number | null;
  listings_count: number;
}

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export interface CatalogProductListResponse {
  data: CatalogProduct[];
  meta: PaginationMeta;
}

export interface CatalogProductDetailResponse {
  data: CatalogProduct;
}
