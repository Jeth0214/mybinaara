import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-products.component.html',
  styleUrl: './dashboard-products.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardProductsComponent {
  productsCount = input<number>(0);
  productsLimit = input<number>(0);
  remainingCount = input<number>(0);
  progressPercent = input<number>(0);
  inStockCount = input<number>(0);
  lowStockCount = input<number>(0);
  outOfStockCount = input<number>(0);

  readonly isLimitReached = computed(() => this.productsCount() >= this.productsLimit());

  readonly progressBarColorClass = computed(() => {
    const percent = this.progressPercent();
    if (percent >= 100) return 'bg-danger';
    if (percent >= 80) return 'bg-warning-custom';
    return 'bg-success-custom';
  });
}
