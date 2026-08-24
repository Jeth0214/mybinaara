import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CatalogProduct, PaginatedCatalogProducts } from '../models/catalog-product.model';
import { mapHttpError } from '../utils/http-error.util';

/** The shared, cross-vendor product catalog — search-or-create, never
 *  store-scoped. Actual store listings (price/stock) live in ProductService. */
@Injectable({ providedIn: 'root' })
export class CatalogProductService {
  private readonly http = inject(HttpClient);

  searchCatalog(params: { search?: string; category_id?: number } = {}): Observable<PaginatedCatalogProducts> {
    // Store/admin users are picking a catalog item to list, so unlike the
    // customer app's browse view, unlisted (0-store) entries must show up too.
    let httpParams = new HttpParams().set('include_unlisted', '1');
    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.category_id) {
      httpParams = httpParams.set('category_id', params.category_id);
    }

    return this.http.get<PaginatedCatalogProducts>(`${environment.apiUrl}/catalog-products`, { params: httpParams }).pipe(
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }

  createCatalogProduct(formData: FormData): Observable<CatalogProduct> {
    return this.http.post<{ data: CatalogProduct }>(`${environment.apiUrl}/catalog-products`, formData).pipe(
      map((response) => response.data),
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }
}
