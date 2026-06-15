import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AdminUser } from '../models/auth.model';
import { MOCK_ADMIN_USERS, MOCK_ADMIN_CREDENTIALS } from '../data/mock-admin-auth.data';

const STORAGE_KEY = 'admin_current_user';

@Injectable({ providedIn: 'root' })
export class AuthService {

  login(email: string, password: string): Observable<AdminUser> {
    const cred = MOCK_ADMIN_CREDENTIALS.find(
      (c) => c.email === email && c.password === password
    );

    if (!cred) {
      return throwError(() => new Error('Invalid email or password')).pipe(delay(300));
    }

    const user = MOCK_ADMIN_USERS.find((u) => u.email === email);
    if (!user) {
      return throwError(() => new Error('User account not found')).pipe(delay(300));
    }

    if (!user.isActive) {
      return throwError(() => new Error('Account is disabled. Contact super admin.')).pipe(delay(300));
    }

    this.saveUser(user);
    return of(user).pipe(delay(300));
  }

  getCurrentUser(): AdminUser | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as AdminUser) : null;
    } catch {
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  private saveUser(user: AdminUser): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }
}
