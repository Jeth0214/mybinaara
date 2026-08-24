import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { StoreUser, StoreSchedule, StoreMeResponse } from '../models/auth.model';
import { StoreLocation } from '../models/store-location.model';
import { StoreDashboardResponse, StoreDashboardStats } from '../models/store-dashboard.model';
import { mapHttpError } from '../utils/http-error.util';
import { buildScheduleEntries, mapScheduleEntries, mapStoreLocation } from '../utils/store-schedule.util';
import { AuthService } from './auth.service';

/** Owns HTTP calls that edit the logged-in vendor's own store (schedule,
 *  location, logo) from the Store Info tab. Each call re-caches the merged
 *  StoreUser via AuthService so the session stays in sync, since the store
 *  profile is part of the cached session rather than fetched separately. */
@Injectable({
  providedIn: 'root',
})
export class StoreService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  updateSchedule(storeId: number, workingHours: StoreSchedule): Observable<StoreUser> {
    const schedule = buildScheduleEntries(workingHours);

    return this.http
      .put<{ data: StoreMeResponse['data'] }>(`${environment.apiUrl}/stores/${storeId}/schedule`, { schedule })
      .pipe(
        map((response) => this.mergeAndCache({ workingHours: mapScheduleEntries(response.data.schedule) })),
        catchError((err) => throwError(() => mapHttpError(err)))
      );
  }

  updateLocation(storeId: number, payload: StoreLocation): Observable<StoreUser> {
    return this.http
      .patch<{ data: { location: StoreMeResponse['data']['location'] } }>(`${environment.apiUrl}/stores/${storeId}/location`, {
        latitude: payload.latitude,
        longitude: payload.longitude,
        city: payload.city,
        formatted_address: payload.formattedAddress,
      })
      .pipe(
        map((response) => this.mergeAndCache({ location: mapStoreLocation(response.data.location) })),
        catchError((err) => throwError(() => mapHttpError(err)))
      );
  }

  updateLogo(storeId: number, file: File): Observable<StoreUser> {
    const formData = new FormData();
    formData.append('logo', file);

    return this.http
      .post<{ data: { logo_url?: string | null } }>(`${environment.apiUrl}/stores/${storeId}/logo`, formData)
      .pipe(
        map((response) => this.mergeAndCache({ logoUrl: response.data.logo_url ?? undefined })),
        catchError((err) => throwError(() => mapHttpError(err)))
      );
  }

  removeLogo(storeId: number): Observable<StoreUser> {
    return this.http
      .delete<{ data: { logo_url?: string | null } }>(`${environment.apiUrl}/stores/${storeId}/logo`)
      .pipe(
        map((response) => this.mergeAndCache({ logoUrl: response.data.logo_url ?? undefined })),
        catchError((err) => throwError(() => mapHttpError(err)))
      );
  }

  /** Aggregated, accurate stat-tile/chart data for the vendor's own store —
   *  computed server-side across the whole catalog, unlike a client-side
   *  count over a single paginated products page. */
  getDashboardStats(): Observable<StoreDashboardStats> {
    return this.http.get<StoreDashboardResponse>(`${environment.apiUrl}/stores/me/dashboard`).pipe(
      map((response) => {
        const data = response.data;
        return {
          total: data.total,
          limit: data.limit,
          remaining: data.remaining,
          inStock: data.in_stock,
          lowStock: data.low_stock,
          outOfStock: data.out_of_stock,
          active: data.active,
          suspended: data.suspended,
          byCategory: data.by_category,
          addedOverTime: data.added_over_time,
        };
      }),
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }

  private mergeAndCache(partial: Partial<StoreUser>): StoreUser {
    const current = this.authService.getCurrentUser();
    if (!current) {
      throw new Error('Not authenticated');
    }

    const updatedUser: StoreUser = { ...current, ...partial };
    this.authService.cacheUser(updatedUser, this.authService.isRemembering());
    return updatedUser;
  }
}
