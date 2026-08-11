import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

const ERROR_MESSAGES: Record<number, string> = {
  1: 'Location access was denied. You can still set the store location manually on the map.',
  2: 'Current location could not be determined. You can still set the store location manually on the map.',
  3: 'Locating you took too long. You can still set the store location manually on the map.',
};

@Injectable({ providedIn: 'root' })
export class GeolocationService {
  getCurrentPosition(): Observable<GeoCoordinates> {
    return new Observable<GeoCoordinates>((subscriber) => {
      if (!('geolocation' in navigator)) {
        subscriber.error(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          subscriber.next({ lat: position.coords.latitude, lng: position.coords.longitude });
          subscriber.complete();
        },
        (error) => {
          subscriber.error(new Error(ERROR_MESSAGES[error.code] ?? 'Unable to retrieve your location.'));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }
}
