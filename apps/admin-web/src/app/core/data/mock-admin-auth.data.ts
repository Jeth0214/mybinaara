import { AdminUser, ROLE_PERMISSIONS } from '../models/auth.model';

export const MOCK_ADMIN_USERS: AdminUser[] = [
  {
    id: 'admin-1',
    email: 'bert_llave@mybinaara.com',
    name: 'Bert Llave',
    role: 'admin',
    lastLogin: '2026-06-13T10:30:00Z',
    isActive: true,
    permissions: ROLE_PERMISSIONS['admin'],
  },
  {
    id: 'admin-2',
    email: 'rj_suyom@mybinaara.com',
    name: 'Roland Jethro Suyom',
    role: 'admin',
    lastLogin: '2026-06-13T09:15:00Z',
    isActive: true,
    permissions: ROLE_PERMISSIONS['admin'],
  },
  {
    id: 'admin-3',
    email: 'binaara_users@mybinaara.com',
    name: 'My Binaara',
    role: 'user',
    lastLogin: '2026-06-13T08:45:00Z',
    isActive: true,
    permissions: ROLE_PERMISSIONS['user'],
  },
];

/** Default admin login credentials (for mock auth only) */
export const MOCK_ADMIN_CREDENTIALS = [
  { email: 'bert_llave@mybinaara.com', password: 'Bert@123' },
  { email: 'rj_suyom@mybinaara.com', password: 'Roland@123' },
  { email: 'binaara_users@mybinaara.com', password: 'Binaara@123' },
];
