import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '../../../../../core/models/store.model';

@Component({
  selector: 'app-store-detail-credentials',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './store-detail-credentials.component.html',
  styles: [`
    .fs-8 {
      font-size: 0.72rem;
      letter-spacing: 0.02rem;
    }
  `]
})
export class StoreDetailCredentialsComponent {
  readonly store = input.required<Store>();
}
