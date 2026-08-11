import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay, finalize, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { StoreUser, StoreSchedule, DaySchedule, ActivateStoreResponse, LoginResponse, StoreMeResponse, StoreScheduleEntry } from '../models/auth.model';
import { StoreLocation } from '../models/store-location.model';
import { mapHttpError } from '../utils/http-error.util';
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
            tap((user) => this.saveUser(user, remember))
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
          location: this.mapStoreLocation(store.location),
          workingHours: this.mapScheduleEntries(store.schedule),
        };

        const remember = !!localStorage.getItem(STORAGE_SESSION_KEY);
        this.saveUser(updatedUser, remember);
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
      permissions: user.permissions,
      role: user.role,
      userType: user.user_type,
      location: this.mapStoreLocation(store.location),
      workingHours: this.mapScheduleEntries(store.schedule),
    };
  }

  /** Backend returns schedule as an array of per-day entries (snake_case);
   *  the frontend model keeps it as a day-keyed object (camelCase). */
  private mapScheduleEntries(entries?: StoreScheduleEntry[]): StoreSchedule | undefined {
    if (!entries || entries.length === 0) {
      return undefined;
    }

    const schedule = {} as StoreSchedule;
    for (const entry of entries) {
      schedule[entry.day] = {
        openTime: entry.open_time ?? '',
        closeTime: entry.close_time ?? '',
        isOff: entry.is_off,
      };
    }
    return schedule;
  }

  /** Inverse of mapScheduleEntries, for submitting to PUT /stores/{id}/schedule. */
  private buildScheduleEntries(schedule: StoreSchedule): StoreScheduleEntry[] {
    const days: StoreScheduleEntry['day'][] = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];

    return days.map((day) => {
      const daySchedule: DaySchedule = schedule[day];
      return {
        day,
        is_off: daySchedule.isOff,
        open_time: daySchedule.isOff ? null : daySchedule.openTime || null,
        close_time: daySchedule.isOff ? null : daySchedule.closeTime || null,
      };
    });
  }

  private mapStoreLocation(location: StoreMeResponse['data']['location']): StoreLocation | undefined {
    if (!location || location.latitude === null || location.longitude === null) {
      return undefined;
    }

    return {
      latitude: location.latitude,
      longitude: location.longitude,
      city: location.city ?? '',
      formattedAddress: location.formatted_address ?? '',
    };
  }

  private saveUser(user: StoreUser, remember: boolean): void {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
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
            location: this.mapStoreLocation(response.store.location),
          };

          setToken(response.token);
          this.saveUser(user, true);
          return user;
        }),
        catchError((err) => throwError(() => mapHttpError(err)))
      );
  }

  /** Only workingHours is actually editable on the Store Info tab (name, city,
   *  phone, whatsapp, business/certificate IDs are shown read-only there — the
   *  backend has no owner-facing endpoint to change those; only an admin can),
   *  so this saves the schedule via the real PUT /stores/{id}/schedule route. */
  updateProfile(storeId: number, workingHours: StoreSchedule): Observable<StoreUser> {
    const schedule = this.buildScheduleEntries(workingHours);

    return this.http
      .put<{ data: StoreMeResponse['data'] }>(`${environment.apiUrl}/stores/${storeId}/schedule`, { schedule })
      .pipe(
        map((response) => {
          const current = this.getCurrentUser();
          if (!current) {
            throw new Error('Not authenticated');
          }

          const updatedUser: StoreUser = {
            ...current,
            workingHours: this.mapScheduleEntries(response.data.schedule),
          };

          const remember = !!localStorage.getItem(STORAGE_SESSION_KEY);
          this.saveUser(updatedUser, remember);
          return updatedUser;
        }),
        catchError((err) => throwError(() => mapHttpError(err)))
      );
  }

  updateStoreLocation(storeId: number, payload: StoreLocation): Observable<StoreUser> {
    return this.http
      .patch<{ data: { location: StoreMeResponse['data']['location'] } }>(`${environment.apiUrl}/stores/${storeId}/location`, {
        latitude: payload.latitude,
        longitude: payload.longitude,
        city: payload.city,
        formatted_address: payload.formattedAddress,
      })
      .pipe(
        map((response) => {
          const current = this.getCurrentUser();
          if (!current) {
            throw new Error('Not authenticated');
          }

          const updatedUser: StoreUser = {
            ...current,
            location: this.mapStoreLocation(response.data.location),
          };

          const remember = !!localStorage.getItem(STORAGE_SESSION_KEY);
          this.saveUser(updatedUser, remember);
          return updatedUser;
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
