export type AdminRole = 'admin' | 'user';

/** account types the API returns; user_type is 'admin' for both Administrator and Staff */
export type ApiUserType = 'customer' | 'store_owner' | 'store_staff' | 'admin';

/** role.name from the backend — null for customers, 'vendor' for store accounts */
export type AccountRole = 'administrator' | 'staff' | 'vendor' | null;

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  user_type: ApiUserType;
  avatar_url: string | null;
  status: 'active' | 'inactive';
  role: AccountRole;
  is_administrator: boolean;
  permissions: string[];
  created_at: string | null;
}

export interface LoginResponse {
  token: string;
  user: AdminUser;
}

export interface AdminAuthStateModel {
  user: AdminUser | null;
  loading: boolean;
  error: string | null;
}

/** Permission keys used for role-based access control */
export const ADMIN_PERMISSIONS = {
  STORES_VIEW:       'stores.view',
  STORES_CREATE:     'stores.create',
  STORES_EDIT:       'stores.edit',
  STORES_VERIFY:     'stores.verify',
  USERS_VIEW:        'users.view',
  USERS_MANAGE:      'users.manage',
  CATALOG_VIEW:      'catalog.view',
  CATALOG_MANAGE:    'catalog.manage',
  ADMIN_USERS_MANAGE:'admin.users.manage',
} as const;

/** Default permissions per role */
export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  admin: Object.values(ADMIN_PERMISSIONS),
  user: [
    ADMIN_PERMISSIONS.STORES_VIEW,
    ADMIN_PERMISSIONS.USERS_VIEW,
    ADMIN_PERMISSIONS.CATALOG_VIEW,
  ],
};
