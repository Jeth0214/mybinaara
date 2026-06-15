export type UserStatus = 'active' | 'suspended';
export type UserType = 'customer' | 'contractor';
export type AdminRole = 'super admin' | 'support' | 'finance' | 'ops';

export interface CustomerAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: UserType;
  status: UserStatus;
  joinedAt: string;
  companyName?: string; // Standard for contractor accounts
  vatNumber?: string;   // Standard for contractor accounts
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: UserStatus;
  createdAt: string;
}
