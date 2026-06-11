import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthState } from '../../core/state/auth.state';
import { Logout } from '../../core/state/auth.actions';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
  queryParams?: Record<string, string>;
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
  @Input() expanded = true;
  @Input() mobileOpen = false;
  @Output() closeOverlay = new EventEmitter<void>();

  private store = inject(Store);
  private router = inject(Router);

  readonly currentUser = this.store.selectSignal(AuthState.user);

  readonly navGroups: NavGroup[] = [
    {
      label: 'MAIN',
      items: [
        { label: 'Dashboard', icon: 'bi-speedometer2', route: '/dashboard' },
      ],
    },
    {
      label: 'PRODUCTS',
      items: [
        { label: 'My products',  icon: 'bi-box-seam',        route: '/products',              badge: 2 },
        { label: 'Add product',  icon: 'bi-plus-circle',     route: '/products/add' },
        { label: 'Update stock', icon: 'bi-arrow-up-circle', route: '/products/update-stock' },
        { label: 'Bulk import',  icon: 'bi-upload',          route: '/products/bulk-import' },
      ],
    },
    {
      label: 'ANALYTICS',
      items: [
        { label: 'Search insights', icon: 'bi-graph-up', route: '/analytics' },
      ],
    },
    {
      label: 'SETTINGS',
      items: [
        { label: 'Store profile', icon: 'bi-shop',        route: '/settings/profile', queryParams: { tab: 'info' } },
        { label: 'Subscription',  icon: 'bi-credit-card', route: '/settings/profile', queryParams: { tab: 'subscription' } },
      ],
    },
  ];

  onLogout(): void {
    this.store.dispatch(new Logout());
    this.router.navigate(['/login']);
  }

  getInitials(name?: string): string {
    if (!name) return 'ST';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
}
