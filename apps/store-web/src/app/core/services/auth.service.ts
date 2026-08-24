import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay, finalize, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { StoreUser, StoreSchedule, ActivateStoreResponse, LoginResponse, StoreMeResponse } from '../models/auth.model';
import { mapHttpError } from '../utils/http-error.util';
import { mapScheduleEntries, mapStoreLocation } from '../utils/store-schedule.util';
import { clearToken, setToken } from './token-storage';

const DEVICE_NAME = 'store-web';
const STORE_PORTAL_USER_TYPES = ['store_owner', 'vendor_staff'];

interface MockAccount {
  id: string;
  email: string;
  phone: string;
  storeName: string;
  isActivated: boolean;
  passwordHash: string; // Plain password for mocking
  logoUrl?: string;
  city?: string;
  whatsapp?: string;
  workingHours?: StoreSchedule;
  businessId?: string;
  certificateId?: string;
}

const STORAGE_ACCOUNTS_KEY = 'mybinaara_mock_store_accounts';
const STORAGE_SESSION_KEY = 'mybinaara_store_active_session';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private accounts: MockAccount[] = [];

  constructor() {
    this.initMockAccounts();
  }

  private initMockAccounts(): void {
    const saved = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
    if (saved) {
      try {
        this.accounts = JSON.parse(saved);
        let updated = false;
        this.accounts = this.accounts.map((acc) => {
          if (!acc.businessId) {
            acc.businessId = acc.id === 'store-1' ? '1010098765' : '1010065432';
            acc.certificateId = acc.id === 'store-1' ? 'CRT-2026-8890' : 'CRT-2026-1122';
            updated = true;
          }
          if (!acc.logoUrl || acc.logoUrl.includes('store-logo.png')) {
            acc.logoUrl = 'images/logo/logo.png';
            updated = true;
          }
          return acc;
        });
        if (updated) {
          this.saveAccounts();
        }
        return;
      } catch {
        // Parse error, reset to defaults
      }
    }

    const defaultWorkingHours: StoreSchedule = {
      sat: { openTime: '08:00 AM', closeTime: '09:00 PM', isOff: false },
      sun: { openTime: '08:00 AM', closeTime: '09:00 PM', isOff: false },
      mon: { openTime: '08:00 AM', closeTime: '09:00 PM', isOff: false },
      tue: { openTime: '08:00 AM', closeTime: '09:00 PM', isOff: false },
      wed: { openTime: '08:00 AM', closeTime: '09:00 PM', isOff: false },
      thu: { openTime: '08:00 AM', closeTime: '09:00 PM', isOff: false },
      fri: { openTime: '', closeTime: '', isOff: true }
    };

    // Default mock accounts
    this.accounts = [
      {
        id: 'store-1',
        email: 'active@example.com',
        phone: '+966 12 345 6789',
        storeName: 'Al-Amal Building Materials',
        isActivated: true,
        passwordHash: 'ActivePass123!',
        logoUrl: 'images/logo/logo.png',
        city: 'Jeddah',
        whatsapp: '+966 55 123 4567',
        workingHours: defaultWorkingHours,
        businessId: '1010098765',
        certificateId: 'CRT-2026-8890',
      },
      {
        id: 'store-2',
        email: 'pending@example.com',
        phone: '+966559876543',
        storeName: 'Riyadh Construction Materials',
        isActivated: false,
        passwordHash: 'TempPass123!',
        logoUrl: 'images/logo/logo.png',
        city: 'Riyadh',
        whatsapp: '+966559876543',
        workingHours: defaultWorkingHours,
        businessId: '1010065432',
        certificateId: 'CRT-2026-1122',
      },
    ];
    this.saveAccounts();
  }

  private saveAccounts(): void {
    localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(this.accounts));
  }

  // Normal login
  login(email: string, pass: string, remember: boolean): Observable<StoreUser> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/login`, {
        email,
        password: pass,
        device_name: DEVICE_NAME,
      })
      .pipe(
        switchMap((res) => {
          if (!STORE_PORTAL_USER_TYPES.includes(res.user.user_type)) {
            this.revokeToken(res.token);
            return throwError(() => new Error('You do not have access to the Store Portal.'));
          }

          setToken(res.token, remember);

          return this.http.get<StoreMeResponse>(`${environment.apiUrl}/stores/me`).pipe(
            map((storeRes) => this.mapToStoreUser(res.user, storeRes.data)),
            tap((user) => this.cacheUser(user, remember))
          );
        }),
        catchError((err) => throwError(() => mapHttpError(err)))
      );
  }

  /** Re-fetches the store's current data (schedule, logo, location, etc.) from
   *  the API and merges it into the cached session — the cached StoreUser is
   *  only ever written at login/activation/an explicit save, so without this
   *  a long-lived session (or one opened before an admin edited the store)
   *  would keep showing stale data indefinitely. */
  refreshStore(): Observable<StoreUser> {
    const current = this.getCurrentUser();
    if (!current) {
      return throwError(() => new Error('Not authenticated'));
    }

    return this.http.get<StoreMeResponse>(`${environment.apiUrl}/stores/me`).pipe(
      map((storeRes) => {
        const store = storeRes.data;
        const updatedUser: StoreUser = {
          ...current,
          storeId: store.id,
          storeName: store.name,
          isActivated: store.is_activated,
          logoUrl: store.logo_url ?? undefined,
          city: store.location?.city ?? undefined,
          businessId: store.cr_number ?? undefined,
          certificateId: store.vat_number ?? undefined,
          ownerName: store.owner?.name ?? undefined,
          ownerEmail: store.owner?.email ?? undefined,
          location: mapStoreLocation(store.location),
          workingHours: mapScheduleEntries(store.schedule),
        };

        this.cacheUser(updatedUser, this.isRemembering());
        return updatedUser;
      }),
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }

  private mapToStoreUser(
    user: LoginResponse['user'],
    store: StoreMeResponse['data']
  ): StoreUser {
    return {
      id: user.id,
      storeId: store.id,
      email: user.email,
      phone: user.phone ?? '',
      storeName: store.name,
      isActivated: store.is_activated,
      logoUrl: store.logo_url ?? undefined,
      city: store.location?.city ?? undefined,
      whatsapp: user.whatsapp ?? undefined,
      businessId: store.cr_number ?? undefined,
      certificateId: store.vat_number ?? undefined,
      ownerName: store.owner?.name ?? undefined,
      ownerEmail: store.owner?.email ?? undefined,
      permissions: user.permissions,
      role: user.role,
      userType: user.user_type,
      location: mapStoreLocation(store.location),
      workingHours: mapScheduleEntries(store.schedule),
    };
  }

  /** Persists the session cache. Public so other store-web services (e.g.
   *  StoreService) can refresh the cached user after editing store data
   *  without duplicating session-storage handling. */
  cacheUser(user: StoreUser, remember: boolean): void {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
  }

  /** Whether the current session was persisted with "remember me" (localStorage)
   *  rather than just for this tab (sessionStorage). */
  isRemembering(): boolean {
    return !!localStorage.getItem(STORAGE_SESSION_KEY);
  }

  /** Best-effort revoke of a token issued to an account without Store Portal access. */
  private revokeToken(token: string): void {
    this.http
      .post(`${environment.apiUrl}/logout`, {}, { headers: { Authorization: `Bearer ${token}` } })
      .pipe(catchError(() => throwError(() => null)))
      .subscribe();
  }

  // Confirms the token/email/temporary-password combination without activating the store.
  verifyActivationCredentials(token: string, email: string, currentPassword: string): Observable<void> {
    return this.http
      .post<{ verified: boolean; store_name: string }>(`${environment.apiUrl}/stores/activate/verify`, {
        token,
        email,
        current_password: currentPassword,
      })
      .pipe(
        map(() => undefined),
        catchError((err) => throwError(() => mapHttpError(err)))
      );
  }

  // Requests a password reset link be emailed to the given address (no-op server-side if unknown).
  forgotPassword(email: string): Observable<void> {
    return this.http
      .post<{ message: string }>(`${environment.apiUrl}/forgot-password`, { email })
      .pipe(
        map(() => undefined),
        catchError((err) => throwError(() => mapHttpError(err)))
      );
  }

  // Sets a new password via the token emailed by forgotPassword().
  resetPassword(token: string, email: string, password: string): Observable<void> {
    return this.http
      .post<{ message: string }>(`${environment.apiUrl}/reset-password`, {
        token,
        email,
        password,
        password_confirmation: password,
      })
      .pipe(
        map(() => undefined),
        catchError((err) => throwError(() => mapHttpError(err)))
      );
  }

  // Store owner self-activation via the token emailed at store creation.
  activateStore(token: string, email: string, currentPassword: string, newPassword: string): Observable<StoreUser> {
    return this.http
      .post<ActivateStoreResponse>(`${environment.apiUrl}/stores/activate`, {
        token,
        email,
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPassword,
      })
      .pipe(
        map((response) => {
          const user: StoreUser = {
            id: response.user.id,
            storeId: response.store.id,
            email: response.user.email,
            phone: response.user.phone,
            storeName: response.store.name,
            isActivated: response.store.is_activated,
            logoUrl: response.store.logo_url ?? undefined,
            city: response.store.location?.city ?? undefined,
            whatsapp: response.user.whatsapp ?? undefined,
            businessId: response.store.cr_number ?? undefined,
            certificateId: response.store.vat_number ?? undefined,
            location: mapStoreLocation(response.store.location),
          };

          setToken(response.token);
          this.cacheUser(user, true);
          return user;
        }),
        catchError((err) => throwError(() => mapHttpError(err)))
      );
  }

  changePassword(userId: string, currentPass: string, newPass: string): Observable<boolean> {
    const accountIndex = this.accounts.findIndex(a => a.id === userId);
    if (accountIndex === -1) {
      return throwError(() => new Error('Account not found.'));
    }

    const account = this.accounts[accountIndex];
    if (account.passwordHash !== currentPass) {
      return throwError(() => new Error('Incorrect current password.'));
    }

    account.passwordHash = newPass;
    this.saveAccounts();
    return of(true).pipe(delay(800));
  }

  getCurrentUser(): StoreUser | null {
    try {
      const saved = localStorage.getItem(STORAGE_SESSION_KEY) ?? sessionStorage.getItem(STORAGE_SESSION_KEY);
      return saved ? (JSON.parse(saved) as StoreUser) : null;
    } catch {
      return null;
    }
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/logout`, {}).pipe(
      catchError(() => throwError(() => null)),
      finalize(() => {
        clearToken();
        localStorage.removeItem(STORAGE_SESSION_KEY);
        sessionStorage.removeItem(STORAGE_SESSION_KEY);
      })
    );
  }
}
