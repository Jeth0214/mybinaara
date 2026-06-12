import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngxs/store';
import { AuthState } from '../../../../../core/state/auth.state';
import { UpgradeSubscription } from '../../../../../core/state/auth.actions';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../../../../core/services/toast.service';

import { ProductService } from '../../../../../core/services/product.service';

@Component({
  selector: 'app-store-subscription-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './store-subscription-tab.component.html',
  styleUrl: './store-subscription-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreSubscriptionTabComponent {
  private store = inject(Store);
  private modalService = inject(NgbModal);
  private toastService = inject(ToastService);
  private productService = inject(ProductService);

  // State Signals
  readonly currentUser = this.store.selectSignal(AuthState.user);
  readonly selectedPlan = signal<'Free' | 'Pro' | 'Enterprise' | null>(null);

  readonly productsCount = this.productService.productsCount;
  readonly productsLimit = this.productService.productsLimit;
  readonly progressPercent = this.productService.progressPercent;
  readonly slotsRemaining = this.productService.slotsRemaining;

  confirmUpgrade(plan: 'Free' | 'Pro' | 'Enterprise', content: any): void {
    this.selectedPlan.set(plan);
    this.modalService.open(content, { centered: true }).result.then(
      (result) => {
        if (result === 'confirm') {
          this.onUpgradePlan(plan);
        }
        this.selectedPlan.set(null);
      },
      () => {
        this.selectedPlan.set(null);
      }
    );
  }

  onUpgradePlan(plan: 'Free' | 'Pro' | 'Enterprise'): void {
    this.store.dispatch(new UpgradeSubscription(plan)).subscribe({
      next: () => {
        this.toastService.success(`Successfully switched plan to ${plan}!`);
      },
      error: (err) => {
        console.error('Failed to upgrade plan:', err);
        this.toastService.error(err?.message || 'Failed to change subscription.');
      }
    });
  }

  getNextPaymentDate(): string {
    const user = this.currentUser();
    if (!user || !user.subscriptionPlan || user.subscriptionPlan === 'Free') {
      return 'Forever Free';
    }
    const subDate = user.subscriptionDate ? new Date(user.subscriptionDate) : new Date();
    const nextPayment = new Date(subDate);
    nextPayment.setDate(nextPayment.getDate() + 30);
    return nextPayment.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
