import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ReverseGeocodeResult {
  city: string;
  formattedAddress: string;
}

interface MapboxFeature {
  place_name: string;
  place_type: string[];
  text: string;
}

interface MapboxGeocodingResponse {
  features: MapboxFeature[];
}

@Injectable({ providedIn: 'root' })
export class MapboxGeocodingService {
  private readonly http = inject(HttpClient);

  reverseGeocode(lat: number, lng: number): Observable<ReverseGeocodeResult> {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json`;

    return this.http
      .get<MapboxGeocodingResponse>(url, {
        params: {
          access_token: environment.mapboxToken,
          types: 'place,address',
        },
      })
      .pipe(
        map((res) => this.toResult(res, lat, lng)),
        catchError(() =>
          new Observable<ReverseGeocodeResult>((subscriber) => {
            subscriber.next(this.fallbackResult(lat, lng));
            subscriber.complete();
          })
        )
      );
  }

  private toResult(response: MapboxGeocodingResponse, lat: number, lng: number): ReverseGeocodeResult {
    const features = response.features ?? [];
    const placeFeature = features.find((f) => f.place_type.includes('place'));
    const addressFeature = features.find((f) => f.place_type.includes('address')) ?? features[0];

    return {
      city: placeFeature?.text ?? '',
      formattedAddress: addressFeature?.place_name ?? this.fallbackResult(lat, lng).formattedAddress,
    };
  }

  private fallbackResult(lat: number, lng: number): ReverseGeocodeResult {
    return { city: '', formattedAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}` };
  }
}
