import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./search/search.page').then((m) => m.SearchPage),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
