import { ChangeDetectionStrategy, Component, computed, inject, input, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatStepperModule } from '@angular/material/stepper';
import { Subscription } from 'rxjs';
import { AddressService, CityData, DistrictData } from '../../../../../core/services/address.service';

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
  /** Legacy stores may have a free-text city/district name but no city_id/district_id yet. */
  readonly legacyCityName = input<string | null>(null);
  readonly legacyDistrictName = input<string | null>(null);
  /** Set by the vendor post-activation; read-only display, never editable from the Admin Portal. */
  readonly latitude = input<number | null>(null);
  readonly longitude = input<number | null>(null);

  private readonly addressService = inject(AddressService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly sub = new Subscription();

  readonly saudiCities = signal<CityData[]>([]);
  readonly saudiDistricts = signal<DistrictData[]>([]);

  readonly mapPreviewUrl = computed<SafeResourceUrl | null>(() => {
    const lat = this.latitude();
    const lng = this.longitude();
    if (lat === null || lng === null) return null;

    const url = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

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
    this.saudiCities.set(this.addressService.getCities());

    const locationGroup = this.form().get('location') as FormGroup;
    const cityIdCtrl = locationGroup.get('city_id');
    const districtIdCtrl = locationGroup.get('district_id');

    // Legacy fallback: resolve a free-text city/district name to an id for prefill (edit mode only).
    if (!cityIdCtrl?.value && this.legacyCityName()) {
      const matchedCity = this.addressService.findCityByName(this.legacyCityName()!);
      if (matchedCity) {
        cityIdCtrl?.setValue(matchedCity.city_id);
        this.saudiDistricts.set(this.addressService.getDistrictsByCity(matchedCity.city_id));

        if (!districtIdCtrl?.value && this.legacyDistrictName()) {
          const matchedDistrict = this.addressService.findDistrictByName(matchedCity.city_id, this.legacyDistrictName()!);
          if (matchedDistrict) {
            districtIdCtrl?.setValue(matchedDistrict.district_id);
          }
        }
      }
    } else if (cityIdCtrl?.value) {
      this.saudiDistricts.set(this.addressService.getDistrictsByCity(cityIdCtrl.value));
    }

    // Selecting a new city clears any district that doesn't belong to it.
    this.sub.add(
      cityIdCtrl?.valueChanges.subscribe((cityId: number | null) => {
        if (!cityId) {
          this.saudiDistricts.set([]);
          districtIdCtrl?.setValue(null);
          return;
        }

        const districts = this.addressService.getDistrictsByCity(cityId);
        this.saudiDistricts.set(districts);

        const currentDistrictId = districtIdCtrl?.value;
        if (currentDistrictId && !districts.some((d) => d.district_id === currentDistrictId)) {
          districtIdCtrl?.setValue(null);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
