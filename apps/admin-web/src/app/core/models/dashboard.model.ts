export interface RecentStore {
  id: string;
  businessName: string;
  ownerName: string;
  city: string;
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  createdAt: string;
}

export interface StoreActivityItem {
  id: string;
  storeName: string;
  action: string;
  timestamp: string;
  icon: string;
  type: 'registration' | 'activation' | 'suspension' | 'verification';
}

export interface AdminDashboardStats {
  activeStores: number;
  adminUsers: number;
  catalogProducts: number;
  categories: number;
}

export interface StoreByCity {
  city: string;
  count: number;
}

export interface CategoryShare {
  name: string;
  productCount: number;
}

export interface RegistrationsOverTimePoint {
  date: string;
  count: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface DashboardCharts {
  storesByCity: StoreByCity[];
  categoryShare: CategoryShare[];
  registrationsOverTime: {
    stores: RegistrationsOverTimePoint[];
    vendors: RegistrationsOverTimePoint[];
  };
  storeStatusDistribution: StatusCount[];
  productStatusDistribution: StatusCount[];
}

export interface AdminDashboard {
  stats: AdminDashboardStats;
  charts: DashboardCharts;
  recentStores: RecentStore[];
  storeActivity: StoreActivityItem[];
}
