import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Logout } from '../state/auth.actions';
import { clearToken, getToken } from '../services/token-storage';
import { ToastService } from '../services/toast.service';

const SESSION_KEY = 'mybinaara_store_active_session';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const store = inject(Store);
  const toastService = inject(ToastService);

  const isApiRequest = req.url.startsWith(environment.apiUrl);
  const token = getToken();

  const authReq = isApiRequest && token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: unknown) => {
      // Only token present at request time so a re-triggered, already-token-less
      // /logout call (fired by the Logout action below) doesn't recurse.
      if (isApiRequest && token && err instanceof HttpErrorResponse) {
        // 401: token is already invalid/expired.
        // 403 with code "store_inactive": the backend just revoked the token
        // (EnsureVendorStoreIsActive deletes it server-side the moment the
        // store is suspended/rejected/pending) — must log out on this very
        // first blocked request rather than waiting for the next one to 401.
        const isStoreInactive = err.status === 403 && err.error?.code === 'store_inactive';
        if (err.status === 401 || isStoreInactive) {
          clearToken();
          localStorage.removeItem(SESSION_KEY);
          sessionStorage.removeItem(SESSION_KEY);
          store.dispatch(new Logout());
          if (isStoreInactive && err.error?.message) {
            toastService.error(err.error.message);
          }
          router.navigate(['/login']);
        }
      }
      return throwError(() => err);
    })
  );
};
