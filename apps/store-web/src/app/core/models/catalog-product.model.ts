export interface CatalogProductCategoryRef {
  id: number;
  name: string;
  slug: string;
}

export interface CatalogProductUnitRef {
  id: number;
  name: string;
  abbreviation: string | null;
}

/** Mirrors CatalogProductResource exactly — the shared, cross-vendor product identity. */
export interface CatalogProduct {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  category: CatalogProductCategoryRef | null;
  unit: CatalogProductUnitRef | null;
  min_price: number | null;
  max_price: number | null;
  listings_count: number;
}

export interface CatalogProductPaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export interface PaginatedCatalogProducts {
  data: CatalogProduct[];
  meta: CatalogProductPaginationMeta;
}
