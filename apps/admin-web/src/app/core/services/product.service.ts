import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PaginatedProducts, Product, ProductStatus } from '../models/product.model';
import { mapHttpError } from '../utils/http-error.util';

export type ProductSort = 'latest' | 'name' | 'price_asc' | 'price_desc';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);

  listProducts(params: {
    search?: string;
    page?: number;
    status?: ProductStatus | 'all';
    store_name?: string;
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
    if (params.store_name) {
      httpParams = httpParams.set('store_name', params.store_name);
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

  createProduct(formData: FormData): Observable<Product> {
    return this.http.post<{ data: Product }>(`${environment.apiUrl}/products`, formData).pipe(
      map((response) => response.data),
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }

  updateProduct(id: number, formData: FormData): Observable<Product> {
    formData.append('_method', 'PATCH');

    return this.http.post<{ data: Product }>(`${environment.apiUrl}/products/${id}`, formData).pipe(
      map((response) => response.data),
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/products/${id}`).pipe(
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }

  updateProductStatus(id: number, status: ProductStatus, suspensionReason?: string): Observable<Product> {
    const payload: { status: ProductStatus; suspension_reason?: string } = { status };
    if (status === 'suspended') {
      payload.suspension_reason = suspensionReason;
    }

    return this.http.patch<{ data: Product }>(`${environment.apiUrl}/products/${id}/status`, payload).pipe(
      map((response) => response.data),
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }
}
