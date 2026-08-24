import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  CatalogProduct,
  CatalogProductDetailResponse,
  CatalogProductListResponse,
} from '../../core/models/catalog-product.model';
import { ProductListing, ProductListingsResponse } from '../../core/models/product-listing.model';
import { mapHttpError } from '../utils/http-error.util';

export interface ProductSearchParams {
  search?: string;
  category_id?: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);

  readonly products = signal<CatalogProduct[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<boolean>(false);

  /** Always fetches fresh — search results change per query, unlike categories' one-time load. */
  search(params: ProductSearchParams): void {
    this.loading.set(true);
    this.error.set(false);

    let httpParams = new HttpParams();
    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.category_id !== undefined) {
      httpParams = httpParams.set('category_id', params.category_id);
    }

    this.http
      .get<CatalogProductListResponse>(`${environment.apiUrl}/catalog-products`, { params: httpParams })
      .pipe(catchError((err) => throwError(() => mapHttpError(err))))
      .subscribe({
        next: (response) => {
          this.products.set(response.data);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.error.set(true);
        },
      });
  }

  getById(id: number): Observable<CatalogProduct> {
    return this.http.get<CatalogProductDetailResponse>(`${environment.apiUrl}/catalog-products/${id}`).pipe(
      map((response) => response.data),
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }

  getListings(catalogProductId: number, lat: number, lng: number): Observable<ProductListing[]> {
    const params = new HttpParams().set('lat', lat).set('lng', lng);

    return this.http
      .get<ProductListingsResponse>(`${environment.apiUrl}/catalog-products/${catalogProductId}/listings`, { params })
      .pipe(
        map((response) => response.data),
        catchError((err) => throwError(() => mapHttpError(err)))
      );
  }
}
