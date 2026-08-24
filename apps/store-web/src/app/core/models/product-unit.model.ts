/** Mirrors ProductUnitResource exactly — no client-side field mapping. */
export interface ProductUnit {
  id: number;
  name: string;
  abbreviation: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}
