import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StoreUser } from '../../../../core/models/auth.model';

@Component({
  selector: 'app-dashboard-subscription',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-subscription.component.html',
  styleUrl: './dashboard-subscription.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardSubscriptionComponent {
  user = input<StoreUser | null>(null);
  productsLimit = input<number>(0);

  getNextPaymentDate(): string {
    const user = this.user();
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
