import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngxs/store';
import { AdminAuthState } from '../../core/state/auth.state';
import { AdminLogout } from '../../core/state/auth.actions';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  /** Signal inputs (optimized — no @Input decorators) */
  readonly expanded = input(true);
  readonly mobileOpen = input(false);

  /** Signal output */
  readonly closeOverlay = output<void>();

  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly currentUser = this.store.selectSignal(AdminAuthState.user);

  readonly userRoleLabel = computed(() =>
    this.currentUser()?.role === 'administrator' ? 'Administrator' : 'Staff'
  );

  readonly navGroups = computed<NavGroup[]>(() => [
    {
      label: 'MAIN',
      items: [
        { label: 'Dashboard', icon: 'bi-speedometer2', route: '/dashboard' },
      ],
    },
    {
      label: 'STORES',
      items: [
        { label: 'All Stores', icon: 'bi-shop-window', route: '/stores' },
        { label: 'Create Store', icon: 'bi-plus-circle', route: '/stores/create' },
      ],
    },
    {
      label: 'CATALOG',
      items: [
        { label: 'Products', icon: 'bi-box-seam', route: '/catalog/products' },
        { label: 'Categories', icon: 'bi-tags', route: '/catalog/categories' },
      ],
    },
    {
      label: 'SETTINGS',
      items: [
        { label: 'Users', icon: 'bi-person-gear', route: '/users/admins' },
      ],
    },
  ]);

  onLogout(): void {
    this.store.dispatch(new AdminLogout());
    this.router.navigate(['/login']);
  }

  getInitials(name?: string): string {
    if (!name) return 'AD';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
}
