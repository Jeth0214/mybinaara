import { AdminUser, ROLE_PERMISSIONS } from '../models/auth.model';

export const MOCK_ADMIN_USERS: AdminUser[] = [
  {
    id: 'admin-001',
    email: 'admin@mybinaara.com',
    name: 'Fahad Al-Rashidi',
    role: 'super_admin',
    lastLogin: '2026-06-13T10:30:00Z',
    isActive: true,
    permissions: ROLE_PERMISSIONS['super_admin'],
  },
  {
    id: 'admin-002',
    email: 'support@mybinaara.com',
    name: 'Noura Al-Otaibi',
    role: 'support',
    lastLogin: '2026-06-12T14:15:00Z',
    isActive: true,
    permissions: ROLE_PERMISSIONS['support'],
  },
  {
    id: 'admin-003',
    email: 'finance@mybinaara.com',
    name: 'Abdullah Al-Ghamdi',
    role: 'finance',
    lastLogin: '2026-06-11T09:00:00Z',
    isActive: true,
    permissions: ROLE_PERMISSIONS['finance'],
  },
  {
    id: 'admin-004',
    email: 'ops@mybinaara.com',
    name: 'Sara Al-Harbi',
    role: 'ops',
    lastLogin: '2026-06-13T08:45:00Z',
    isActive: true,
    permissions: ROLE_PERMISSIONS['ops'],
  },
];

/** Default admin login credentials (for mock auth only) */
export const MOCK_ADMIN_CREDENTIALS = [
  { email: 'admin@mybinaara.com', password: 'Admin@123' },
  { email: 'support@mybinaara.com', password: 'Support@123' },
  { email: 'finance@mybinaara.com', password: 'Finance@123' },
  { email: 'ops@mybinaara.com', password: 'Ops@123' },
];
