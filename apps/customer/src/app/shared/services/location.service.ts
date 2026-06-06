import { Injectable, signal } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

export interface Coords {
  lat: number;
  lng: number;
}

@Injectable({ providedIn: 'root' })
export class LocationService {
  readonly coords = signal<Coords | null>(null);
  readonly locationLabel = signal<string>('Locating...');
  readonly loading = signal<boolean>(true);
  readonly permissionDenied = signal<boolean>(false);

  private initializing = false;

  constructor() {
    this.loadCachedLocation();
  }

  private loadCachedLocation(): void {
    try {
      const cachedCoords = localStorage.getItem('binaara_coords');
      const cachedLabel = localStorage.getItem('binaara_location_label');
      if (cachedCoords && cachedLabel) {
        this.coords.set(JSON.parse(cachedCoords));
        this.locationLabel.set(cachedLabel);
        this.loading.set(false);
      }
    } catch (e) {
      console.warn('Failed to load cached location', e);
    }
  }

  async initialize(force = false): Promise<void> {
    if (this.initializing) return;
    this.initializing = true;

    const hasCached = this.coords() !== null;
    if (force || !hasCached) {
      this.loading.set(true);
      this.locationLabel.set('Locating...');
    }
    this.permissionDenied.set(false);

    try {
      await Geolocation.requestPermissions();
    } catch {
      // Web platform may not support this — continue anyway
    }

    try {
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: force ? 0 : 300000, // Use cached browser location if fresh, unless forced
      });
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const prevCoords = this.coords();
      let shouldGeocode = true;
      if (!force && prevCoords) {
        const distanceMoved = this.calculateDistance(prevCoords.lat, prevCoords.lng, lat, lng);
        if (distanceMoved < 0.5) {
          shouldGeocode = false;
          console.log(`Location change is negligible (${distanceMoved}km), skipping reverse geocoding`);
        }
      }

      this.coords.set({ lat, lng });
      localStorage.setItem('binaara_coords', JSON.stringify({ lat, lng }));

      if (shouldGeocode) {
        await this.reverseGeocode(lat, lng);
      } else {
        localStorage.setItem('binaara_location_label', this.locationLabel());
      }

      this.loading.set(false);
      this.initializing = false;
    } catch (err: unknown) {
      this.loading.set(false);
      this.initializing = false;
      const code = (err as GeolocationPositionError | null)?.code;
      if (code === GeolocationPositionError.PERMISSION_DENIED) {
        this.permissionDenied.set(true);
        this.locationLabel.set('Location access denied');
      } else {
        if (hasCached) {
          const cachedLabel = localStorage.getItem('binaara_location_label');
          if (cachedLabel) {
            this.locationLabel.set(cachedLabel);
          }
        } else {
          this.locationLabel.set('Location unavailable');
        }
      }
    }
  }

  private async reverseGeocode(lat: number, lng: number): Promise<void> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          signal: controller.signal,
          headers: {
            'User-Agent': 'mybinaara-app/1.0 (mybinaaraapp@gmail.com)',
            'Accept-Language': 'en',
          },
        }
      );
      clearTimeout(timeoutId);
      const data = await res.json();
      const addr = data.address ?? {};
      const city = addr.city ?? addr.town ?? addr.village ?? addr.county ?? '';
      const suburb = addr.suburb ?? addr.neighbourhood ?? addr.district ?? '';
      const label = city && suburb ? `${suburb}, ${city}` : city || suburb || 'Nearest location';
      this.locationLabel.set(label);
      localStorage.setItem('binaara_location_label', label);
    } catch {
      clearTimeout(timeoutId);
      const fallbackLabel = 'Nearest location';
      this.locationLabel.set(fallbackLabel);
      localStorage.setItem('binaara_location_label', fallbackLabel);
    }
  }

  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return Math.round(2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
  }
}