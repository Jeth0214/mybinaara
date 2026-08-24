import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  computed,
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

  readonly navGroups = computed<NavGroup[]>(() => [
    {
      label: 'MAIN',
      items: [
        { label: 'Dashboard', icon: 'bi-speedometer2', route: '/dashboard' },
      ],
    },
    {
      label: 'PRODUCTS',
      items: [
        { label: 'My products', icon: 'bi-box-seam', route: '/products' },
      ],
    },
    {
      label: 'SETTINGS',
      items: [
        { label: 'Store profile', icon: 'bi-shop', route: '/settings/profile', queryParams: { tab: 'info' } },
      ],
    },
  ]);

  onLogout(): void {
    this.store.dispatch(new Logout());
    this.router.navigate(['/login']);
  }
}
