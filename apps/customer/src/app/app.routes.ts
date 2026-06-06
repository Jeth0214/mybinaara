import { Routes } from '@angular/router';
import { locationGuard } from './core/guards/location.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'search',
    canActivate: [locationGuard],
    loadComponent: () =>
      import('./search/search.page').then((m) => m.SearchPage),
  },
  {
    path: 'product/:id',
    canActivate: [locationGuard],
    loadComponent: () =>
      import('./product/product.page').then((m) => m.ProductPage),
  },
  {
    path: 'store/:id',
    canActivate: [locationGuard],
    loadComponent: () =>
      import('./store/store.page').then((m) => m.StorePage),
  },
  {
    path: '**',
    redirectTo: '',
  },
];