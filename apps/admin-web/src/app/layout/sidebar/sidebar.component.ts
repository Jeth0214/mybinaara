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

  readonly userRoleLabel = computed(() => {
    const role = this.currentUser()?.role;
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'support':     return 'Support';
      case 'finance':     return 'Finance';
      case 'ops':         return 'Operations';
      default:            return 'Admin';
    }
  });

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
        { label: 'Verification', icon: 'bi-shield-check', route: '/stores/verification' },
      ],
    },
    {
      label: 'CATALOG',
      items: [
        { label: 'Products', icon: 'bi-box-seam', route: '/catalog/products' },
        { label: 'Categories', icon: 'bi-tags', route: '/catalog/categories' },
        { label: 'Approvals', icon: 'bi-check2-square', route: '/catalog/approvals' },
      ],
    },
    {
      label: 'BILLING',
      items: [
        { label: 'Plans', icon: 'bi-credit-card', route: '/subscriptions/plans' },
        { label: 'Subscriptions', icon: 'bi-receipt', route: '/subscriptions/stores' },
      ],
    },
    {
      label: 'SUPPORT',
      items: [
        { label: 'Tickets', icon: 'bi-ticket', route: '/support/tickets' },
        { label: 'Audit Logs', icon: 'bi-journal-text', route: '/support/audit-logs' },
        { label: 'Notifications', icon: 'bi-bell', route: '/support/notifications' },
      ],
    },
    {
      label: 'SETTINGS',
      items: [
        { label: 'Admin Users', icon: 'bi-person-gear', route: '/users/admins' },
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
