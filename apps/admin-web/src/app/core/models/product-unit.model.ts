/** Mirrors ProductUnitResource exactly — no client-side field mapping. */
export interface ProductUnit {
  id: number;
  name: string;
  abbreviation: string | null;
  is_active: boolean;
  products_count?: number;
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

export interface PaginatedProductUnits {
  data: ProductUnit[];
  meta: PaginationMeta;
}

export interface ProductUnitPayload {
  name: string;
  abbreviation?: string | null;
  is_active?: boolean;
}
