import { Component, input, computed, inject } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { Store } from '../../../core/models/store.model';
import { LocationService } from '../../../shared/services/location.service';
import { Router } from '@angular/router';

interface StoreWithDistance extends Store {
  distanceKm: number | null;
  displayAddress: string;
}

const SAUDI_ARABIA_SUFFIX = /,?\s*Saudi Arabia\s*$/i;

@Component({
  selector: 'app-home-stores-nearby',
  templateUrl: './home-stores-nearby.component.html',
  styleUrls: ['./home-stores-nearby.component.scss'],
  standalone: true,
  imports: [IonIcon],
})
export class HomeStoresNearbyComponent {
  stores = input<Store[]>([]);

  private locationService = inject(LocationService);
  private router = inject(Router);

  displayStores = computed<StoreWithDistance[]>(() => {
    const coords = this.locationService.coords();

    return this.stores().map((store) => ({
      ...store,
      distanceKm:
        store.distance_km ??
        (coords
          ? this.locationService.calculateDistance(
              coords.lat,
              coords.lng,
              store.location.latitude ?? 0,
              store.location.longitude ?? 0
            )
          : null),
      displayAddress: this.formatAddress(store),
    }));
  });

  navigateToStore(storeId: number) {
    this.router.navigate(['/store', storeId]);
  }

  private formatAddress(store: Store): string {
    const address = store.location.formatted_address;
    if (address) {
      return address.replace(SAUDI_ARABIA_SUFFIX, '');
    }
    return store.location.city ?? '';
  }
}
