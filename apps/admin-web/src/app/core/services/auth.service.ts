import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AdminUser, LoginResponse } from '../models/auth.model';
import { clearToken, getToken, setToken } from './token-storage';
import { mapHttpError } from '../utils/http-error.util';

const STORAGE_KEY = 'admin_current_user';
const DEVICE_NAME = 'admin-web';
const ADMIN_PORTAL_ROLES = ['administrator', 'staff'];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  login(email: string, password: string): Observable<AdminUser> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/login`, {
        email,
        password,
        device_name: DEVICE_NAME,
      })
      .pipe(
        map((response) => {
          if (!ADMIN_PORTAL_ROLES.includes(response.user.role ?? '')) {
            this.revokeToken(response.token);
            throw new Error('You do not have access to the Admin Portal.');
          }

          setToken(response.token);
          this.saveUser(response.user);
          return response.user;
        }),
        catchError((err) => throwError(() => mapHttpError(err)))
      );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/logout`, {}).pipe(
      catchError(() => throwError(() => null)),
      finalize(() => {
        clearToken();
        localStorage.removeItem(STORAGE_KEY);
      })
    );
  }

  getCurrentUser(): AdminUser | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as AdminUser) : null;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return getToken();
  }

  private saveUser(user: AdminUser): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  /** Best-effort revoke of a token issued to an account without admin-portal access. */
  private revokeToken(token: string): void {
    this.http
      .post(`${environment.apiUrl}/logout`, {}, { headers: { Authorization: `Bearer ${token}` } })
      .pipe(catchError(() => throwError(() => null)))
      .subscribe();
  }
}
