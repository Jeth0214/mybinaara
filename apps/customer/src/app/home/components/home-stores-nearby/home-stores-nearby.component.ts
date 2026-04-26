import { Component, input, computed, inject } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { Store } from '../../../core/models/store.model';
import { LocationService } from '../../../shared/services/location.service';
import { Router } from '@angular/router';

interface StoreWithDistance extends Store {
  distanceKm: number;
}

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
    return this.stores()
      .map((store) => ({
        ...store,
        distanceKm: coords
          ? this.locationService.calculateDistance(coords.lat, coords.lng, store.lat, store.lng)
          : 0,
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  });

  navigateToStore(storeId: string) {
    this.router.navigate(['/store', storeId]);
  }
}