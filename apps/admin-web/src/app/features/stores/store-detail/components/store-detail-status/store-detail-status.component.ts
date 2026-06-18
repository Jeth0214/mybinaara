import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '../../../../../core/models/store.model';

@Component({
  selector: 'app-store-detail-status',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './store-detail-status.component.html',
  styleUrl: './store-detail-status.component.scss'
})
export class StoreDetailStatusComponent {
  readonly store = input.required<Store>();

  readonly suspend = output<void>();
  readonly reactivate = output<void>();
}
