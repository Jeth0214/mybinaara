export interface StoreUser {
  id: string;
  email: string;
  phone: string;
  storeName: string;
  isActivated: boolean; // Distinguishes if they completed setup / password update
  logoUrl?: string;
}

export interface AuthStateModel {
  user: StoreUser | null;
  tempSession: {
    email: string;
    tempPasswordVerified: boolean;
    newPasswordEntered: boolean;
  } | null;
  loading: boolean;
  error: string | null;
}
