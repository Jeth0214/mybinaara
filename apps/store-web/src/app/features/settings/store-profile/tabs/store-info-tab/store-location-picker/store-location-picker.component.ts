import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, effect, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MapComponent, MarkerComponent } from 'ngx-mapbox-gl';
import mapboxgl, { type Marker, type MapMouseEvent } from 'mapbox-gl';

// Bundlers that re-process mapbox-gl's own worker bootstrapping (which self-extracts
// its worker script from the same chunk) can leave the worker without shared helpers.
// Pointing at the prebuilt CSP worker file sidesteps that self-extraction entirely.
mapboxgl.workerUrl = '/mapbox-gl-csp-worker.js';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { environment } from '../../../../../../../environments/environment';
import { GeolocationService } from '../../../../../../core/services/geolocation.service';
import { MapboxGeocodingService } from '../../../../../../core/services/mapbox-geocoding.service';
import { StoreLocation } from '../../../../../../core/models/store-location.model';

interface PinPosition {
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-store-location-picker',
  standalone: true,
  imports: [CommonModule, MapComponent, MarkerComponent],
  templateUrl: './store-location-picker.component.html',
  styleUrl: './store-location-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreLocationPickerComponent implements OnInit {
  readonly existingLocation = input<StoreLocation | undefined>(undefined);
  /** Emits the current pin/address whenever it settles, so the parent form
   *  can include it in the single unified "Save changes" submission instead
   *  of this component persisting it independently. */
  readonly locationChange = output<StoreLocation>();

  private readonly geolocationService = inject(GeolocationService);
  private readonly geocodingService = inject(MapboxGeocodingService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly pinChange$ = new Subject<PinPosition>();

  readonly mapboxToken = environment.mapboxToken;
  readonly mapZoom = environment.mapboxDefaultZoom;

  readonly mapViewMode = signal<'street' | 'satellite'>('street');
  readonly mapStyle = computed(() =>
    this.mapViewMode() === 'satellite'
      ? 'mapbox://styles/mapbox/satellite-streets-v12'
      : 'mapbox://styles/mapbox/streets-v12'
  );
  readonly mapCenter = signal<[number, number]>([
    environment.mapboxDefaultCenter.lng,
    environment.mapboxDefaultCenter.lat,
  ]);
  readonly markerPosition = signal<PinPosition>({
    lat: environment.mapboxDefaultCenter.lat,
    lng: environment.mapboxDefaultCenter.lng,
  });
  readonly markerLngLat = computed<[number, number]>(() => [this.markerPosition().lng, this.markerPosition().lat]);

  readonly city = signal<string>('');
  readonly formattedAddress = signal<string>('');
  readonly hasAddress = computed(() => !!this.formattedAddress());

  readonly locating = signal(false);
  readonly geocoding = signal(false);
  readonly locationNotice = signal<string | null>(null);

  constructor() {
    effect(() => {
      const { lat, lng } = this.markerPosition();
      const city = this.city();
      const formattedAddress = this.formattedAddress();

      // Skip the initial emit before any address has resolved.
      if (!city && !formattedAddress) return;

      this.locationChange.emit({ latitude: lat, longitude: lng, city, formattedAddress });
    });
  }

  ngOnInit(): void {
    this.pinChange$
      .pipe(
        debounceTime(400),
        distinctUntilChanged((a, b) => a.lat === b.lat && a.lng === b.lng),
        switchMap((pos) => {
          this.geocoding.set(true);
          return this.geocodingService.reverseGeocode(pos.lat, pos.lng);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((result) => {
        this.geocoding.set(false);
        this.city.set(result.city);
        this.formattedAddress.set(result.formattedAddress);
      });

    const existing = this.existingLocation();
    if (existing) {
      this.setPin({ lat: existing.latitude, lng: existing.longitude }, { recenter: true });
      this.city.set(existing.city);
      this.formattedAddress.set(existing.formattedAddress);
      return;
    }

    this.locateUser();
  }

  setMapViewMode(mode: 'street' | 'satellite'): void {
    this.mapViewMode.set(mode);
  }

  locateUser(): void {
    this.locating.set(true);
    this.locationNotice.set(null);
    this.geolocationService.getCurrentPosition().subscribe({
      next: (coords) => {
        this.locating.set(false);
        this.setPin(coords, { recenter: true });
      },
      error: (err: Error) => {
        this.locating.set(false);
        this.locationNotice.set(err.message);
      },
    });
  }

  onMapClick(event: MapMouseEvent): void {
    this.setPin({ lat: event.lngLat.lat, lng: event.lngLat.lng }, { recenter: false });
  }

  onMarkerDragEnd(marker: Marker): void {
    const { lat, lng } = marker.getLngLat();
    this.setPin({ lat, lng }, { recenter: false });
  }

  private setPin(pos: PinPosition, options: { recenter: boolean }): void {
    this.markerPosition.set(pos);
    if (options.recenter) {
      this.mapCenter.set([pos.lng, pos.lat]);
    }
    this.pinChange$.next(pos);
  }
}
