import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComingSoonComponent } from '../../shared/ui/coming-soon/coming-soon.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [ComingSoonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-coming-soon
      title="My Products"
      description="Browse and manage all the products listed in your store." />
  `,
})
export class ProductsComponent {}
