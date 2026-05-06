import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComingSoonComponent } from '../../shared/ui/coming-soon/coming-soon.component';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [ComingSoonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-coming-soon
      title="Search Insights"
      description="See what customers are searching for and how your products are performing." />
  `,
})
export class AnalyticsComponent {}
