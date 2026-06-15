export interface SubscriptionPlan {
  id: 'basic' | 'premium' | 'enterprise';
  name: string;
  priceSAR: number;
  productLimit: number;
  prioritySearch: boolean;
  dedicatedSupport: boolean;
}

export interface StoreSubscription {
  id: string;
  storeId: string;
  storeName: string;
  planId: 'basic' | 'premium' | 'enterprise';
  priceSAR: number;
  startDate: string;
  nextRenewalDate: string;
  status: 'active' | 'cancelled' | 'expired';
}

export interface SupportTicket {
  id: string;
  userType: 'store' | 'customer' | 'contractor';
  userName: string;
  email: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'resolved';
  createdAt: string;
  replies: string[];
}

export interface AuditLog {
  id: string;
  operatorName: string;
  role: string;
  action: string;
  module: 'Auth' | 'Stores' | 'Users' | 'Catalog' | 'Billing' | 'Support' | 'Notifications';
  ip: string;
  timestamp: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  targetGroup: 'all' | 'stores' | 'customers' | 'contractors';
  createdAt: string;
}
