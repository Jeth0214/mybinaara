import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '../../../../../core/models/store.model';

@Component({
  selector: 'app-store-detail-subscription',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './store-detail-subscription.component.html',
  styles: [`
    .fs-8 {
      font-size: 0.72rem;
      letter-spacing: 0.02rem;
    }
  `]
})
export class StoreDetailSubscriptionComponent {
  readonly store = input.required<Store>();

  readonly changePlan = output<'basic' | 'premium' | 'enterprise'>();

  onPlanChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as 'basic' | 'premium' | 'enterprise';
    this.changePlan.emit(value);
  }
}
