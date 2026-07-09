import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { StoreUser, StoreSchedule } from '../models/auth.model';

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
  login(email: string, pass: string): Observable<StoreUser> {
    const account = this.accounts.find(
      (a) => a.email.toLowerCase() === email.toLowerCase()
    );

    if (!account || account.passwordHash !== pass) {
      return throwError(() => new Error('Invalid email or password.'));
    }

    if (!account.isActivated) {
      return throwError(() => new Error('ACCOUNT_NOT_ACTIVATED'));
    }

    const user: StoreUser = {
      id: account.id,
      email: account.email,
      phone: account.phone,
      storeName: account.storeName,
      isActivated: account.isActivated,
      logoUrl: account.logoUrl,
      city: account.city,
      whatsapp: account.whatsapp,
      workingHours: account.workingHours,
      businessId: account.businessId,
      certificateId: account.certificateId,
    };

    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
    return of(user).pipe(delay(1000));
  }

  // Step 1: Verify Temporary Credentials
  verifyTemporaryCredentials(email: string, tempPass: string): Observable<{ email: string; storeName: string }> {
    const account = this.accounts.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() || a.phone === email
    );

    if (!account || account.passwordHash !== tempPass) {
      return throwError(() => new Error('Invalid credentials. Please verify details provided by MyBinaara.'));
    }

    if (account.isActivated) {
      return throwError(() => new Error('Account is already activated. Please use the normal Login page.'));
    }

    return of({ email: account.email, storeName: account.storeName }).pipe(delay(1000));
  }

  // Step 2: Reset/Update Password
  updatePassword(email: string, newPass: string): Observable<boolean> {
    const accountIndex = this.accounts.findIndex(
      (a) => a.email.toLowerCase() === email.toLowerCase()
    );

    if (accountIndex === -1) {
      return throwError(() => new Error('Account not found.'));
    }

    if (this.accounts[accountIndex].isActivated) {
      return throwError(() => new Error('Account already activated.'));
    }

    this.accounts[accountIndex].passwordHash = newPass;
    this.saveAccounts();

    return of(true).pipe(delay(1000));
  }

  // Step 3: Verification (OTP)
  verifyOtp(email: string, otpCode: string): Observable<StoreUser> {
    if (otpCode !== '123456') {
      return throwError(() => new Error('Invalid verification code. Use code 123456.'));
    }

    const accountIndex = this.accounts.findIndex(
      (a) => a.email.toLowerCase() === email.toLowerCase()
    );

    if (accountIndex === -1) {
      return throwError(() => new Error('Account not found.'));
    }

    this.accounts[accountIndex].isActivated = true;
    this.saveAccounts();

    const account = this.accounts[accountIndex];
    const user: StoreUser = {
      id: account.id,
      email: account.email,
      phone: account.phone,
      storeName: account.storeName,
      isActivated: true,
      logoUrl: account.logoUrl,
      city: account.city,
      whatsapp: account.whatsapp,
      workingHours: account.workingHours,
      businessId: account.businessId,
      certificateId: account.certificateId,
    };

    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
    return of(user).pipe(delay(1000));
  }

  updateProfile(userId: string, payload: {
    storeName: string;
    logoUrl?: string;
    city?: string;
    phone: string;
    whatsapp?: string;
    workingHours?: StoreSchedule;
  }): Observable<StoreUser> {
    const accountIndex = this.accounts.findIndex(a => a.id === userId);
    if (accountIndex === -1) {
      return throwError(() => new Error('Account not found.'));
    }

    const account = this.accounts[accountIndex];
    account.storeName = payload.storeName;
    if (payload.logoUrl !== undefined) account.logoUrl = payload.logoUrl;
    if (payload.city !== undefined) account.city = payload.city;
    account.phone = payload.phone;
    if (payload.whatsapp !== undefined) account.whatsapp = payload.whatsapp;
    if (payload.workingHours !== undefined) account.workingHours = payload.workingHours;

    this.saveAccounts();

    const updatedUser: StoreUser = {
      id: account.id,
      email: account.email,
      phone: account.phone,
      storeName: account.storeName,
      isActivated: account.isActivated,
      logoUrl: account.logoUrl,
      city: account.city,
      whatsapp: account.whatsapp,
      workingHours: account.workingHours,
      businessId: account.businessId,
      certificateId: account.certificateId,
    };

    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(updatedUser));
    return of(updatedUser).pipe(delay(800));
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
    const saved = localStorage.getItem(STORAGE_SESSION_KEY);
    if (saved) {
      try {
        const user = JSON.parse(saved) as StoreUser;
        const account = this.accounts.find((a) => a.id === user.id);
        if (account) {
          let updated = false;
          if (!user.businessId && account.businessId) {
            user.businessId = account.businessId;
            updated = true;
          }
          if (!user.certificateId && account.certificateId) {
            user.certificateId = account.certificateId;
            updated = true;
          }
          if (!user.logoUrl || user.logoUrl.includes('store-logo.png')) {
            user.logoUrl = account.logoUrl;
            updated = true;
          }
          if (updated) {
            localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
          }
        }
        return user;
      } catch {
        return null;
      }
    }
    return null;
  }

  logout(): void {
    localStorage.removeItem(STORAGE_SESSION_KEY);
    localStorage.removeItem(STORAGE_ACCOUNTS_KEY);
    this.initMockAccounts();
  }
}
