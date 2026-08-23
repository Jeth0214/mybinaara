import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PaginatedProducts, Product, ProductStatus } from '../models/product.model';
import { mapHttpError } from '../utils/http-error.util';

export type ProductSort = 'latest' | 'name' | 'price_asc' | 'price_desc';

/** Store-scoped Product CRUD. store_id is never sent — the backend forces
 *  list/create to the authenticated store user's own store, and enforces
 *  view/update/delete ownership server-side via the store_user pivot. */
@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);

  listProducts(params: {
    search?: string;
    page?: number;
    status?: ProductStatus | 'all';
    category_id?: number;
    unit_id?: number;
    sort?: ProductSort;
  }): Observable<PaginatedProducts> {
    let httpParams = new HttpParams();
    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.page) {
      httpParams = httpParams.set('page', params.page);
    }
    if (params.status && params.status !== 'all') {
      httpParams = httpParams.set('status', params.status);
    }
    if (params.category_id) {
      httpParams = httpParams.set('category_id', params.category_id);
    }
    if (params.unit_id) {
      httpParams = httpParams.set('unit_id', params.unit_id);
    }
    if (params.sort) {
      httpParams = httpParams.set('sort', params.sort);
    }

    return this.http.get<PaginatedProducts>(`${environment.apiUrl}/products`, { params: httpParams }).pipe(
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<{ data: Product }>(`${environment.apiUrl}/products/${id}`).pipe(
      map((response) => response.data),
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }

  createProduct(payload: Record<string, unknown>): Observable<Product> {
    return this.http.post<{ data: Product }>(`${environment.apiUrl}/products`, payload).pipe(
      map((response) => response.data),
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }

  /** No image involved here anymore — catalog_product_id is immutable once
   *  set, so only price/stock/sku/compare_at_price are ever updated. */
  updateProduct(id: number, payload: Record<string, unknown>): Observable<Product> {
    return this.http.patch<{ data: Product }>(`${environment.apiUrl}/products/${id}`, payload).pipe(
      map((response) => response.data),
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }

  /** Lightweight stock-only update (quick-stock modal, bulk stock page) — a
   *  plain JSON PATCH, no multipart needed since no image is ever involved. */
  updateProductStock(id: number, stock_quantity: number): Observable<Product> {
    return this.http.patch<{ data: Product }>(`${environment.apiUrl}/products/${id}`, { stock_quantity }).pipe(
      map((response) => response.data),
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/products/${id}`).pipe(
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }

  /** Store users may only ever request active/inactive — suspend is
   *  admin-only server-side, and this signature makes it impossible for the
   *  store portal to even attempt requesting a suspend. */
  updateProductStatus(id: number, status: 'active' | 'inactive'): Observable<Product> {
    return this.http.patch<{ data: Product }>(`${environment.apiUrl}/products/${id}/status`, { status }).pipe(
      map((response) => response.data),
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }
}
