import { Component, input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { Store } from '../../../core/models/store.model';

@Component({
  selector: 'app-store-info',
  templateUrl: './store-info.component.html',
  styleUrls: ['./store-info.component.scss'],
  standalone: true,
  imports: [IonIcon],
})
export class StoreInfoComponent {
  store = input.required<Store>();
  distance = input<number | null>(null);
}
