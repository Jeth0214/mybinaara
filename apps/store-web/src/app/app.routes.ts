import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/layout/layout.component').then((m) => m.LayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
        data: { title: 'Dashboard', icon: 'bi-speedometer2' },
      },
      {
        path: 'products',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/products/products.component').then(
                (m) => m.ProductsComponent
              ),
            data: { title: 'My Products', icon: 'bi-box-seam' },
          },
          {
            path: 'add',
            loadComponent: () =>
              import(
                './features/products/add-product/add-product.component'
              ).then((m) => m.AddProductComponent),
            data: { title: 'Add Product', icon: 'bi-plus-circle' },
          },
          {
            path: 'update-stock',
            loadComponent: () =>
              import(
                './features/products/update-stock/update-stock.component'
              ).then((m) => m.UpdateStockComponent),
            data: { title: 'Update Stock', icon: 'bi-arrow-up-circle' },
          },
          {
            path: 'bulk-import',
            loadComponent: () =>
              import(
                './features/products/bulk-import/bulk-import.component'
              ).then((m) => m.BulkImportComponent),
            data: { title: 'Bulk Import', icon: 'bi-upload' },
          },
        ],
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./features/analytics/analytics.component').then(
            (m) => m.AnalyticsComponent
          ),
        data: { title: 'Search Insights', icon: 'bi-graph-up' },
      },
      {
        path: 'settings',
        children: [
          {
            path: 'profile',
            loadComponent: () =>
              import(
                './features/settings/store-profile/store-profile.component'
              ).then((m) => m.StoreProfileComponent),
            data: { title: 'Store Profile', icon: 'bi-shop' },
          },
          {
            path: 'subscription',
            loadComponent: () =>
              import(
                './features/settings/subscription/subscription.component'
              ).then((m) => m.SubscriptionComponent),
            data: { title: 'Subscription', icon: 'bi-credit-card' },
          },
        ],
      },
    ],
  },
];
