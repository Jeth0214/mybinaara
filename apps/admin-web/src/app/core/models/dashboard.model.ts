export interface DashboardStats {
  totalGmv: number;
  activeStores: number;
  totalUsers: number;
  totalOrders: number;
  gmvTrend: number;       // percentage change from last month
  storesTrend: number;
  usersTrend: number;
  ordersTrend: number;
}

export interface RecentStore {
  id: string;
  businessName: string;
  ownerName: string;
  city: string;
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  createdAt: string;
  category: string;
}

export interface StoreActivityItem {
  id: string;
  storeName: string;
  action: string;
  timestamp: string;
  icon: string;
  type: 'registration' | 'activation' | 'suspension' | 'verification';
}

export interface GrowthMetric {
  month: string;
  stores: number;
  users: number;
  gmv: number;
}
