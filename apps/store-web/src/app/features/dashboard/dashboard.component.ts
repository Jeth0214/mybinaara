import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComingSoonComponent } from '../../shared/ui/coming-soon/coming-soon.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ComingSoonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-coming-soon
      title="Dashboard"
      description="Your store overview — analytics, quick actions, and stock alerts." />
  `,
})
export class DashboardComponent {}
