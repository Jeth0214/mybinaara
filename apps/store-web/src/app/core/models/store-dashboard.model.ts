export interface StoreDashboardCategoryCount {
  name: string;
  count: number;
}

export interface StoreDashboardDailyCount {
  date: string;
  count: number;
}

export interface StoreDashboardStats {
  total: number;
  limit: number;
  remaining: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  active: number;
  suspended: number;
  byCategory: StoreDashboardCategoryCount[];
  addedOverTime: StoreDashboardDailyCount[];
}

/** Raw shape returned by GET /stores/me/dashboard (snake_case). */
export interface StoreDashboardResponse {
  data: {
    total: number;
    limit: number;
    remaining: number;
    in_stock: number;
    low_stock: number;
    out_of_stock: number;
    active: number;
    suspended: number;
    by_category: StoreDashboardCategoryCount[];
    added_over_time: StoreDashboardDailyCount[];
  };
}
