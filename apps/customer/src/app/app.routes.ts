import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/tabs/tabs-layout.component').then((m) => m.TabsLayoutComponent),
    children: [
      {
        path: 'search',
        loadComponent: () =>
          import('./features/search/search.page').then((m) => m.SearchPage),
      },
      {
        path: 'nearby',
        loadComponent: () =>
          import('./features/nearby/nearby.page').then((m) => m.NearbyPage),
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'saved',
        loadComponent: () =>
          import('./features/saved/saved.page').then((m) => m.SavedPage),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.page').then((m) => m.ProfilePage),
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
