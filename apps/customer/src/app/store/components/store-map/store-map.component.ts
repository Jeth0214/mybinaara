import { Component, input, computed, inject, signal } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { MapComponent, MarkerComponent } from 'ngx-mapbox-gl';
import mapboxgl from 'mapbox-gl';

// Same CSP worker workaround as store-web/admin-web's location picker — see
// mapbox-gl-csp-worker.js asset copy in angular.json.
mapboxgl.workerUrl = '/mapbox-gl-csp-worker.js';

import { Store } from '../../../core/models/store.model';
import { LocationService } from '../../../shared/services/location.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-store-map',
  templateUrl: './store-map.component.html',
  styleUrls: ['./store-map.component.scss'],
  standalone: true,
  imports: [IonIcon, MapComponent, MarkerComponent],
})
export class StoreMapComponent {
  store = input.required<Store>();

  private locationService = inject(LocationService);

  readonly mapboxToken = environment.mapboxToken;
  readonly mapZoom = environment.mapboxDefaultZoom;
  readonly fitBoundsOptions = { padding: 60, maxZoom: 15 };

  readonly mapViewMode = signal<'street' | 'satellite'>('street');
  readonly mapStyle = computed(() =>
    this.mapViewMode() === 'satellite'
      ? 'mapbox://styles/mapbox/satellite-streets-v12'
      : 'mapbox://styles/mapbox/streets-v12'
  );

  storeLngLat = computed<[number, number] | null>(() => {
    const { latitude, longitude } = this.store().location;
    return latitude !== null && longitude !== null ? [longitude, latitude] : null;
  });

  userLngLat = computed<[number, number] | null>(() => {
    const coords = this.locationService.coords();
    return coords ? [coords.lng, coords.lat] : null;
  });

  mapCenter = computed<[number, number]>(() => this.storeLngLat() ?? [39.1875, 21.5724]);

  bounds = computed<[[number, number], [number, number]] | undefined>(() => {
    const store = this.storeLngLat();
    const user = this.userLngLat();
    return store && user ? [store, user] : undefined;
  });

  setMapViewMode(mode: 'street' | 'satellite'): void {
    this.mapViewMode.set(mode);
  }
}
