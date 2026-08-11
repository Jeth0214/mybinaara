import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PaginatedProductUnits, ProductUnit, ProductUnitPayload } from '../models/product-unit.model';
import { mapHttpError } from '../utils/http-error.util';

@Injectable({ providedIn: 'root' })
export class ProductUnitService {
  private readonly http = inject(HttpClient);

  listProductUnits(params: { search?: string; page?: number; is_active?: boolean }): Observable<PaginatedProductUnits> {
    let httpParams = new HttpParams();
    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.page) {
      httpParams = httpParams.set('page', params.page);
    }
    if (params.is_active !== undefined) {
      httpParams = httpParams.set('is_active', params.is_active ? '1' : '0');
    }

    return this.http.get<PaginatedProductUnits>(`${environment.apiUrl}/product-units`, { params: httpParams }).pipe(
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }

  getProductUnit(id: number): Observable<ProductUnit> {
    return this.http.get<{ data: ProductUnit }>(`${environment.apiUrl}/product-units/${id}`).pipe(
      map((response) => response.data),
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }

  createProductUnit(payload: ProductUnitPayload): Observable<ProductUnit> {
    return this.http.post<{ data: ProductUnit }>(`${environment.apiUrl}/product-units`, payload).pipe(
      map((response) => response.data),
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }

  updateProductUnit(id: number, payload: Partial<ProductUnitPayload>): Observable<ProductUnit> {
    return this.http.patch<{ data: ProductUnit }>(`${environment.apiUrl}/product-units/${id}`, payload).pipe(
      map((response) => response.data),
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }

  deleteProductUnit(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/product-units/${id}`).pipe(
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }
}
