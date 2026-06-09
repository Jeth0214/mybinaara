import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthState } from '../state/auth.state';

export const authGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);
  const user = store.selectSignal(AuthState.user)();

  // If user is not logged in, send them to login screen
  if (!user) {
    return router.createUrlTree(['/login']);
  }

  // If user is logged in but has not completed the activation workflow, redirect to stepper activation
  if (!user.isActivated) {
    return router.createUrlTree(['/activate']);
  }

  return true;
};
