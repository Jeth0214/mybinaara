import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComingSoonComponent } from '../../../shared/ui/coming-soon/coming-soon.component';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [ComingSoonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-coming-soon
      title="Subscription"
      description="View your current plan, usage limits, and upgrade options." />
  `,
})
export class SubscriptionComponent {}
