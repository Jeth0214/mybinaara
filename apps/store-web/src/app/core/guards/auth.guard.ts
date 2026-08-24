import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthState } from '../state/auth.state';
import { getToken } from '../services/token-storage';

export const authGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);
  const user = store.selectSignal(AuthState.user)();

  // If user is not logged in, or has no stored token, send them to login screen
  if (!user || !getToken()) {
    return router.createUrlTree(['/login']);
  }

  // If user is logged in but has not completed the activation workflow, redirect to stepper activation
  if (!user.isActivated) {
    return router.createUrlTree(['/activate']);
  }

  return true;
};
