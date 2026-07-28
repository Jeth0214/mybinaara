import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CreateStaffPayload, PaginatedStaff, PermissionGroup, StaffMember, UpdateStaffPayload } from '../models/staff.model';
import { mapHttpError } from '../utils/http-error.util';

@Injectable({ providedIn: 'root' })
export class StaffService {
  private readonly http = inject(HttpClient);

  private readonly _permissionGroups = signal<PermissionGroup[]>([]);
  readonly permissionGroups = this._permissionGroups.asReadonly();

  private readonly _permissionsLoading = signal(false);
  readonly permissionsLoading = this._permissionsLoading.asReadonly();

  private readonly _permissionsError = signal<string | null>(null);
  readonly permissionsError = this._permissionsError.asReadonly();

  /** Fetches once and caches; safe to call repeatedly (e.g. on every tier switch). */
  loadPermissionGroups(): void {
    if (this._permissionGroups().length > 0 || this._permissionsLoading()) {
      return;
    }

    this._permissionsLoading.set(true);
    this._permissionsError.set(null);

    this.http
      .get<{ data: PermissionGroup[] }>(`${environment.apiUrl}/permissions`)
      .pipe(
        map((response) => response.data),
        catchError((err) => {
          this._permissionsError.set(mapHttpError(err).message);
          return of([] as PermissionGroup[]);
        }),
        finalize(() => this._permissionsLoading.set(false))
      )
      .subscribe((groups) => this._permissionGroups.set(groups));
  }

  listStaff(params: { search?: string; page?: number }): Observable<PaginatedStaff> {
    let httpParams = new HttpParams();
    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.page) {
      httpParams = httpParams.set('page', params.page);
    }

    return this.http.get<PaginatedStaff>(`${environment.apiUrl}/staff`, { params: httpParams }).pipe(
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }

  deleteStaff(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/staff/${id}`).pipe(
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }

  updateStaffStatus(id: number, status: 'active' | 'inactive'): Observable<StaffMember> {
    return this.http.patch<{ data: StaffMember }>(`${environment.apiUrl}/staff/${id}/status`, { status }).pipe(
      map((response) => response.data),
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }

  getStaff(id: number): Observable<StaffMember> {
    return this.http.get<{ data: StaffMember }>(`${environment.apiUrl}/staff/${id}`).pipe(
      map((response) => response.data),
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }

  createStaff(payload: CreateStaffPayload): Observable<StaffMember> {
    return this.http.post<{ data: StaffMember }>(`${environment.apiUrl}/staff`, payload).pipe(
      map((response) => response.data),
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }

  updateStaff(id: number, payload: UpdateStaffPayload): Observable<StaffMember> {
    return this.http.patch<{ data: StaffMember }>(`${environment.apiUrl}/staff/${id}`, payload).pipe(
      map((response) => response.data),
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }
}
