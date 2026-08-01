import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminLogout } from '../state/auth.actions';
import { clearToken, getToken } from '../services/token-storage';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const store = inject(Store);

  const isApiRequest = req.url.startsWith(environment.apiUrl);
  const token = getToken();

  const authReq = isApiRequest && token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: unknown) => {
      // Only token present at request time so a re-triggered, already-token-less
      // /logout call (fired by the AdminLogout action below) doesn't recurse.
      if (isApiRequest && token && err instanceof HttpErrorResponse && err.status === 401) {
        clearToken();
        localStorage.removeItem('admin_current_user');
        sessionStorage.removeItem('admin_current_user');
        store.dispatch(new AdminLogout());
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};
