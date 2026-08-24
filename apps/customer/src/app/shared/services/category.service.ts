import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Category, PaginatedCategories } from '../../core/models/category.model';
import { mapHttpError } from '../utils/http-error.util';

/** Fetches active categories once and shares the result across all consumers (home, search, ...). */
@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private loaded = false;

  readonly categories = signal<Category[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<boolean>(false);

  ensureLoaded(): void {
    if (this.loaded || this.loading()) return;

    this.loading.set(true);
    this.error.set(false);

    this.http
      .get<PaginatedCategories>(`${environment.apiUrl}/categories`, {
        params: new HttpParams().set('is_active', '1'),
      })
      .pipe(catchError((err) => throwError(() => mapHttpError(err))))
      .subscribe({
        next: (response) => {
          this.categories.set(response.data);
          this.loaded = true;
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.error.set(true);
        },
      });
  }
}
