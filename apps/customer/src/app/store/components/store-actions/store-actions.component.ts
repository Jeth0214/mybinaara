import { Component, input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { Store } from '../../../core/models/store.model';

@Component({
  selector: 'app-store-actions',
  templateUrl: './store-actions.component.html',
  styleUrls: ['./store-actions.component.scss'],
  standalone: true,
  imports: [IonIcon],
})
export class StoreActionsComponent {
  store = input.required<Store>();

  openWhatsApp(): void {
    const num = this.store().whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/${num}`, '_system');
  }

  callStore(): void {
    window.open(`tel:${this.store().phone}`, '_system');
  }

  getDirections(): void {
    const s = this.store();
    window.open(`https://maps.google.com/?q=${s.lat},${s.lng}`, '_system');
  }
}
