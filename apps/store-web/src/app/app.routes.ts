import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'activate',
    loadComponent: () =>
      import('./features/auth/activation/activation.component').then(
        (m) => m.ActivationComponent
      ),
  },
  {
    path: '',
    canActivate: [authGuard],
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
            path: 'edit/:id',
            loadComponent: () =>
              import(
                './features/products/add-product/add-product.component'
              ).then((m) => m.AddProductComponent),
            data: { title: 'Edit Product', icon: 'bi-pencil' },
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
        ],
      },
    ],
  },
];
