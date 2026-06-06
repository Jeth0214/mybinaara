import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComingSoonComponent } from '../../../shared/ui/coming-soon/coming-soon.component';

@Component({
  selector: 'app-store-profile',
  standalone: true,
  imports: [ComingSoonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-coming-soon
      title="Store Profile"
      description="Edit your store name, location, contact details, and branding." />
  `,
})
export class StoreProfileComponent {}
