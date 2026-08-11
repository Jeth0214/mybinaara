import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PaginatedCategories } from '../models/category.model';
import { mapHttpError } from '../utils/http-error.util';

/** Read-only: store-web only needs categories for dropdown population, not full CRUD. */
@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);

  listCategories(params: { search?: string; is_active?: boolean } = {}): Observable<PaginatedCategories> {
    let httpParams = new HttpParams();
    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.is_active !== undefined) {
      httpParams = httpParams.set('is_active', params.is_active ? '1' : '0');
    }

    return this.http.get<PaginatedCategories>(`${environment.apiUrl}/categories`, { params: httpParams }).pipe(
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }
}
