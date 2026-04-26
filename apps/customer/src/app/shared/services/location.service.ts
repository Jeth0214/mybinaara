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

  async initialize(): Promise<void> {
    this.loading.set(true);
    this.permissionDenied.set(false);
    this.locationLabel.set('Locating...');

    try {
      await Geolocation.requestPermissions();
    } catch {
      // Web platform may not support this — continue anyway
    }

    try {
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 8000,
      });
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      console.log('Got location:', lat, lng);
      this.coords.set({ lat, lng });
      await this.reverseGeocode(lat, lng);
      this.loading.set(false);
    } catch (err: unknown) {
      this.loading.set(false);
      const code = (err as GeolocationPositionError | null)?.code;
      if (code === GeolocationPositionError.PERMISSION_DENIED) {
        this.permissionDenied.set(true);
        this.locationLabel.set('Location access denied');
      } else {
        this.locationLabel.set('Location unavailable');
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
      console.log(data);
      const addr = data.address ?? {};
      const city = addr.city ?? addr.town ?? addr.village ?? addr.county ?? '';
      const suburb = addr.suburb ?? addr.neighbourhood ?? addr.district ?? '';
      this.locationLabel.set(
        city && suburb ? `${suburb}, ${city}` : city || suburb || 'Nearest location'
      );
    } catch {
      clearTimeout(timeoutId);
      this.locationLabel.set('Nearest location'); 
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