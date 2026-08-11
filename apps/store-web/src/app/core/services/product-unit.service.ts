import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ProductUnit } from '../models/product-unit.model';
import { mapHttpError } from '../utils/http-error.util';

/** Read-only: store-web only needs the active-units dropdown source, not full CRUD. */
@Injectable({ providedIn: 'root' })
export class ProductUnitService {
  private readonly http = inject(HttpClient);

  listActive(): Observable<ProductUnit[]> {
    return this.http.get<{ data: ProductUnit[] }>(`${environment.apiUrl}/product-units/active`).pipe(
      map((response) => response.data),
      catchError((err) => throwError(() => mapHttpError(err)))
    );
  }
}
