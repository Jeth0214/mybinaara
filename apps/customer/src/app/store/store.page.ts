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
import { MOCK_STORES } from '../core/data/mock-stores.data';
import { LocationService } from '../shared/services/location.service';
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

  store = signal<Store | null>(null);

  distance = computed<number | null>(() => {
    const s = this.store();
    const coords = this.locationService.coords();
    if (!s || !coords) return null;
    return this.locationService.calculateDistance(coords.lat, coords.lng, s.lat, s.lng);
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.store.set(MOCK_STORES.find((s) => s.id === id) ?? null);
  }

  goBack() {
    this.locationNav.back();
  }
}
