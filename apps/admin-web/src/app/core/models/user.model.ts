export type UserStatus = 'active' | 'suspended';
export type UserType = 'customer' | 'contractor';

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
