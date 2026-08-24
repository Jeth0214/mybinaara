import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { NearbyStoresResponse, Store, StoreDetailResponse } from '../../core/models/store.model';
import { mapHttpError } from '../utils/http-error.util';
import { LocationService } from './location.service';

/** Fetches the nearest stores to a given point and shares the result across all consumers. */
@Injectable({ providedIn: 'root' })
export class StoreService {
  private readonly http = inject(HttpClient);
  private readonly locationService = inject(LocationService);

  private static readonly REFETCH_THRESHOLD_KM = 0.05;

  private lastFetchedCoords: { lat: number; lng: number } | null = null;

  readonly stores = signal<Store[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<boolean>(false);

  /** No-ops if a fetch is already in flight, or the given point is within
   *  ~50m of the last fetch — avoids refetching on GPS jitter while still
   *  picking up genuine movement. */
  ensureLoaded(lat: number, lng: number, limit = 5): void {
    if (this.loading()) return;

    if (this.lastFetchedCoords) {
      const moved = this.locationService.calculateDistance(
        this.lastFetchedCoords.lat,
        this.lastFetchedCoords.lng,
        lat,
        lng
      );
      if (moved < StoreService.REFETCH_THRESHOLD_KM) return;
    }

    this.loading.set(true);
    this.error.set(false);

    this.http
      .get<NearbyStoresResponse>(`${environment.apiUrl}/stores/nearby`, {
        params: new HttpParams().set('lat', lat).set('lng', lng).set('limit', limit),
      })
      .pipe(catchError((err) => throwError(() => mapHttpError(err))))
      .subscribe({
        next: (response) => {
          this.stores.set(response.data);
          this.lastFetchedCoords = { lat, lng };
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.error.set(true);
        },
      });
  }

  /** Fresh, uncached fetch for a single store — the detail page owns its own loading/error state per navigation. */
  getById(id: number): Observable<Store> {
    return this.http.get<StoreDetailResponse>(`${environment.apiUrl}/stores/${id}/details`).pipe(
      map((response) => response.data),
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }
}
