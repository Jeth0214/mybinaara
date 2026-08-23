import { Component, input, computed } from '@angular/core';
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

  hasWhatsApp = computed(() => !!this.store().contact?.whatsapp);
  hasPhone = computed(() => !!this.store().contact?.phone);
  hasLocation = computed(() => {
    const loc = this.store().location;
    return loc.latitude !== null && loc.longitude !== null;
  });

  openWhatsApp(): void {
    const whatsapp = this.store().contact?.whatsapp;
    if (!whatsapp) return;
    const num = whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/${num}`, '_system');
  }

  callStore(): void {
    const phone = this.store().contact?.phone;
    if (!phone) return;
    window.open(`tel:${phone}`, '_system');
  }

  getDirections(): void {
    const { latitude, longitude } = this.store().location;
    if (latitude === null || longitude === null) return;
    window.open(`https://maps.google.com/?q=${latitude},${longitude}`, '_system');
  }
}
