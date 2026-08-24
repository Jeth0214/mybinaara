export type StaffRole = 'administrator' | 'staff';

export interface Permission {
  key: string;
  label: string;
}

export interface PermissionGroup {
  category: string;
  permissions: Permission[];
}

/** Mirrors StaffResource exactly — no client-side field mapping. */
export interface StaffMember {
  id: number;
  name: string;
  email: string;
  phone: string;
  whatsapp: string | null;
  status: 'active' | 'inactive';
  locked: boolean;
  locked_until: string | null;
  requires_admin_unlock: boolean;
  role: StaffRole;
  permissions: string[];
  created_at: string | null;
}

interface StaffPayloadBase {
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
}

/** role is only present for 'administrator'; permissions only for 'staff'. */
export type CreateStaffPayload =
  | (StaffPayloadBase & { role: 'administrator' })
  | (StaffPayloadBase & { permissions: string[] });

export type UpdateStaffPayload = Partial<StaffPayloadBase> &
  (
    | { role: 'administrator' }
    | { role?: 'staff'; permissions?: string[] }
  );

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export interface PaginatedStaff {
  data: StaffMember[];
  meta: PaginationMeta;
}
