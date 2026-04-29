import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LocationService } from '../../shared/services/location.service';

export const locationGuard: CanActivateFn = () => {
  const locationService = inject(LocationService);
  const router = inject(Router);

  if (locationService.coords() === null) {
    return router.createUrlTree(['']);
  }
  return true;
};