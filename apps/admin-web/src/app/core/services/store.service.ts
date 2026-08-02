import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PaginatedStores, Store, StoreScheduleDay, StoreStatus } from '../models/store.model';
import { mapHttpError } from '../utils/http-error.util';

@Injectable({ providedIn: 'root' })
export class StoreService {
  private readonly http = inject(HttpClient);

  listStores(params: {
    search?: string;
    status?: StoreStatus | 'all';
    city_id?: number | 'all';
    page?: number;
  }): Observable<PaginatedStores> {
    let httpParams = new HttpParams();
    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.status && params.status !== 'all') {
      httpParams = httpParams.set('status', params.status);
    }
    if (params.city_id && params.city_id !== 'all') {
      httpParams = httpParams.set('city_id', params.city_id);
    }
    if (params.page) {
      httpParams = httpParams.set('page', params.page);
    }

    return this.http.get<PaginatedStores>(`${environment.apiUrl}/stores`, { params: httpParams }).pipe(
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }

  getStore(id: number): Observable<Store> {
    return this.http.get<{ data: Store }>(`${environment.apiUrl}/stores/${id}`).pipe(
      map((response) => response.data),
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }

  createStore(formData: FormData): Observable<Store> {
    return this.http.post<{ data: Store }>(`${environment.apiUrl}/stores`, formData).pipe(
      map((response) => response.data),
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }

  updateStore(id: number, formData: FormData): Observable<Store> {
    formData.append('_method', 'PATCH');

    return this.http.post<{ data: Store }>(`${environment.apiUrl}/stores/${id}`, formData).pipe(
      map((response) => response.data),
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }

  updateStoreLogo(id: number, file: File): Observable<Store> {
    const formData = new FormData();
    formData.append('logo', file, file.name);

    return this.http.post<{ data: Store }>(`${environment.apiUrl}/stores/${id}/logo`, formData).pipe(
      map((response) => response.data),
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }

  updateStoreAddress(id: number, payload: Record<string, unknown>): Observable<Store> {
    return this.http.patch<{ data: Store }>(`${environment.apiUrl}/stores/${id}/address`, payload).pipe(
      map((response) => response.data),
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }

  updateStoreLocation(id: number, formData: FormData): Observable<Store> {
    formData.append('_method', 'PATCH');

    return this.http.post<{ data: Store }>(`${environment.apiUrl}/stores/${id}/location`, formData).pipe(
      map((response) => response.data),
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }

  updateStoreSchedule(id: number, schedule: StoreScheduleDay[]): Observable<Store> {
    return this.http.put<{ data: Store }>(`${environment.apiUrl}/stores/${id}/schedule`, { schedule }).pipe(
      map((response) => response.data),
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }

  updateStoreStatus(id: number, status: StoreStatus, rejectionReason?: string): Observable<Store> {
    const payload: { status: StoreStatus; rejection_reason?: string } = { status };
    if (status === 'rejected') {
      payload.rejection_reason = rejectionReason;
    }

    return this.http.patch<{ data: Store }>(`${environment.apiUrl}/stores/${id}/status`, payload).pipe(
      map((response) => response.data),
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }

  deleteStore(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/stores/${id}`).pipe(
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }
}
