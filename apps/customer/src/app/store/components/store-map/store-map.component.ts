import { Component, input, OnDestroy, AfterViewInit, effect } from '@angular/core';
import * as L from 'leaflet';
import { IonIcon } from '@ionic/angular/standalone';
import { Store } from '../../../core/models/store.model';
import { Coords } from '../../../shared/services/location.service';

@Component({
  selector: 'app-store-map',
  templateUrl: './store-map.component.html',
  styleUrls: ['./store-map.component.scss'],
  standalone: true,
  imports: [IonIcon],
})
export class StoreMapComponent implements AfterViewInit, OnDestroy {
  store = input.required<Store>();
  userCoords = input<Coords | null>(null);

  private map: L.Map | null = null;
  private userMarker: L.Marker | null = null;

  constructor() {
    effect(() => {
      const coords = this.userCoords();
      if (!coords || !this.map) return;
      if (this.userMarker) {
        this.userMarker.setLatLng([coords.lat, coords.lng]);
      } else {
        this.userMarker = L.marker([coords.lat, coords.lng], { icon: this.userIcon() })
          .addTo(this.map!)
          .bindPopup('You are here');
      }
      this.fitBounds(coords);
    });
  }

  ngAfterViewInit() {
    setTimeout(() => this.initMap(), 150);
  }

  ngOnDestroy() {
    this.map?.remove();
    this.map = null;
  }

  private initMap(): void {
    const s = this.store();
    this.map = L.map('store-map', {
      center: [s.lat, s.lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.map);

    L.marker([s.lat, s.lng], { icon: this.storeIcon() })
      .addTo(this.map)
      .bindPopup(s.name);

    const coords = this.userCoords();
    if (coords) {
      this.userMarker = L.marker([coords.lat, coords.lng], { icon: this.userIcon() })
        .addTo(this.map)
        .bindPopup('You are here');
      this.fitBounds(coords);
    }
  }

  private fitBounds(coords: Coords): void {
    const s = this.store();
    if (!this.map) return;
    this.map.fitBounds(
      [[s.lat, s.lng], [coords.lat, coords.lng]],
      { padding: [40, 40] }
    );
  }

  private storeIcon(): L.DivIcon {
    return L.divIcon({
      html: `<div class="map-pin map-pin--store"></div>`,
      className: '',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
  }

  private userIcon(): L.DivIcon {
    return L.divIcon({
      html: `<div class="map-pin map-pin--user"></div>`,
      className: '',
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
  }

  openDirections(): void {
    const s = this.store();
    window.open(`https://maps.google.com/?q=${s.lat},${s.lng}`, '_system');
  }
}