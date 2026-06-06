import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComingSoonComponent } from '../../../shared/ui/coming-soon/coming-soon.component';

@Component({
  selector: 'app-update-stock',
  standalone: true,
  imports: [ComingSoonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-coming-soon
      title="Update Stock"
      description="Quickly adjust inventory levels to keep your listings accurate." />
  `,
})
export class UpdateStockComponent {}
