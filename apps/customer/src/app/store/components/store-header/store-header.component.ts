import { Component, input, computed } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { Store } from '../../../core/models/store.model';

const SAUDI_ARABIA_SUFFIX = /,?\s*Saudi Arabia\s*$/i;

@Component({
  selector: 'app-store-header',
  templateUrl: './store-header.component.html',
  styleUrls: ['./store-header.component.scss'],
  standalone: true,
  imports: [IonIcon],
})
export class StoreHeaderComponent {
  store = input.required<Store>();

  displayAddress = computed(() => {
    const s = this.store();
    const address = s.location.formatted_address;
    if (address) {
      return address.replace(SAUDI_ARABIA_SUFFIX, '');
    }
    return s.location.city ?? '';
  });
}
