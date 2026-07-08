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
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/layout/layout.component').then(
        (m) => m.LayoutComponent
      ),
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
      // ── Stores ────────────────────────────────────────────────────────
      {
        path: 'stores',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/stores/store-list/store-list.component').then(
                (m) => m.StoreListComponent
              ),
            data: { title: 'All Stores', icon: 'bi-shop-window' },
          },
          {
            path: 'create',
            loadComponent: () =>
              import('./features/stores/store-create/store-create.component').then(
                (m) => m.StoreCreateComponent
              ),
            data: { title: 'Create Store', icon: 'bi-plus-circle' },
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./features/stores/store-create/store-create.component').then(
                (m) => m.StoreCreateComponent
              ),
            data: { title: 'Edit Store', icon: 'bi-pencil' },
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/stores/store-detail/store-detail.component').then(
                (m) => m.StoreDetailComponent
              ),
            data: { title: 'Store Details', icon: 'bi-shop' },
          },
        ],
      },
      // ── Users ─────────────────────────────────────────────────────────
      {
        path: 'users',
        children: [
          {
            path: 'customers',
            loadComponent: () =>
              import('./features/users/customer-list/customer-list.component').then(
                (m) => m.CustomerListComponent
              ),
            data: { title: 'Customers', icon: 'bi-people' },
          },
          {
            path: 'admins',
            loadComponent: () =>
              import('./features/users/admin-users/admin-users.component').then(
                (m) => m.AdminUsersComponent
              ),
            data: { title: 'Admin Users', icon: 'bi-person-gear' },
          },
        ],
      },
      // ── Catalog ───────────────────────────────────────────────────────
      {
        path: 'catalog',
        children: [
          {
            path: 'products',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/catalog/product-list/product-list.component').then(
                    (m) => m.ProductListComponent
                  ),
                data: { title: 'Product Catalog', icon: 'bi-box-seam' },
              },
              {
                path: ':id/edit',
                loadComponent: () =>
                  import('./features/catalog/product-edit/product-edit.component').then(
                    (m) => m.ProductEditComponent
                  ),
                data: { title: 'Edit Product', icon: 'bi-pencil' },
              },
              {
                path: ':id',
                loadComponent: () =>
                  import('./features/catalog/product-detail/product-detail.component').then(
                    (m) => m.ProductDetailComponent
                  ),
                data: { title: 'Product Details', icon: 'bi-box-seam' },
              },
            ],
          },
          {
            path: 'categories',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/catalog/category-management/category-management.component').then(
                    (m) => m.CategoryManagementComponent
                  ),
                data: { title: 'Categories', icon: 'bi-tags' },
              },
              {
                path: 'create',
                loadComponent: () =>
                  import('./features/catalog/category-form/category-form.component').then(
                    (m) => m.CategoryFormComponent
                  ),
                data: { title: 'Create Category', icon: 'bi-plus-circle' },
              },
              {
                path: ':id/edit',
                loadComponent: () =>
                  import('./features/catalog/category-form/category-form.component').then(
                    (m) => m.CategoryFormComponent
                  ),
                data: { title: 'Edit Category', icon: 'bi-pencil' },
              },
              {
                path: ':id',
                loadComponent: () =>
                  import('./features/catalog/category-detail/category-detail.component').then(
                    (m) => m.CategoryDetailComponent
                  ),
                data: { title: 'Category Details', icon: 'bi-tags' },
              },
            ],
          },
        ],
      },
      // ── Subscriptions ─────────────────────────────────────────────────
      {
        path: 'subscriptions',
        children: [
          {
            path: 'plans',
            loadComponent: () =>
              import('./features/subscriptions/plan-management/plan-management.component').then(
                (m) => m.PlanManagementComponent
              ),
            data: { title: 'Plans', icon: 'bi-credit-card' },
          },
          {
            path: 'stores',
            loadComponent: () =>
              import('./features/subscriptions/store-subscriptions/store-subscriptions.component').then(
                (m) => m.StoreSubscriptionsComponent
              ),
            data: { title: 'Store Subscriptions', icon: 'bi-receipt' },
          },
        ],
      },
      // ── Support ───────────────────────────────────────────────────────
      {
        path: 'support',
        children: [
          {
            path: 'tickets',
            loadComponent: () =>
              import('./features/support/ticket-queue/ticket-queue.component').then(
                (m) => m.TicketQueueComponent
              ),
            data: { title: 'Support Tickets', icon: 'bi-ticket' },
          },
          {
            path: 'audit-logs',
            loadComponent: () =>
              import('./features/support/audit-logs/audit-logs.component').then(
                (m) => m.AuditLogsComponent
              ),
            data: { title: 'Audit Logs', icon: 'bi-journal-text' },
          },
          {
            path: 'notifications',
            loadComponent: () =>
              import('./features/support/notifications/notifications.component').then(
                (m) => m.NotificationsComponent
              ),
            data: { title: 'Notifications', icon: 'bi-bell' },
          },
        ],
      },
    ],
  },
];
