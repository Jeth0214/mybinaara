import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Category, PaginatedCategories } from '../models/category.model';
import { mapHttpError } from '../utils/http-error.util';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);

  listCategories(params: { search?: string; page?: number; is_active?: boolean }): Observable<PaginatedCategories> {
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

    return this.http.get<PaginatedCategories>(`${environment.apiUrl}/categories`, { params: httpParams }).pipe(
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }

  getCategory(id: number): Observable<Category> {
    return this.http.get<{ data: Category }>(`${environment.apiUrl}/categories/${id}`).pipe(
      map((response) => response.data),
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }

  createCategory(formData: FormData): Observable<Category> {
    return this.http.post<{ data: Category }>(`${environment.apiUrl}/categories`, formData).pipe(
      map((response) => response.data),
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }

  updateCategory(id: number, formData: FormData): Observable<Category> {
    formData.append('_method', 'PATCH');

    return this.http.post<{ data: Category }>(`${environment.apiUrl}/categories/${id}`, formData).pipe(
      map((response) => response.data),
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/categories/${id}`).pipe(
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }

  toggleCategoryStatus(id: number): Observable<Category> {
    return this.http.patch<{ data: Category }>(`${environment.apiUrl}/categories/${id}/toggle-status`, {}).pipe(
      map((response) => response.data),
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }
}
