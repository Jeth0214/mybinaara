import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { DashboardGreetingComponent } from './components/dashboard-greeting/dashboard-greeting.component';
import { DashboardProductsComponent } from './components/dashboard-products/dashboard-products.component';
import { DashboardInsightsComponent } from './components/dashboard-insights/dashboard-insights.component';
import { DashboardSubscriptionComponent } from './components/dashboard-subscription/dashboard-subscription.component';
import { DashboardFooterComponent } from './components/dashboard-footer/dashboard-footer.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DashboardGreetingComponent,
    DashboardProductsComponent,
    DashboardInsightsComponent,
    DashboardSubscriptionComponent,
    DashboardFooterComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
// Standalone Parent Dashboard Component
export class DashboardComponent implements OnInit {
  private productService = inject(ProductService);

  readonly user = this.productService.currentUser;
  readonly productsCount = this.productService.productsCount;
  readonly productsLimit = this.productService.productsLimit;
  readonly progressPercent = this.productService.progressPercent;
  readonly inStockCount = this.productService.inStockCount;
  readonly lowStockCount = this.productService.lowStockCount;
  readonly outOfStockCount = this.productService.outOfStockCount;

  readonly loading = signal<boolean>(false);

  ngOnInit(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
    }, 600);
  }
}


