import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngxs/store';
import { AuthState } from '../../core/state/auth.state';
import { StoreService } from '../../core/services/store.service';
import { MAX_PRODUCTS_PER_STORE } from '../../core/models/product.model';
import { StoreDashboardCategoryCount, StoreDashboardDailyCount } from '../../core/models/store-dashboard.model';
import { DashboardGreetingComponent } from './components/dashboard-greeting/dashboard-greeting.component';
import { DashboardProductsComponent } from './components/dashboard-products/dashboard-products.component';
import { DashboardCatalogInsightsComponent } from './components/dashboard-catalog-insights/dashboard-catalog-insights.component';
import { DashboardTrendChartComponent } from './components/dashboard-trend-chart/dashboard-trend-chart.component';
import { DashboardFooterComponent } from './components/dashboard-footer/dashboard-footer.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DashboardGreetingComponent,
    DashboardProductsComponent,
    DashboardCatalogInsightsComponent,
    DashboardTrendChartComponent,
    DashboardFooterComponent,
  ],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly storeService = inject(StoreService);

  readonly user = this.store.selectSignal(AuthState.user);

  readonly productsLimit = signal(MAX_PRODUCTS_PER_STORE);
  readonly productsCount = signal(0);
  readonly remainingCount = signal(MAX_PRODUCTS_PER_STORE);
  readonly inStockCount = signal(0);
  readonly lowStockCount = signal(0);
  readonly outOfStockCount = signal(0);
  readonly activeCount = signal(0);
  readonly suspendedCount = signal(0);
  readonly byCategory = signal<StoreDashboardCategoryCount[]>([]);
  readonly addedOverTime = signal<StoreDashboardDailyCount[]>([]);

  readonly progressPercent = computed(() => {
    const limit = this.productsLimit();
    return limit ? Math.min((this.productsCount() / limit) * 100, 100) : 0;
  });

  readonly loading = signal<boolean>(false);

  ngOnInit(): void {
    this.loading.set(true);

    this.storeService.getDashboardStats().subscribe({
      next: (stats) => {
        this.loading.set(false);
        this.productsCount.set(stats.total);
        this.productsLimit.set(stats.limit);
        this.remainingCount.set(stats.remaining);
        this.inStockCount.set(stats.inStock);
        this.lowStockCount.set(stats.lowStock);
        this.outOfStockCount.set(stats.outOfStock);
        this.activeCount.set(stats.active);
        this.suspendedCount.set(stats.suspended);
        this.byCategory.set(stats.byCategory);
        this.addedOverTime.set(stats.addedOverTime);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
