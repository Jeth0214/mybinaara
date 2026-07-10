import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';
import { StoreService } from '../../core/services/store.service';
import { UserCatalogService } from '../../core/services/user-catalog.service';
import { AdminDashboardStats, RecentStore, StoreActivityItem } from '../../core/models/dashboard.model';
import { StatsOverviewComponent } from './components/stats-overview/stats-overview.component';
import { RecentStoresComponent } from './components/recent-stores/recent-stores.component';
import { StoreActivityComponent } from './components/store-activity/store-activity.component';
import { QuickActionsComponent } from './components/quick-actions/quick-actions.component';
import { AnalyticsChartsComponent } from './components/analytics-charts/analytics-charts.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DatePipe,
    StatsOverviewComponent,
    RecentStoresComponent,
    StoreActivityComponent,
    QuickActionsComponent,
    AnalyticsChartsComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly storeService = inject(StoreService);
  private readonly userCatalogService = inject(UserCatalogService);

  readonly loading = signal(true);
  readonly recentStores = signal<RecentStore[]>([]);
  readonly activity = signal<StoreActivityItem[]>([]);
  readonly today = new Date();

  // Computes dashboard stats reactively using live signals from our services
  readonly computedStats = computed<AdminDashboardStats>(() => {
    return {
      activeStores: this.storeService.activeStores().length,
      adminUsers: this.userCatalogService.admins().length,
      catalogProducts: this.userCatalogService.products().length,
      categories: this.userCatalogService.categories().length,
    };
  });

  ngOnInit(): void {
    this.dashboardService.getRecentStores().subscribe((data) => {
      this.recentStores.set(data);
    });

    this.dashboardService.getStoreActivity().subscribe((data) => {
      this.activity.set(data);
      this.loading.set(false);
    });
  }
}
