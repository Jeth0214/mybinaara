import { Component, input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { Store } from '../../../core/models/store.model';

@Component({
  selector: 'app-store-map',
  templateUrl: './store-map.component.html',
  styleUrls: ['./store-map.component.scss'],
  standalone: true,
  imports: [IonIcon],
})
export class StoreMapComponent {
  store = input.required<Store>();

  openDirections(): void {
    const s = this.store();
    window.open(`https://maps.google.com/?q=${s.lat},${s.lng}`, '_system');
  }
}
