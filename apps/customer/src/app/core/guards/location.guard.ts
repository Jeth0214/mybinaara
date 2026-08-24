import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { LocationService } from '../../shared/services/location.service';

export const locationGuard: CanActivateFn = () => {
  const locationService = inject(LocationService);
  const router = inject(Router);

  if (locationService.coords() !== null) return true;

  // Coords aren't resolved yet — this doesn't necessarily mean location is
  // unavailable, initialize() may still be in flight (e.g. right after a
  // page refresh). Wait for it to actually settle (coords set, or loading
  // finishes without them) instead of redirecting on a still-pending value.
  return combineLatest([toObservable(locationService.coords), toObservable(locationService.loading)]).pipe(
    filter(([coords, loading]) => coords !== null || !loading),
    take(1),
    map(([coords]) => (coords !== null ? true : router.createUrlTree(['']))),
  );
};
