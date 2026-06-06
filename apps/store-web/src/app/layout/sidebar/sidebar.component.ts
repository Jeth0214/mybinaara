import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

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
  @Input() expanded = true;
  @Input() mobileOpen = false;
  @Output() closeOverlay = new EventEmitter<void>();

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
        { label: 'Store profile', icon: 'bi-shop',        route: '/settings/profile' },
        { label: 'Subscription',  icon: 'bi-credit-card', route: '/settings/subscription' },
      ],
    },
  ];
}
