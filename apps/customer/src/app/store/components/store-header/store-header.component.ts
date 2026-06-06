import { Component, input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { Store } from '../../../core/models/store.model';

@Component({
  selector: 'app-store-header',
  templateUrl: './store-header.component.html',
  styleUrls: ['./store-header.component.scss'],
  standalone: true,
  imports: [IonIcon],
})
export class StoreHeaderComponent {
  store = input.required<Store>();
}
