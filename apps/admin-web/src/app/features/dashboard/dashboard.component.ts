import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';
import { AdminDashboardStats, DashboardCharts, RecentStore, StoreActivityItem } from '../../core/models/dashboard.model';
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

  readonly loading = signal(true);
  readonly stats = signal<AdminDashboardStats>({ activeStores: 0, adminUsers: 0, catalogProducts: 0, categories: 0 });
  readonly charts = signal<DashboardCharts | null>(null);
  readonly recentStores = signal<RecentStore[]>([]);
  readonly activity = signal<StoreActivityItem[]>([]);
  readonly today = new Date();

  ngOnInit(): void {
    this.dashboardService.getDashboard().subscribe((data) => {
      this.stats.set(data.stats);
      this.charts.set(data.charts);
      this.recentStores.set(data.recentStores);
      this.activity.set(data.storeActivity);
      this.loading.set(false);
    });
  }
}
