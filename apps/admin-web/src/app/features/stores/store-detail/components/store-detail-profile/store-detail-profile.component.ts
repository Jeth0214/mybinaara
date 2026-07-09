import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Store } from '../../../../../core/models/store.model';

@Component({
  selector: 'app-store-detail-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './store-detail-profile.component.html',
  styles: [`
    .fs-8 {
      font-size: 0.72rem;
      letter-spacing: 0.02rem;
    }
  `]
})
export class StoreDetailProfileComponent {
  readonly store = input.required<Store>();

  getCleanWhatsappLink(whatsapp: string): string {
    const cleanNumber = whatsapp.replace(/[+\s]/g, '');
    return `https://wa.me/${cleanNumber}`;
  }
}

