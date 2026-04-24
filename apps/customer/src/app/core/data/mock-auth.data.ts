import { AuthState } from '../models/auth.model';

// Toggle isLoggedIn to test both states during dev
export const MOCK_AUTH_STATE: AuthState = {
  isLoggedIn: true,
  userId: 'usr_001',
  displayName: 'Roland',
};
