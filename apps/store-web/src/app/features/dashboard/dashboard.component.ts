import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngxs/store';
import { AuthState } from '../../core/state/auth.state';
import { ProductService } from '../../core/services/product.service';
import { MAX_PRODUCTS_PER_STORE } from '../../core/models/product.model';
import { DashboardGreetingComponent } from './components/dashboard-greeting/dashboard-greeting.component';
import { DashboardProductsComponent } from './components/dashboard-products/dashboard-products.component';
import { DashboardFooterComponent } from './components/dashboard-footer/dashboard-footer.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DashboardGreetingComponent,
    DashboardProductsComponent,
    DashboardFooterComponent,
  ],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly productService = inject(ProductService);

  readonly user = this.store.selectSignal(AuthState.user);

  readonly productsLimit = signal(MAX_PRODUCTS_PER_STORE);
  readonly productsCount = signal(0);
  readonly inStockCount = signal(0);
  readonly lowStockCount = signal(0);
  readonly outOfStockCount = signal(0);

  readonly progressPercent = computed(() => {
    const limit = this.productsLimit();
    return limit ? Math.min((this.productsCount() / limit) * 100, 100) : 0;
  });

  readonly loading = signal<boolean>(false);

  ngOnInit(): void {
    this.loading.set(true);

    // Dashboard stock counters only reflect the products returned by this
    // single unfiltered page — there is no dedicated stats endpoint.
    this.productService.listProducts({}).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.productsCount.set(response.meta.total);
        this.inStockCount.set(response.data.filter((p) => p.stock_quantity > 10).length);
        this.lowStockCount.set(response.data.filter((p) => p.stock_quantity > 0 && p.stock_quantity <= 10).length);
        this.outOfStockCount.set(response.data.filter((p) => p.stock_quantity === 0).length);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
