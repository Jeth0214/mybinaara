export type AdminRole = 'admin' | 'user';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  avatar?: string;
  lastLogin?: string;
  isActive: boolean;
  permissions: string[];
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
