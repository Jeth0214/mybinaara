import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

export interface AdminDashboardStats {
  activeStores: number;
  unsubscribedStores: number;
  adminUsers: number;
  catalogProducts: number;
}

@Component({
  selector: 'app-stats-overview',
  standalone: true,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="row g-3">
      @for (card of statCards(); track card.label) {
        <div class="col-xl-3 col-md-6 col-12">
          <div class="stat-card">
            <div class="stat-icon" [class]="'stat-icon stat-icon--' + card.color">
              <i class="bi" [class]="card.icon"></i>
            </div>
            <div class="stat-content">
              <div class="stat-label">{{ card.label }}</div>
              <div class="stat-value">
                {{ card.value | number }}
              </div>
              <div class="stat-trend" style="color: var(--brand-text-light);">
                {{ card.subtitle }}
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class StatsOverviewComponent {
  readonly stats = input.required<AdminDashboardStats>();

  readonly statCards = computed(() => {
    const s = this.stats();
    return [
      { label: 'Active Stores', value: s.activeStores, subtitle: 'Live registered merchants', icon: 'bi-shop-window', color: 'green' },
      { label: 'Unsubscribed', value: s.unsubscribedStores, subtitle: 'Expired subscription tiers', icon: 'bi-exclamation-circle', color: 'danger' },
      { label: 'Admin Users', value: s.adminUsers, subtitle: 'Platform operators list', icon: 'bi-person-gear', color: 'blue' },
      { label: 'Catalog Products', value: s.catalogProducts, subtitle: 'Total master items database', icon: 'bi-box-seam', color: 'green' },
    ];
  });
}
