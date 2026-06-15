import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { AdminAuthState } from '../state/auth.state';

export const authGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);
  const user = store.selectSignal(AdminAuthState.user)();

  if (!user) {
    return router.createUrlTree(['/login']);
  }

  return true;
};
