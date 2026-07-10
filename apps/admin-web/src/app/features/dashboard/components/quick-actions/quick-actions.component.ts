import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quick-actions.component.html',
  styleUrl: './quick-actions.component.scss',
})
export class QuickActionsComponent {
  readonly actions = [
    {
      label: 'Create Store',
      description: 'Register a new vendor',
      icon: 'bi-plus-circle',
      route: '/stores/create',
      bg: 'rgba(45, 122, 79, 0.1)',
      color: '#2d7a4f',
    },
    {
      label: 'Add Admin User',
      description: 'Register user',
      icon: 'bi-person-plus',
      route: '/users/admins/create',
      bg: 'rgba(41, 128, 185, 0.1)',
      color: '#2980b9',
    },
    {
      label: 'Manage Products',
      description: 'Browse the catalog',
      icon: 'bi-box-seam',
      route: '/catalog/products',
      bg: 'rgba(217, 146, 1, 0.1)',
      color: '#d99201',
    },
    {
      label: 'Add Category',
      description: 'Create a new category',
      icon: 'bi-tags',
      route: '/catalog/categories/create',
      bg: 'rgba(111, 66, 193, 0.1)',
      color: '#6f42c1',
    },
  ];
}
