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

export interface AdminDashboardStats {
  activeStores: number;
  adminUsers: number;
  catalogProducts: number;
  categories: number;
}
