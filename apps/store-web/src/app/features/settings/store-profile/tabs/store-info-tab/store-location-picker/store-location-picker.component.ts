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
  // When a store's real location is already known at creation time (resolved
  // before this component is instantiated), start the map there directly.
  // Otherwise the map would first render at the arbitrary default center and then
  // `flyTo` across a potentially huge distance to the real location, which can
  // fail to fully load tiles for a long-haul flight.
  private readonly initialPin: PinPosition = (() => {
    const existing = this.existingLocation();
    if (existing) {
      return { lat: existing.latitude, lng: existing.longitude };
    }
    return { lat: environment.mapboxDefaultCenter.lat, lng: environment.mapboxDefaultCenter.lng };
  })();

  readonly mapCenter = signal<[number, number]>([this.initialPin.lng, this.initialPin.lat]);
  readonly markerPosition = signal<PinPosition>(this.initialPin);
  readonly markerLngLat = computed<[number, number]>(() => [this.markerPosition().lng, this.markerPosition().lat]);

  readonly city = signal<string>('');
  readonly formattedAddress = signal<string>('');
  readonly hasAddress = computed(() => !!this.formattedAddress());

  readonly locating = signal(false);
  readonly geocoding = signal(false);
  readonly locationNotice = signal<string | null>(null);

  /** True once the user has moved the pin themselves. Once set, the
   *  `existingLocation` resync effect below must stop overwriting their
   *  in-progress edit — otherwise a slow background refresh (e.g. Store
   *  Web's RefreshStore, dispatched on every tab visit) that resolves
   *  after the user has already dragged the pin snaps it back to the
   *  stale server value, silently discarding their change. */
  private readonly hasUserEdited = signal(false);

  constructor() {
    effect(() => {
      const { lat, lng } = this.markerPosition();
      const city = this.city();
      const formattedAddress = this.formattedAddress();

      // Skip the initial emit before any address has resolved.
      if (!city && !formattedAddress) return;

      this.locationChange.emit({ latitude: lat, longitude: lng, city, formattedAddress });
    });

    // Re-sync the pin/city/address whenever a fresh `existingLocation` comes in
    // from the parent — not just once at creation. Without this, a parent that
    // re-fetches and patches a new location into this input (e.g. Store Web's
    // RefreshStore, or Admin Web loading a different store into the same routed
    // component) would leave the map showing stale data indefinitely, since
    // Angular reuses this component instance instead of recreating it.
    effect(() => {
      const existing = this.existingLocation();
      if (existing && !this.hasUserEdited()) {
        const current = this.markerPosition();
        if (current.lat !== existing.latitude || current.lng !== existing.longitude) {
          this.setPin({ lat: existing.latitude, lng: existing.longitude }, { recenter: true, silent: true });
        }
        this.city.set(existing.city);
        this.formattedAddress.set(existing.formattedAddress);
      }
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

    // Deliberately no auto-geolocate fallback here: this tab always edits an
    // already-existing store, and the real location can arrive asynchronously
    // shortly after this component is created (e.g. right after activation,
    // before the first RefreshStore resolves). Browser geolocation is slow
    // enough that an automatic call here could resolve after the real location
    // and silently overwrite it — see the constructor effect above, which is
    // the sole source of truth for existing data. If the store genuinely has
    // no location yet, the vendor can use the "Use my current location" button.
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

  private setPin(pos: PinPosition, options: { recenter: boolean; silent?: boolean }): void {
    this.markerPosition.set(pos);
    if (options.recenter) {
      this.mapCenter.set([pos.lng, pos.lat]);
    }
    if (!options.silent) {
      this.hasUserEdited.set(true);
      this.pinChange$.next(pos);
    }
  }
}
