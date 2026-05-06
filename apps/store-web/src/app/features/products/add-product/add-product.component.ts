import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComingSoonComponent } from '../../../shared/ui/coming-soon/coming-soon.component';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [ComingSoonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-coming-soon
      title="Add Product"
      description="List a new product in your store with photos, pricing, and stock details." />
  `,
})
export class AddProductComponent {}
