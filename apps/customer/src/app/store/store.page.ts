import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonIcon,
} from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { Store } from '../core/models/store.model';
import { LocationService } from '../shared/services/location.service';
import { StoreService } from '../shared/services/store.service';
import { StoreHeaderComponent } from './components/store-header/store-header.component';
import { StoreInfoComponent } from './components/store-info/store-info.component';
import { StoreMapComponent } from './components/store-map/store-map.component';
import { StoreActionsComponent } from './components/store-actions/store-actions.component';

@Component({
  selector: 'app-store',
  templateUrl: 'store.page.html',
  styleUrls: ['store.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonIcon,
    StoreHeaderComponent,
    StoreInfoComponent,
    StoreMapComponent,
    StoreActionsComponent,
  ],
})
export class StorePage implements OnInit {
  private route = inject(ActivatedRoute);
  private locationNav = inject(Location);
  private locationService = inject(LocationService);
  private storeService = inject(StoreService);

  store = signal<Store | null>(null);
  loading = signal<boolean>(true);
  error = signal<boolean>(false);

  distance = computed<number | null>(() => {
    const s = this.store();
    const coords = this.locationService.coords();
    if (!s || !coords || s.location.latitude === null || s.location.longitude === null) return null;
    return (
      s.distance_km ??
      this.locationService.calculateDistance(coords.lat, coords.lng, s.location.latitude, s.location.longitude)
    );
  });

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.storeService.getById(id).subscribe({
      next: (store) => {
        this.store.set(store);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }

  goBack() {
    this.locationNav.back();
  }
}
