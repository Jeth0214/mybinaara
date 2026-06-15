export type AdminRole = 'super_admin' | 'support' | 'finance' | 'ops';

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
  SUBSCRIPTIONS_VIEW:'subscriptions.view',
  SUBSCRIPTIONS_MANAGE:'subscriptions.manage',
  SUPPORT_VIEW:      'support.view',
  SUPPORT_MANAGE:    'support.manage',
  AUDIT_VIEW:        'audit.view',
  ADMIN_USERS_MANAGE:'admin.users.manage',
} as const;

/** Default permissions per role */
export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  super_admin: Object.values(ADMIN_PERMISSIONS),
  support: [
    ADMIN_PERMISSIONS.STORES_VIEW,
    ADMIN_PERMISSIONS.USERS_VIEW,
    ADMIN_PERMISSIONS.SUPPORT_VIEW,
    ADMIN_PERMISSIONS.SUPPORT_MANAGE,
  ],
  finance: [
    ADMIN_PERMISSIONS.STORES_VIEW,
    ADMIN_PERMISSIONS.SUBSCRIPTIONS_VIEW,
    ADMIN_PERMISSIONS.SUBSCRIPTIONS_MANAGE,
    ADMIN_PERMISSIONS.AUDIT_VIEW,
  ],
  ops: [
    ADMIN_PERMISSIONS.STORES_VIEW,
    ADMIN_PERMISSIONS.STORES_CREATE,
    ADMIN_PERMISSIONS.STORES_EDIT,
    ADMIN_PERMISSIONS.STORES_VERIFY,
    ADMIN_PERMISSIONS.CATALOG_VIEW,
    ADMIN_PERMISSIONS.CATALOG_MANAGE,
    ADMIN_PERMISSIONS.USERS_VIEW,
  ],
};
