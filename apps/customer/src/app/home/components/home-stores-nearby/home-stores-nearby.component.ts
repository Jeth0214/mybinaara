import { Component, input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { Store } from '../../../core/models/store.model';

@Component({
  selector: 'app-home-stores-nearby',
  templateUrl: './home-stores-nearby.component.html',
  styleUrls: ['./home-stores-nearby.component.scss'],
  standalone: true,
  imports: [IonIcon],
})
export class HomeStoresNearbyComponent {
  stores = input<Store[]>([]);
}
