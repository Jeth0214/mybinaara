import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AdminDashboardStats } from '../../../../core/models/dashboard.model';

@Component({
  selector: 'app-stats-overview',
  standalone: true,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stats-overview.component.html',
  styleUrl: './stats-overview.component.scss',
})
export class StatsOverviewComponent {
  readonly stats = input.required<AdminDashboardStats>();

  readonly statCards = computed(() => {
    const s = this.stats();
    return [
      { label: 'Active Stores', value: s.activeStores, subtitle: 'Live registered merchants', icon: 'bi-shop-window', color: 'green' },
      { label: 'Admin Users', value: s.adminUsers, subtitle: 'Platform operators list', icon: 'bi-person-gear', color: 'blue' },
      { label: 'Catalog Products', value: s.catalogProducts, subtitle: 'Total master items database', icon: 'bi-box-seam', color: 'green' },
      { label: 'Categories', value: s.categories, subtitle: 'Active catalog categories', icon: 'bi-tags', color: 'gold' },
    ];
  });
}
