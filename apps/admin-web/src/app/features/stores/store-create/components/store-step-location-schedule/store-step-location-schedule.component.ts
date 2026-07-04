import { ChangeDetectionStrategy, Component, inject, input, signal, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatStepperModule } from '@angular/material/stepper';
import { Subscription } from 'rxjs';
import { AddressService, CityData, DistrictData } from '../../../../../core/services/address.service';
import { GeocodingService } from '../../../../../core/services/geocoding.service';
import { OpenLocationCode } from '../../../../../core/utils/open-location-code';

@Component({
  selector: 'app-store-step-location-schedule',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatStepperModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './store-step-location-schedule.component.html',
  styleUrl: './store-step-location-schedule.component.scss'
})
export class StoreStepLocationScheduleComponent implements OnInit, OnDestroy {
  readonly form = input.required<FormGroup>();

  private readonly addressService = inject(AddressService);
  private readonly geocodingService = inject(GeocodingService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly sub = new Subscription();

  // Address inputs state
  readonly geocoding = signal<boolean>(false);
  readonly geocodeError = signal<string | null>(null);
  readonly safeMapUrl = signal<SafeResourceUrl | null>(null);

  readonly plusCodeError = signal<string | null>(null);
  readonly saudiCities = signal<CityData[]>([]);
  readonly saudiDistricts = signal<DistrictData[]>([]);

  // Days list for working hours
  readonly days: Array<{ key: 'sat' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri'; label: string }> = [
    { key: 'sat', label: 'Sat' },
    { key: 'sun', label: 'Sun' },
    { key: 'mon', label: 'Mon' },
    { key: 'tue', label: 'Tue' },
    { key: 'wed', label: 'Wed' },
    { key: 'thu', label: 'Thu' },
    { key: 'fri', label: 'Fri' },
  ];

  // Generated time slots in 30-minute intervals for select inputs
  readonly timeSlots: string[] = (() => {
    const slots: string[] = [];
    const periods = ['AM', 'PM'];
    for (let p = 0; p < 2; p++) {
      const period = periods[p];
      slots.push(`12:00 ${period}`);
      slots.push(`12:30 ${period}`);
      for (let h = 1; h <= 11; h++) {
        const hourStr = h.toString().padStart(2, '0');
        slots.push(`${hourStr}:00 ${period}`);
        slots.push(`${hourStr}:30 ${period}`);
      }
    }
    return slots;
  })();

  ngOnInit(): void {
    this.saudiCities.set(this.addressService.getRegions().length > 0 ? this.addressService.getCities() : []);

    const locationGroup = this.form().get('location') as FormGroup;
    const cityCtrl = locationGroup.get('city');
    const districtCtrl = locationGroup.get('district');
    const latitudeCtrl = locationGroup.get('latitude');
    const longitudeCtrl = locationGroup.get('longitude');

    // Helper to update map URL dynamically
    const updateMapUrl = () => {
      const lat = latitudeCtrl?.value;
      const lng = longitudeCtrl?.value;
      if (lat !== null && lat !== undefined && lng !== null && lng !== undefined && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
        const url = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
        this.safeMapUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
      } else {
        this.safeMapUrl.set(null);
      }
    };

    // Initialize map URL
    updateMapUrl();

    // Listen for coordinate changes to update map
    if (latitudeCtrl) {
      this.sub.add(latitudeCtrl.valueChanges.subscribe(() => updateMapUrl()));
    }
    if (longitudeCtrl) {
      this.sub.add(longitudeCtrl.valueChanges.subscribe(() => updateMapUrl()));
    }

    // Populate districts initially if a city is already selected
    if (cityCtrl?.value) {
      const matchedCity = this.addressService.findCityByName(cityCtrl.value);
      if (matchedCity) {
        this.saudiDistricts.set(this.addressService.getDistrictsByCity(matchedCity.city_id));
        districtCtrl?.enable();
      }
    }

    // Listen for city dropdown changes to cascade districts selection
    if (cityCtrl) {
      this.sub.add(
        cityCtrl.valueChanges.subscribe((cityName: string) => {
          if (!cityName) {
            districtCtrl?.setValue('');
            districtCtrl?.disable();
            this.saudiDistricts.set([]);
          } else {
            const matchedCity = this.addressService.findCityByName(cityName);
            if (matchedCity) {
              this.saudiDistricts.set(this.addressService.getDistrictsByCity(matchedCity.city_id));
              districtCtrl?.enable();
            } else {
              districtCtrl?.setValue('');
              districtCtrl?.disable();
              this.saudiDistricts.set([]);
            }
          }
          this.cdr.markForCheck();
        })
      );
    }

  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }



  // Geocode Address & Preview
  triggerGeocodeAddress(): void {
    const locationGroup = this.form().get('location') as FormGroup;
    const buildingNumber = locationGroup.get('building_number')?.value;
    const streetName = locationGroup.get('street_name')?.value;
    const district = locationGroup.get('district')?.value;
    const city = locationGroup.get('city')?.value;
    const postalCode = locationGroup.get('postal_code')?.value;
    const additionalNumber = locationGroup.get('additional_number')?.value;
    const country = locationGroup.get('country')?.value || 'Saudi Arabia';

    if (!city) {
      this.geocodeError.set('Please select a City first.');
      return;
    }

    this.geocoding.set(true);
    this.geocodeError.set(null);

    const line1 = `${buildingNumber || ''} ${streetName || ''}`.trim();
    const line2 = district || '';
    const line3 = `${city} ${postalCode || ''}${postalCode && additionalNumber ? ' - ' + additionalNumber : ''}`.trim();
    const line4 = country;
    const fullAddress = [line1, line2, line3, line4].filter(Boolean).join(',\n');

    const addressParts = [
      streetName,
      district,
      city,
      country
    ].filter(Boolean);
    const searchQuery = addressParts.join(', ');

    this.geocodingService.geocodeAddress(searchQuery, city).subscribe({
      next: (coords) => {
        let resolvedLat = coords.lat;
        let resolvedLng = coords.lng;

        // Apply a small deterministic offset based on building number to simulate exact mapping along the street
        if (buildingNumber) {
          const num = parseInt(buildingNumber.replace(/\D/g, ''), 10) || 0;
          const latOffset = ((num % 50) - 25) * 0.000005;
          const lngOffset = (((num * 13) % 50) - 25) * 0.000005;
          resolvedLat += latOffset;
          resolvedLng += lngOffset;
        }

        locationGroup.patchValue({
          latitude: resolvedLat,
          longitude: resolvedLng,
          fullAddress: fullAddress
        });
        this.geocoding.set(false);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.geocodeError.set(err.message || 'Geocoding failed.');
        this.geocoding.set(false);
        this.cdr.markForCheck();
      }
    });
  }

  usePreset(preset: { city: string; district: string; streetName: string; buildingNumber: string; postalCode: string; additionalNumber: string; lat: number; lng: number; plusCode?: string }): void {
    const locationGroup = this.form().get('location') as FormGroup;
    locationGroup.get('district')?.enable();

    const line1 = `${preset.buildingNumber} ${preset.streetName}`.trim();
    const line2 = preset.district;
    const line3 = `${preset.city} ${preset.postalCode} - ${preset.additionalNumber}`.trim();
    const line4 = 'Saudi Arabia';
    const fullAddress = [line1, line2, line3, line4].filter(Boolean).join(',\n');

    locationGroup.patchValue({
      country: 'Saudi Arabia',
      city: preset.city,
      district: preset.district,
      building_number: preset.buildingNumber,
      street_name: preset.streetName,
      postal_code: preset.postalCode,
      additional_number: preset.additionalNumber,
      fullAddress: fullAddress,
      latitude: preset.lat,
      longitude: preset.lng,
      plus_code: preset.plusCode || ''
    });
    this.cdr.markForCheck();
  }
  resolvePlusCode(): void {
    const locationGroup = this.form().get('location') as FormGroup;
    const rawVal = (locationGroup.get('plus_code')?.value || '').trim();
    this.plusCodeError.set(null);

    if (!rawVal) {
      this.plusCodeError.set('Please enter a Plus Code (e.g. 7G35+XJ Jeddah).');
      return;
    }

    const parts = rawVal.split(/\s+/);
    // Find the token that matches the Plus Code regex
    const plusCodeToken = parts.find((p: string) => /^[23456789CFGHJMPQRVWX]+\+/i.test(p));
    const cityToken = parts.filter((p: string) => p !== plusCodeToken).join(' ');

    if (!plusCodeToken) {
      this.plusCodeError.set('Invalid Plus Code format (e.g. 7G35+XJ).');
      return;
    }

    this.geocoding.set(true);

    if (OpenLocationCode.isFull(plusCodeToken)) {
      try {
        const decoded = OpenLocationCode.decode(plusCodeToken);
        this.processResolvedCoords(decoded.latitudeCenter, decoded.longitudeCenter, plusCodeToken);
      } catch (err: any) {
        this.plusCodeError.set(err.message || 'Failed to decode Plus Code.');
        this.geocoding.set(false);
        this.cdr.markForCheck();
      }
    } else {
      if (!cityToken) {
        this.plusCodeError.set('Please include the city name (e.g., 7G35+XJ Jeddah) to resolve a short Plus Code.');
        this.geocoding.set(false);
        return;
      }

      this.geocodingService.geocodeAddress(cityToken).subscribe({
        next: (refCoords) => {
          try {
            const fullCode = OpenLocationCode.recoverNearest(plusCodeToken, refCoords.lat, refCoords.lng);
            const decoded = OpenLocationCode.decode(fullCode);
            this.processResolvedCoords(decoded.latitudeCenter, decoded.longitudeCenter, fullCode);
          } catch (err: any) {
            this.plusCodeError.set(err.message || 'Failed to resolve Plus Code.');
            this.geocoding.set(false);
            this.cdr.markForCheck();
          }
        },
        error: (err) => {
          this.plusCodeError.set(`Could not find coordinates for city: "${cityToken}".`);
          this.geocoding.set(false);
          this.cdr.markForCheck();
        }
      });
    }
  }

  private processResolvedCoords(lat: number, lng: number, fullCode: string): void {
    const locationGroup = this.form().get('location') as FormGroup;

    // Retrieve manual address fields to update fullAddress
    const buildingNumber = locationGroup.get('building_number')?.value;
    const streetName = locationGroup.get('street_name')?.value;
    const district = locationGroup.get('district')?.value;
    const city = locationGroup.get('city')?.value;
    const postalCode = locationGroup.get('postal_code')?.value;
    const additionalNumber = locationGroup.get('additional_number')?.value;
    const country = locationGroup.get('country')?.value || 'Saudi Arabia';

    const line1 = `${buildingNumber || ''} ${streetName || ''}`.trim();
    const line2 = district || '';
    const line3 = `${city} ${postalCode || ''}${postalCode && additionalNumber ? ' - ' + additionalNumber : ''}`.trim();
    const line4 = country;
    const fullAddress = [line1, line2, line3, line4].filter(Boolean).join(',\n');

    locationGroup.patchValue({
      latitude: lat,
      longitude: lng,
      fullAddress: fullAddress
    });

    this.geocoding.set(false);
    this.cdr.markForCheck();
  }

}
